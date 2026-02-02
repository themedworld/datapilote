import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { Request } from 'express';
import { CompanyEntity } from 'src/companies/entities/company.entity';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // -------------------- LISTER TOUS LES UTILISATEURS --------------------
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_COMPANY)
  async findAll(@Req() req: Request) {
    const user = req['user'];
    
    // Super admin voit tous les utilisateurs
    if (user.role === UserRole.SUPER_ADMIN) {
      return this.userService.findAll();
    }

    // Admin Company voit seulement les utilisateurs de sa société
    if (user.role === UserRole.ADMIN_COMPANY) {
      return this.userService.findByCompany({ id: user.companyId } as any);
    }

    throw new ForbiddenException('You do not have permission to access this resource');
  }

  // -------------------- RÉCUPÉRER UN UTILISATEUR PAR ID --------------------
@Get(':id')
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN_COMPANY,
  UserRole.MANAGER,
  UserRole.PROJECT_MANAGER
)
async findOne(@Param('id') id: number, @Req() req: Request) {
  const requester = req['user'];
  const user = await this.userService.findById(+id);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 🔐 Tous les rôles sauf SUPER_ADMIN sont limités à leur société
  if (
    requester.role !== UserRole.SUPER_ADMIN &&
    user.company?.id !== requester.companyId
  ) {
    throw new ForbiddenException(
      'You cannot access users from another company',
    );
  }

  return user;
}

  // -------------------- CRÉER UN UTILISATEUR --------------------
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_COMPANY, UserRole.MANAGER, UserRole.PROJECT_MANAGER)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ) {
    const creator = req['user'];

    // Déterminer le rôle souhaité
    const desiredRole: UserRole = createUserDto.role || UserRole.MEMBER;

    // Vérifier que la création est autorisée
    if (
      creator.role === UserRole.MANAGER || 
      creator.role === UserRole.PROJECT_MANAGER
    ) {
      if (desiredRole !== UserRole.MEMBER) {
        throw new ForbiddenException('You can only create MEMBER users');
      }
    }

    // ADMIN_COMPANY ne peut créer que dans sa société
    let companyId: number | undefined = createUserDto.companyId;
    if (creator.role === UserRole.ADMIN_COMPANY) {
      companyId = creator.companyId;
    }

    return this.userService.create({
      ...createUserDto,
      role: desiredRole,
      // cast partial object to CompanyEntity so TypeScript accepts it
      company: companyId ? ({ id: companyId } as unknown as CompanyEntity) : null,
    });
  }

  // -------------------- METTRE À JOUR UN UTILISATEUR --------------------
@Patch(':id')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_COMPANY)
async update(
  @Param('id') id: number,
  @Body() updateUserDto: UpdateUserDto,
  @Req() req: Request,
) {
  const requester = req['user'];
  const targetUser = await this.userService.findById(+id);

  if (!targetUser) {
    throw new NotFoundException('User not found');
  }

  // 🔐 Restriction par société
  if (
    requester.role !== UserRole.SUPER_ADMIN &&
    targetUser.company?.id !== requester.companyId
  ) {
    throw new ForbiddenException(
      'You cannot update users from another company',
    );
  }

  // 🔒 Empêcher ADMIN_COMPANY de modifier des champs sensibles
  if (requester.role === UserRole.ADMIN_COMPANY) {
    delete updateUserDto.role;
    delete updateUserDto.companyId;
  }

  return this.userService.update(+id, updateUserDto);
}


  // -------------------- SUPPRIMER UN UTILISATEUR --------------------
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_COMPANY)
  async remove(@Param('id') id: number, @Req() req: Request) {
    const requester = req['user'];
    const targetUser = await this.userService.findById(+id);

    if (requester.role === UserRole.ADMIN_COMPANY && targetUser.company?.id !== requester.companyId) {
      throw new ForbiddenException('You cannot delete users from another company');
    }

    return this.userService.remove(+id);
  }
}
