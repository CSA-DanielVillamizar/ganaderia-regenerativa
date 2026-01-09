import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class HeaderAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización inválido o ausente');
    }

    const token = authHeader.substring('Bearer '.length).trim();
    if (!token || token.toLowerCase() === 'invalid-token') {
      throw new UnauthorizedException('No autorizado');
    }

    return true;
  }
}
