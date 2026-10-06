import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
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

  @Post('categories')
  async createCategory(@Body() body: { name: string; description?: string }) {
    return this.servicesService.createCategory(body);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  async create(
    @Req() req: any,
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
    const userId = req.user?.sub || req.user?.id;
    return this.servicesService.create(body, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
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
    const userId = req.user?.sub || req.user?.id;
    return this.servicesService.update(id, body, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}
