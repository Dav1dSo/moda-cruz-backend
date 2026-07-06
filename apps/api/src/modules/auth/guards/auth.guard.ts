import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

interface JwtUserPayload {
  sub: number;
  email: string;
  permissions?: string[];
  is_platform_admin?: boolean;
}

@Injectable()
export class AuthLoginRequired implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JwtUserPayload;
    }>();

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Usuário deve estar logado');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token inválido');
    }

    let payload: JwtUserPayload;

    try {
      payload = this.jwtService.verify<JwtUserPayload>(token);
    } catch {
      throw new UnauthorizedException('Token expirado ou inválido');
    }

    req.user = payload;

    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) return true;

    if (payload.is_platform_admin) return true;

    const hasPermission = requiredPermissions.every((perm) =>
      payload.permissions?.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Sem permissão');
    }

    return true;
  }
}
