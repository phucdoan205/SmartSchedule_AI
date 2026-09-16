import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

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

  /**
   * POST /upload/avatar
   * Upload avatar lên Cloudinary, chỉ lưu URL vào database
   * Yêu cầu đăng nhập (JWT Bearer token)
   */
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tệp ảnh đại diện');
    }
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('Không xác định được người dùng');
    }
    const result = await this.uploadService.uploadAvatar(file, userId);
    return {
      success: true,
      message: 'Đã cập nhật ảnh đại diện thành công',
      data: { url: result.url, public_id: result.public_id },
    };
  }
}
