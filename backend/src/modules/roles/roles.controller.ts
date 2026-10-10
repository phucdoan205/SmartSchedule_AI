import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { RolesService } from './roles.service.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  async createRole(@Req() req: any, @Body() body: { name: string; description?: string }) {
    const userId = req.user?.sub || req.user?.id;
    return this.rolesService.createRole(body, userId);
  }

  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { name?: string; description?: string },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.rolesService.updateRole(id, body, userId);
  }

  @Put('matrix')
  async saveMatrix(@Req() req: any, @Body() body: { matrix: Record<string, string[]> }) {
    const userId = req.user?.sub || req.user?.id;
    return this.rolesService.saveMatrix(body.matrix || {}, userId);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.rolesService.deleteRole(id, userId);
  }
}

