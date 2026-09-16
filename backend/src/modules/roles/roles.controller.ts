import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRole(@Body() body: { name: string; description?: string }) {
    return this.rolesService.createRole(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('matrix')
  async saveMatrix(@Body() body: { matrix: Record<string, string[]> }) {
    return this.rolesService.saveMatrix(body.matrix || {});
  }
}
