
import { connectionSource } from "@/commons/TypeORMConfig";
import { User, VoucherDenomination } from "@/entities";
import { EnumRoles } from "@/enums/EnumRoles";

const seed = async () => {
    await connectionSource.initialize();
    console.log("Database connected!");

    const userRepo = connectionSource.getRepository(User);
    const voucherDenominationRepository = connectionSource.getRepository(VoucherDenomination);

    // Create Users
    const users = await userRepo.save([
        { name: "Duy Nguyen Hoang", email: "hoangduy06104@gmail.com", password: "$2a$12$vl.8U4U5N2q6NdvTz3ehJOeTb.OUjwOcRcwfclrlQ8f8ghN2h..B.", role: EnumRoles.ROLE_ADMIN, walletAddress: "0x80a33Fb8cE7725375F620B1eC868dA6115907cB5" },
    ]);

    const denominations = await voucherDenominationRepository.save([
        { name: "10.000 VND", value: 10000 },
        { name: "20.000 VND", value: 20000 },
        { name: "50.000 VND", value: 50000 },
        { name: "100.000 VND", value: 100000 },
        { name: "200.000 VND", value: 200000 },
        { name: "500.000 VND", value: 500000 },
    ]);

    process.exit();
};

seed().catch((err) => {
    console.error("Error seeding data:", err);
    process.exit(1);
});
