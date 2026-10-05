import { Controller, Get, Post, Put, Patch, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  async createRole(@Body() body: { name: string; description?: string }) {
    return this.rolesService.createRole(body);
  }

  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.rolesService.updateRole(id, body);
  }

  @Put('matrix')
  async saveMatrix(@Body() body: { matrix: Record<string, string[]> }) {
    return this.rolesService.saveMatrix(body.matrix || {});
  }
}
