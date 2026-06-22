import { Controller, Get, UseGuards, Request, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../role.enum';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('affinity/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.USER)
  getAffinity(@Request() req: any, @Param('id', ParseIntPipe) otherUserId: number) {
    const currentUserId = Number(req.user?.sub);
    if (!currentUserId || Number.isNaN(currentUserId)) {
      throw new BadRequestException('Usuario no autenticado o ID inválido en el token');
    }
    return this.usersService.getAffinity(currentUserId, otherUserId);
  }

  @Get('afinidad')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.USER)
  getAffinityTable(@Request() req: any) {
    const currentUserId = Number(req.user?.sub);
    if (!currentUserId || Number.isNaN(currentUserId)) {
      throw new BadRequestException('Usuario no autenticado');
    }
    return this.usersService.getAffinityTable(currentUserId);
  }

}
