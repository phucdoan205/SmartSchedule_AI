import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { BranchesService } from './branches.service.js';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      code: string;
      name: string;
      address: string;
      phone: string;
      imageUrl?: string;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.branchesService.create(body, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      address?: string;
      phone?: string;
      imageUrl?: string;
      isActive?: boolean;
    },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.branchesService.update(id, body, userId);
  }
}

