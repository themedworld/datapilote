import { CompaniesService } from './../companies/companies.service';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserRole } from '../user/entities/user.entity';

export interface JwtValidatedUser {
  id: number;
  email: string;
  role: UserRole;
  companyId?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompaniesService,
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
console.log(
  'JWT SECRET EXISTS:',
  !!process.env.ACCESS_TOKEN_SECRET_KEY,
);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId ?? null, 
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
      role: UserRole.SUPER_ADMIN,
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

  // -------------------- CRÉATION UTILISATEUR HIÉRARCHIQUE --------------------
  async createUser(
    creator: JwtValidatedUser,
    createUserDto: CreateUserDto,
    desiredRole: UserRole,
    companyId?: number,
  ) {
    switch (creator.role) {
      case UserRole.SUPER_ADMIN:
        break;

      case UserRole.ADMIN_COMPANY:
        if (
          ![
            UserRole.ADMIN_COMPANY,
            UserRole.MANAGER,
            UserRole.PROJECT_MANAGER,
            UserRole.MEMBER,
          ].includes(desiredRole)
        ) {
          throw new ForbiddenException('Role not allowed');
        }
        companyId = creator.companyId;
        break;

      case UserRole.MANAGER:
      case UserRole.PROJECT_MANAGER:
        if (desiredRole !== UserRole.MEMBER) {
          throw new ForbiddenException('You can only create MEMBER users');
        }
        companyId = creator.companyId;
        break;

      default:
        throw new ForbiddenException('Access denied');
    }

    const company = companyId
      ? await this.companyService.findById(companyId)
      : undefined;

    // Ne pas hasher ici non plus : UserService.create s'en charge
    const user = await this.userService.create({
      ...createUserDto,
      password: createUserDto.password,
      role: desiredRole,
      company,
    });

    return user;
  }

  // -------------------- VALIDATION ROLE --------------------
  async validateUserRole(userId: number, role: UserRole): Promise<boolean> {
    const user = await this.userService.findById(userId);
    return !!user && user.role === role;
  }

  // -------------------- VALIDATION SOCIÉTÉ --------------------
  async validateUserCompany(
    userId: number,
    companyId: number,
  ): Promise<boolean> {
    const user = await this.userService.findById(userId);
    return !!user && user.company?.id === companyId;
  }
}