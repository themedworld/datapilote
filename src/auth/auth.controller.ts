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

  //Creation de super_Admin
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  // -------------------- CRÉATION UTILISATEUR HIÉRARCHIQUE --------------------
  @Post('create-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN_COMPANY,
    UserRole.MANAGER,
    UserRole.PROJECT_MANAGER,
  )
  async createUser(
    @Req() req: RequestWithUser,
    @Body() body: CreateUserDto & { role: UserRole; companyId?: number },
  ) {
    const creator = req.user;
    const { role, companyId, ...userData } = body;

    // Le service décide si companyId doit être forcé selon la hiérarchie
    return this.authService.createUser(creator, userData, role, companyId);
  }

  // -------------------- ROUTE TEST ADMIN --------------------
  @Get('admin-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_COMPANY)
  getAdminData(@Req() req: RequestWithUser) {
    return {
      message: 'Données réservées aux admins',
      user: req.user,
    };
  }

  // -------------------- ROUTE TEST MEMBRE --------------------
  @Get('member-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.MEMBER,
    UserRole.MANAGER,
    UserRole.PROJECT_MANAGER,
    UserRole.ADMIN_COMPANY,
    UserRole.SUPER_ADMIN,
  )
  getMemberData(@Req() req: RequestWithUser) {
    return {
      message: 'Données accessibles aux membres et admins',
      user: req.user,
    };
  }
}
