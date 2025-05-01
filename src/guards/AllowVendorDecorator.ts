import { SetMetadata } from '@nestjs/common';

export const AllowVendor = (vendor: boolean) => SetMetadata('vendor', vendor ? 'allow' : 'not-allow');