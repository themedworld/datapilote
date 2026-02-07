import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService, JwtValidatedUser } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Request } from 'express';
import { UserRole } from '../user/entities/user.entity';

// Interface pour accéder à req.user
interface RequestWithUser extends Request {
  user: JwtValidatedUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // -------------------- SIGNIN --------------------
  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.signin(email, password);
  }

  // -------------------- CREATION DU SUPER ADMIN (INIT SEULEMENT) --------------------
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  // -------------------- CREATION D'UN MEMBER --------------------
  @Post('create-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN) // Seul SUPER_ADMIN peut créer des utilisateurs
  async createUser(
    @Req() req: RequestWithUser,
    @Body() body: CreateUserDto & { role: UserRole },
  ) {
    const creator = req.user;
    const { role, ...userData } = body;

    // Le rôle doit être SUPER_ADMIN ou MEMBER
    return this.authService.createUser(creator, userData, role);
  }

  // -------------------- ROUTE TEST SUPER_ADMIN --------------------
  @Get('admin-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  getAdminData(@Req() req: RequestWithUser) {
    return {
      message: 'Données réservées aux SUPER_ADMIN',
      user: req.user,
    };
  }

  // -------------------- ROUTE TEST MEMBRE --------------------
  @Get('member-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MEMBER)
  getMemberData(@Req() req: RequestWithUser) {
    return {
      message: 'Données accessibles aux SUPER_ADMIN et MEMBER',
      user: req.user,
    };
  }
}
