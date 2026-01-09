import { SetMetadata } from '@nestjs/common';
import { Role } from '@shared/index';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
