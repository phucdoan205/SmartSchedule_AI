import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
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
    @Body()
    body: {
      code: string;
      name: string;
      address: string;
      phone: string;
      imageUrl?: string;
    },
  ) {
    return this.branchesService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      address?: string;
      phone?: string;
      imageUrl?: string;
      isActive?: boolean;
    },
  ) {
    return this.branchesService.update(id, body);
  }
}
