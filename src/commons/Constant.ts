export const envFiles = ['local.env', 'staging.env', 'production.env'];

export enum EEnvName {
    NFT_CONTRACT_ADDRESS = 'NFT_CONTRACT_ADDRESS',
    WS_RPC_URL = 'WS_RPC_URL',
    ADMIN_PRIVATE_KEY = 'ADMIN_PRIVATE_KEY',

    VNPAY_MERCHANT_ID = 'VNPAY_MERCHANT_ID',
    VNPAY_SECRET_KEY = 'VNPAY_SECRET_KEY',
    VNPAY_RETURN_URL = 'VNPAY_RETURN_URL',
}

export class Constant {
    public static getEnv(name: EEnvName) {
        switch (name) {
            case EEnvName.NFT_CONTRACT_ADDRESS:
                return process.env.NFT_CONTRACT_ADDRESS;
            case EEnvName.WS_RPC_URL:
                return process.env.WS_RPC_URL;
            case EEnvName.ADMIN_PRIVATE_KEY:
                return process.env.ADMIN_PRIVATE_KEY;
            case EEnvName.VNPAY_MERCHANT_ID:
                return process.env.VNPAY_MERCHANT_ID;
            case EEnvName.VNPAY_SECRET_KEY:
                return process.env.VNPAY_SECRET_KEY;
            case EEnvName.VNPAY_RETURN_URL:
                return process.env.VNPAY_RETURN_URL;
            default:
                return '';
        }
    }
    public static readonly JWT_SECRET = 'c4bc8de0-c8cd-4648-92fd-0b18fa3b5aec';
    public static readonly JWT_EXPIRE = '1000d';
    public static readonly BCRYPT_ROUND = 10;
}