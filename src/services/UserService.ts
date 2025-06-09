
import { User_CreateDto, User_UpdateDto } from '@/dtos/User_Dtos';
import { User } from '@/entities';
import { EnumRoles } from '@/enums/EnumRoles';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Constant } from 'src/commons/Constant';
import { MessageCode } from 'src/commons/MessageCode';
import { ApplicationException } from 'src/controllers/ExceptionController';
import { Repository } from 'typeorm';

const bcrypt = require('bcrypt');
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {
    }

    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find({
            withDeleted: false
        });
        return users;
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: id },
            withDeleted: false
        });
        return user;
    }

    async findByEmail(email: string): Promise<Pick<User, 'id' | 'email' | 'name' | 'walletAddress'>> {
        const user = await this.userRepository.findOne({
            where: { email: email },
            withDeleted: false
        });
        if (!user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND);
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            walletAddress: user.walletAddress
        };
    }

    async create(dto: User_CreateDto): Promise<User> {
        const { walletAddress, password, name, role, email } = dto;
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
                role: role,
                name: name,
            })
            await this.userRepository.save(res);

            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_CREATE_ERROR);
        }
    }

    async update(reqUser: any, id: number, dto: Partial<User_UpdateDto>): Promise<User> {
        if (reqUser.role !== EnumRoles.ROLE_ADMIN && reqUser.id !== id) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_UPDATE_ERROR);
        }

        const user = await this.userRepository.findOne({ where: { id: id }, withDeleted: false });
        if (!user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND);
        }

        try {
            const res = await this.userRepository.save({
                ...user,
                ...dto
            });
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_UPDATE_ERROR);
        }
    }

    async delete(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: id }, withDeleted: false });
        if (!user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND);
        }

        try {
            const res = await this.userRepository.softRemove(user);
            return res;
        } catch (error) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_UPDATE_ERROR);
        }
    }
}