import { BlockchainService } from "@/services/BlockchainService";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

@Processor('voucher')
export class VoucherQueue {
    constructor(
        private blockchainService: BlockchainService,
    ) { }

    @Process('buy')
    async buyVoucher(job: Job<{ orderId: number, toWalletAddress: string, amountVnd: number }>) {
        const { data } = job;
        const { toWalletAddress, amountVnd, orderId } = data;
        await this.blockchainService.generateVoucherToAddress(
            orderId,
            toWalletAddress,
            amountVnd
        );
    }

    @Process('transfer')
    async transferVoucher(job: Job<{ tokenId: number, toWalletAddress: string }>) {
        const { data } = job;
        const { tokenId, toWalletAddress } = data;
        await this.blockchainService.transferVoucher(tokenId, toWalletAddress);
    }

    @Process('redeem')
    async redeemVoucher(job: Job<{ tokenId: number }>) {
        const { data } = job;
        const { tokenId } = data;
        await this.blockchainService.redeemVoucher(tokenId);
    }
}