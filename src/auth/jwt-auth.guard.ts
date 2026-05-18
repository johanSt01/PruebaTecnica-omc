import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('El token ha expirado');
    }
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Token inválido');
    }
    if (err || !user) {
      throw new UnauthorizedException(
        'Acceso no autorizado — se requiere token JWT',
      );
    }
    return user;
  }
}
