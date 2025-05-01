import { User, VendorUser } from "@/entities";

export class UserModal {
    id: number;
    email: string;
    role: string;
    name: string;
    avatar: string | null;
    walletAddress: string | null;
    vendorId: number | null;
    balance: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    constructor(user: User | VendorUser) {
        this.id = user.id;
        this.email = user.email;
        this.role = user.role;
        this.name = user.name;
        this.avatar = user.avatar;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.deletedAt = user.deletedAt;
    }

    fromVendorUser(vendorUser: VendorUser) {
        this.id = vendorUser.id;
        this.email = vendorUser.email;
        this.role = vendorUser.role;
        this.name = vendorUser.name;
        this.avatar = vendorUser.avatar;
        this.vendorId = vendorUser.vendorId;
        this.createdAt = vendorUser.createdAt;
        this.updatedAt = vendorUser.updatedAt;
        this.deletedAt = vendorUser.deletedAt;
    }

    fromUser(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.role = user.role;
        this.name = user.name;
        this.avatar = user.avatar;
        this.walletAddress = user.walletAddress;
        this.balance = user.balance;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.deletedAt = user.deletedAt;
    }
}