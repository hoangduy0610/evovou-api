import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApplicationException } from '../controllers/ExceptionController';
import { MessageCode } from '../commons/MessageCode';
import { EnumRoles } from '@/enums/EnumRoles';

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) { }

	canActivate(context: ExecutionContext): boolean {
		const metadata = this.getMetadata(context);
		if (!this.shouldCheck(metadata)) return true;

		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const vendorId = Number(request.headers['vendor-id']);

		this.validateUser(user);
		this.validateRole(user, metadata.role);

		if (this.isSystemAdmin(user)) return true;

		this.validateVendorAccess(user, metadata.vendor, vendorId);

		return true;
	}

	private getMetadata(context: ExecutionContext): { role?: string[]; vendor?: string } {
		return {
			role: this.reflector.get<string[]>('role', context.getHandler()),
			vendor: this.reflector.get<string>('vendor', context.getHandler()),
		};
	}

	private shouldCheck(metadata: { role?: string[]; vendor?: string }): boolean {
		return Boolean(metadata.role?.length || metadata.vendor);
	}

	private validateUser(user: any): void {
		if (!user) this.throwForbidden();
	}

	private validateRole(user: any, roles?: string[]): void {
		if (roles && !roles?.includes(user.role)) this.throwForbidden();
	}

	private isSystemAdmin(user: any): boolean {
		return user.role === EnumRoles.ROLE_ADMIN && !user.isVendor;
	}

	private validateVendorAccess(user: any, vendor?: string, vendorId?: number): void {
		const isVendor = user.isVendor;

		if (vendor === 'allow' && (!isVendor || user.vendorId !== vendorId)) {
			// Allow vendor but user is not a vendor or vendorId does not match
			this.throwForbidden();
		}

		if (vendor !== 'allow' && isVendor) {
			// Not allow vendor but user is a vendor
			this.throwForbidden();
		}
	}

	private throwForbidden(): void {
		throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.USER_NOT_HAVE_PERMISSION);
	}
}
