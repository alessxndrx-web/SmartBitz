import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportTicketDto, TicketStatus, TicketPriority, TicketCategory } from './dto/create-support-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('support')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @Permissions('support:create')
  createTicket(
    @Body() createSupportTicketDto: CreateSupportTicketDto,
    @TenantId() tenantId: string,
    @CurrentUser() user?: { userId?: string },
  ) {
    return this.supportService.createTicket(createSupportTicketDto, tenantId, user?.userId);
  }

  @Get()
  @Permissions('support:read')
  findAll(@TenantId() tenantId: string) {
    return this.supportService.findAll(tenantId);
  }

  @Get('status/:status')
  @Permissions('support:read')
  findByStatus(
    @Param('status') status: TicketStatus,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.findByStatus(tenantId, status);
  }

  @Get('priority/:priority')
  @Permissions('support:read')
  findByPriority(
    @Param('priority') priority: TicketPriority,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.findByPriority(tenantId, priority);
  }

  @Get('category/:category')
  @Permissions('support:read')
  findByCategory(
    @Param('category') category: TicketCategory,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.findByCategory(tenantId, category);
  }

  @Get('user/:userId')
  @Permissions('support:read')
  findByUser(
    @Param('userId') userId: string,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.findByUser(tenantId, userId);
  }

  @Get('stats')
  @Permissions('support:read')
  getStats(@TenantId() tenantId: string) {
    return this.supportService.getStats(tenantId);
  }

  @Get(':id')
  @Permissions('support:read')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.supportService.findOne(id, tenantId);
  }

  @Patch(':id/status')
  @Permissions('support:update')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.updateStatus(id, status, tenantId);
  }

  @Patch(':id/assign')
  @Permissions('support:update')
  assignTicket(
    @Param('id') id: string,
    @Body('assignedTo') assignedTo: string,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.assignTicket(id, assignedTo, tenantId);
  }

  @Patch(':id')
  @Permissions('support:update')
  updateTicket(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSupportTicketDto>,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.updateTicket(id, updateData, tenantId);
  }

  @Delete(':id')
  @Permissions('support:delete')
  removeTicket(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.supportService.removeTicket(id, tenantId);
  }
}
