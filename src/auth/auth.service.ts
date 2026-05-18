import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Usuario hardcodeado para la prueba técnica.
// En producción esto vendría de una base de datos.
const DEMO_USER = { id: 1, username: 'admin', password: 'omc2024' };

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(username: string, password: string): { access_token: string } {
    if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const payload = { sub: DEMO_USER.id, username: DEMO_USER.username };
    return { access_token: this.jwtService.sign(payload) };
  }
}
