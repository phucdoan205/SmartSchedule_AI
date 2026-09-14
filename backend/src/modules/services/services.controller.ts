import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.servicesService.findAll({
      categoryId,
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get('categories')
  async findCategories() {
    return this.servicesService.findCategories();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      categoryId: string;
      code: string;
      name: string;
      standardPrice: number;
      deposit?: number;
      warranty?: string;
      durationMinutes?: number;
      description?: string;
      imageUrl?: string;
      isAiRecommended?: boolean;
    },
  ) {
    return this.servicesService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      categoryId?: string;
      code?: string;
      name?: string;
      standardPrice?: number;
      deposit?: number;
      warranty?: string;
      durationMinutes?: number;
      description?: string;
      imageUrl?: string;
      isActive?: boolean;
      isAiRecommended?: boolean;
    },
  ) {
    return this.servicesService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}
