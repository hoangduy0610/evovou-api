import { Constant, EEnvName } from '@/commons/Constant';
import { User, Voucher, VoucherDenomination } from '@/entities';
import { EnumVoucherStatus } from '@/enums/EnumVoucherStatus';
import { roundToNearestValue } from '@/utils/NumberUtils';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import moment from 'moment';
import { Repository } from 'typeorm';

@Injectable()
export class BlockchainService implements OnModuleInit {
    static canInitNFTListener = true;
    static voucherValues: number[] = [];
    private readonly logger = new Logger(BlockchainService.name);

    private provider: ethers.Provider;
    private contract: ethers.Contract;
    private adminWallet: ethers.Wallet;


    private readonly EXCHANGE_RATE = 46760000; // 1 ETH = 46,760,000 VND

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Voucher) private readonly voucherRepository: Repository<Voucher>,
        @InjectRepository(VoucherDenomination) private readonly voucherDenominationRepository: Repository<VoucherDenomination>
    ) { }

    onModuleInit() {
        if (BlockchainService.canInitNFTListener) {
            BlockchainService.canInitNFTListener = false;
            setTimeout(() => {
                this.syncVoucherDenominations()
                    .catch((error) => {
                        this.logger.error("Error initializing NFT event listener:", error);
                    });
            }, 1000)
        }
    }

    async syncVoucherDenominations() {
        const voucherDenominations = await this.voucherDenominationRepository.find({ withDeleted: false });
        BlockchainService.voucherValues = voucherDenominations.map((denomination) => denomination.value);
        this.initializeBlockchain();
    }

    private initializeBlockchain() {
        try {
            const rpcUrl = Constant.getEnv(EEnvName.WS_RPC_URL)
            const contractAddress = Constant.getEnv(EEnvName.NFT_CONTRACT_ADDRESS);
            const adminPrivateKey = Constant.getEnv(EEnvName.ADMIN_PRIVATE_KEY);

            this.provider = new ethers.WebSocketProvider(rpcUrl);
            this.adminWallet = new ethers.Wallet(adminPrivateKey, this.provider);

            const abi = [
                "function purchaseVoucher(string tokenURI) payable external returns (uint256)",
                "function generateVoucherToAddress(address recipient, string tokenURI, uint256 amountEth) external returns (uint256)",
                "function redeemVoucher(uint256 tokenId) external",
                "function getMyVouchers() view external returns (tuple(address owner, uint256 tokenId, uint256 amountEth, uint256 amountVnd)[])",
                "function getVouchersOf(address user) view external returns (tuple(address owner, uint256 tokenId, uint256 amountEth, uint256 amountVnd)[])",
                "function withdraw() external",
                "function exists(uint256 tokenId) view external returns (bool)",
                "function getVoucher(uint256 tokenId) view external returns (tuple(address owner, uint256 tokenId, uint256 amountEth, uint256 amountVnd))",
                "function transferVoucher(uint256 tokenId, address to) external",
                "function tokenCounter() view external returns (uint256)",
                "event VoucherPurchased(address indexed buyer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)",
                "event VoucherRedeemed(address indexed redeemer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)",
                "event VoucherTransferred(uint256 tokenId, address from, address to)"
            ];

            this.contract = new ethers.Contract(
                contractAddress,
                abi,
                this.adminWallet
            );

            this.contract.removeAllListeners();
            this.contract.on("VoucherPurchased", (buyer, tokenId, amountETH, amountVND) => this.handlePurchasedVoucher(buyer, tokenId, amountETH, amountVND));
            this.contract.on("VoucherRedeemed", (redeemer, tokenId, amountETH, amountVND) => this.handleRedeemedVoucher(redeemer, tokenId, amountETH, amountVND));
            this.contract.on("VoucherTransferred", (tokenId, from, to) => this.handleTransferredVoucher(tokenId, from, to));

            this.logger.log('Blockchain service initialized');
        } catch (error) {
            this.logger.error(`Failed to initialize blockchain service: ${error.message}`);
        }
    }

    async generateVoucherToAddress(recipient: string, amountVnd: number): Promise<boolean> {
        try {
            const tokenURI = `https://api.evovou.store/voucher/token-uri/${amountVnd}`;
            const amountEth = ethers.parseEther((amountVnd / this.EXCHANGE_RATE).toFixed(18));

            const tx = await this.contract.generateVoucherToAddress(recipient, tokenURI, amountEth);
            const receipt = await tx.wait();

            return true;
        } catch (error) {
            this.logger.error(`Error generating voucher to address: ${error.message}`);
            return false;
        }
    }

    async redeemVoucher(tokenId: number): Promise<boolean> {
        try {
            const tx = await this.contract.redeemVoucher(tokenId);
            const receipt = await tx.wait();

            return true;
        } catch (error) {
            this.logger.error(`Error redeeming voucher: ${error.message}`);
            return false;
        }
    }

    async transferVoucher(tokenId: number, to: string): Promise<boolean> {
        try {
            const tx = await this.contract.transferVoucher(tokenId, to);
            const receipt = await tx.wait();

            return true;
        } catch (error) {
            this.logger.error(`Error transferring voucher: ${error.message}`);
            return false;
        }
    }

    private async handlePurchasedVoucher(buyer: string, tokenId: BigInt, amountETH: BigInt, amountVND: BigInt) {
        try {
            const rounedVndValue = roundToNearestValue(amountVND, BlockchainService.voucherValues);
            const numberTokenId = Number(tokenId);

            const voucherDenomination = await this.voucherDenominationRepository.findOne({
                where: { value: rounedVndValue },
                withDeleted: false
            });

            if (!voucherDenomination) {
                Logger.error(`Voucher denomination not found for value: ${rounedVndValue}`);
                return;
            }

            const buyerUser = await this.userRepository.findOne({
                where: { walletAddress: buyer },
                withDeleted: false
            });

            if (!buyerUser) {
                Logger.error(`Buyer not found for address: ${buyer}`);
                return;
            }


            const voucher = await this.voucherRepository.create({
                denominationId: voucherDenomination.id,
                ownerId: buyerUser.id,
                tokenId: numberTokenId,
                status: EnumVoucherStatus.READY,
                expiredAt: moment().add(30, 'days').toDate(),
                redeemedAt: null,
            })

            await this.voucherRepository.save(voucher);
        } catch (error) {
            Logger.error(`Error handling purchased voucher: ${error}`);
        }
    }

    private async handleRedeemedVoucher(redeemer: string, tokenId: BigInt, amountETH: BigInt, amountVND: BigInt) {
        try {
            const redeemerUser = await this.userRepository.findOne({
                where: { walletAddress: redeemer },
                withDeleted: false
            });

            if (!redeemerUser) {
                Logger.error(`Redeemer not found for address: ${redeemer}`);
                return;
            }

            const voucher = await this.voucherRepository.findOne({
                where: { tokenId: Number(tokenId), ownerId: redeemerUser.id },
                relations: ["denomination"],
                withDeleted: false
            });

            if (!voucher) {
                Logger.error(`Voucher not found or not owned by redeemer: ${redeemer}`);
                return;
            }

            const owner = await this.userRepository.findOne({
                where: { walletAddress: redeemer },
                withDeleted: false
            });

            if (!owner) {
                Logger.error(`Owner not found for address: ${redeemer}`);
                return;
            }

            voucher.status = EnumVoucherStatus.REDEEMED;
            voucher.redeemedAt = new Date();

            owner.balance += voucher.denomination.value;

            await this.voucherRepository.save(voucher);
            await this.userRepository.save(owner);
        } catch (error) {
            Logger.error(`Error handling redeemed voucher: ${error}`);
        }
    }

    private async handleTransferredVoucher(tokenId: BigInt, from: string, to: string) {
        try {
            const fromUser = await this.userRepository.findOne({
                where: { walletAddress: from },
                withDeleted: false
            });

            if (!fromUser) {
                Logger.error(`Sender not found for address: ${from}`);
                return;
            }

            const toUser = await this.userRepository.findOne({
                where: { walletAddress: to },
                withDeleted: false
            });

            if (!toUser) {
                Logger.error(`Receiver not found for address: ${to}`);
                return;
            }

            const voucher = await this.voucherRepository.findOne({
                where: { tokenId: Number(tokenId), ownerId: fromUser.id },
                withDeleted: false
            });

            if (!voucher) {
                Logger.error(`Voucher not found or not owned by sender: ${from}`);
                return;
            }

            voucher.ownerId = toUser.id;
            await this.voucherRepository.save(voucher);
        } catch (error) {
            Logger.error(`Error handling transferred voucher: ${error}`);
        }
    }

    static async getMetadataJSON(amount: number | string): Promise<any> {
        return {
            "name": "Evovou Voucher " + amount + " VND",
            "symbol": "EVOVOU",
            "description": "Evovou Voucher NFT with amount: " + amount + " VND",
            "image": "https://i.imgur.com/G9aajG5.png",
            "animation_url": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDNrcmdrbzhhZm41cnZjaWJxZzk3cXgzdDk2dmltcXdqcHQ2OTY1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rPbVaGPnheoQ2dFkND/giphy.gif",
            "external_url": "https://evovou.store",
            "attributes": [
                {
                    "trait_type": "web",
                    "value": "yes"
                },
                {
                    "trait_type": "mobile",
                    "value": "yes"
                },
                {
                    "trait_type": "extension",
                    "value": "yes"
                }
            ],
            "properties": {
                "files": [
                    {
                        "uri": "https://i.imgur.com/G9aajG5.png",
                        "type": "image/png"
                    }
                ],
                "category": "image"
            }
        }
    }
}