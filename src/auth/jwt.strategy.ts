import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from 'src/user/entities/user.entity';

interface JwtPayload {
  sub: number | string; // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface JwtValidatedUser {
  id: number;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env.ACCESS_TOKEN_SECRET_KEY;
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET_KEY is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[JwtStrategy] constructed — ACCESS_TOKEN_SECRET_KEY loaded');
    }
  }

  async validate(payload: JwtPayload): Promise<JwtValidatedUser> {
    if (!payload || !payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;

    if (isNaN(userId)) {
      throw new UnauthorizedException('Invalid user ID in JWT payload');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[JwtStrategy] validate payload:', payload);
    }

    return {
      id: userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
