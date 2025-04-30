
import { EnumVoucherValue } from '@/enums/EnumVoucherValue';
import { roundToNearestValue } from '@/utils/NumberUtils';
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from "ethers";

@Injectable()
export class VoucherService {
    constructor(
    ) {
        this.initEventListener().then(() => {
            Logger.log("NFT Event listener initialized.");
        }).catch((error) => {
            Logger.error("Error initializing NFT event listener:", error);
        });
    }

    private async initEventListener() {
        const contractAddress = "0x0b8730ED5733761dEC4526b05308ccEbe9FeA8c8"; // Địa chỉ contract của bạn
        const contractABI = [
            "event VoucherPurchased(address indexed buyer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)",
            "event VoucherRedeemed(address indexed redeemer, uint256 indexed tokenId, uint256 amountETH, uint256 amountVND)"
        ];

        const provider = new ethers.WebSocketProvider("wss://holesky.infura.io/ws/v3/d54f5b27db13442fa898a2b0d0b412c5");

        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        contract.on("VoucherPurchased", (buyer, tokenId, amountETH, amountVND) => {
            // const rounedVndValue = roundToNearestValue(amountVND, Object.values(EnumVoucherValue));
            Logger.log(`Voucher Purchased:`);
            Logger.log(`Buyer: ${buyer}`);
            Logger.log(`TokenId: ${tokenId}`);
            Logger.log(`Amount ETH: ${ethers.formatEther(amountETH)} ETH`);
            Logger.log(`Amount VND: ${amountVND}`);
        });

        contract.on("VoucherRedeemed", (redeemer, tokenId, amountETH, amountVND) => {
            // const rounedVndValue = roundToNearestValue(amountVND, Object.values(EnumVoucherValue));
            Logger.log(`Voucher Redeemed:`);
            Logger.log(`Redeemer: ${redeemer}`);
            Logger.log(`TokenId: ${tokenId}`);
            Logger.log(`Amount ETH: ${ethers.formatEther(amountETH)} ETH`);
            Logger.log(`Amount VND: ${amountVND}`);
        });
    }

    async getTokenUriJSON(amount: number) {
        return {
            "name": "Evovou Voucher " + amount + " VND",
            "symbol": "EVOVOU",
            "description": "Evovou Voucher NFT with amount: " + amount + " VND",
            "image": "https://i.imgur.com/r81YKSM.png",
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
                        "uri": "https://i.imgur.com/r81YKSM.png",
                        "type": "image/png"
                    }
                ],
                "category": "image"
            }
        }
    }
}