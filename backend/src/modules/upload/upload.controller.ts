import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service.js';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('folders')
  getFolders() {
    return {
      success: true,
      message: 'Danh sách thư mục lưu trữ ảnh Cloudinary',
      data: this.uploadService.getFolders(),
    };
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: any,
    @Query('category') queryCategory?: string,
    @Query('folder') queryFolder?: string,
    @Body('category') bodyCategory?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tệp ảnh để tải lên');
    }
    const targetFolder = queryCategory || bodyCategory || queryFolder || 'services';
    const result = await this.uploadService.uploadImage(file, targetFolder);
    return {
      success: true,
      message: 'Tải ảnh lên Cloudinary thành công',
      data: result,
    };
  }
}
