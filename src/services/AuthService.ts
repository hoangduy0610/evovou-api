import { Auth_RegiserDto } from '@/dtos/Auth_RegisterDto';
import { User, VendorUser } from '@/entities';
import { EnumRoles } from '@/enums/EnumRoles';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Constant } from 'src/commons/Constant';
import { MessageCode } from 'src/commons/MessageCode';
import { ApplicationException } from 'src/controllers/ExceptionController';
import { Auth_LoginDto } from 'src/dtos/Auth_LoginDto';
import { UserModal } from 'src/models/User';
import { StringUtils } from 'src/utils/StringUtils';
import { Repository } from 'typeorm';

const bcrypt = require('bcrypt');
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(VendorUser) private readonly vendorUserRepository: Repository<VendorUser>,
        private readonly jwtService: JwtService
    ) {
    }

    async register(dto: Auth_RegiserDto): Promise<UserModal> {
        const { walletAddress, password, name, email } = dto;
        console.log(dto);
        const user = await this.userRepository.findOne({ where: { email: email }, withDeleted: false });
        if (user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_ALREADY_EXISTED);
        }

        try {
            const hash = bcrypt.hashSync(password, Constant.BCRYPT_ROUND);
            const res = await this.userRepository.create({
                walletAddress: walletAddress,
                email: email,
                password: hash,
                role: EnumRoles.ROLE_USER,
                name: name,
                balance: 0,
            })
            await this.userRepository.save(res);

            return new UserModal(res);
        } catch (error) {
            Logger.error(error);
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_CREATE_ERROR);
        }
    }

    async login(userAuthDto: Auth_LoginDto): Promise<any> {
        const email = StringUtils.xssPrevent(userAuthDto.email);
        const safePassword = StringUtils.xssPrevent(userAuthDto.password);
        const vendorId = userAuthDto.vendorId ? userAuthDto.vendorId : null;

        let user: User | VendorUser =
            vendorId
                ? await this.vendorUserRepository.findOne({ where: { email: email, vendorId: vendorId }, withDeleted: false })
                : await this.userRepository.findOne({ where: { email: email }, withDeleted: false });

        if (!user) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.USER_NOT_REGISTER);
        }

        if (!bcrypt.compareSync(safePassword, user.password)) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_PASSWORD_WRONG);
        }

        const userData = new UserModal(user);

        if (vendorId) {
            userData.fromVendorUser(user as VendorUser);
        } else {
            userData.fromUser(user as User);
        }

        const JWT_Payload = {
            id: userData.id,
            email: userData.email,
            walletAddress: userData.walletAddress,
            vendorId: userData.vendorId,
            balance: userData.balance,
            avatar: userData.avatar,
            role: userData.role,
            name: userData.name,
            isVendor: Boolean(vendorId),
        }

        try {
            const JWT = this.jwtService.sign(JWT_Payload);
            return { token: JWT, info: JWT_Payload };
        } catch (e) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_PASSWORD_WRONG)
        }
    }

    async validateUser(payload: any): Promise<any> {
        const res = {
            ...payload,
            ...(await this.userRepository.findOne({ where: { id: payload.id }, withDeleted: false }))
        };

        delete res.password;
        delete res.iat;
        delete res.exp;

        return res;
    }
}