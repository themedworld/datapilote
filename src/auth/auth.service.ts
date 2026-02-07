import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserRole } from '../user/entities/user.entity';

export interface JwtValidatedUser {
  id: number;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // -------------------- SIGNIN --------------------
  async signin(email: string, password: string) {
    let user;
    try {
      user = await this.userService.findByEmail(email);
    } catch (err) {
      // masquer l'existence du compte
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    const { password: _pwd, ...userWithoutPassword } = user as any;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  // -------------------- CREATION DU SUPER ADMIN (INIT SEULEMENT) --------------------
  async signup(createUserDto: CreateUserDto) {
    // Ne pas hasher ici : UserService.create gère le hash
    const user = await this.userService.create({
      ...createUserDto,
      password: createUserDto.password,
      role: UserRole.MEMBER,
    });

    const payload = {
      sub: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user,
      access_token,
    };
  }

  // -------------------- CREATION D'UN MEMBER --------------------
  async createUser(
    creator: JwtValidatedUser,
    createUserDto: CreateUserDto,
    desiredRole: UserRole,
  ) {
    // Seul SUPER_ADMIN peut créer des utilisateurs
    if (creator.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can create users');
    }

    // Le rôle doit être SUPER_ADMIN ou MEMBER
    if (![UserRole.SUPER_ADMIN, UserRole.MEMBER].includes(desiredRole)) {
      throw new ForbiddenException('Invalid role');
    }

    const user = await this.userService.create({
      ...createUserDto,
      password: createUserDto.password,
      role: desiredRole,
    });

    return user;
  }

  // -------------------- VALIDATION ROLE --------------------
  async validateUserRole(userId: number, role: UserRole): Promise<boolean> {
    const user = await this.userService.findById(userId);
    return !!user && user.role === role;
  }
}
