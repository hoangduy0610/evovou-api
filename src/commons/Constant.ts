export const envFiles = ['local.env', 'staging.env', 'production.env'];

export enum EEnvName {
    NFT_CONTRACT_ADDRESS = 'NFT_CONTRACT_ADDRESS',
    INFURA_PROJECT_ID = 'INFURA_PROJECT_ID',
}

export class Constant {
    public static getEnv(name: EEnvName) {
        switch (name) {
            case EEnvName.NFT_CONTRACT_ADDRESS:
                return process.env.NFT_CONTRACT_ADDRESS;
            case EEnvName.INFURA_PROJECT_ID:
                return process.env.INFURA_PROJECT_ID;
            default:
                return '';
        }
    }
    public static readonly JWT_SECRET = 'c4bc8de0-c8cd-4648-92fd-0b18fa3b5aec';
    public static readonly JWT_EXPIRE = '1000d';
    public static readonly BCRYPT_ROUND = 10;
}