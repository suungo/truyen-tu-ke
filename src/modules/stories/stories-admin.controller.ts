import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dtos/create-story.dto';
import { UpdateStoryDto } from './dtos/update-story.dto';
import { CreateGenreDto } from './dtos/create-genre.dto';
import { UpdateGenreDto } from './dtos/update-genre.dto';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { SendNotificationDto } from './dtos/reader-auth.dto';

@ApiTags('Admin — Quản lý Truyện')
@Controller({ version: '1' })
export class StoriesAdminController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('admin/stories')
  @ApiOperation({ summary: '[Admin] Lấy danh sách truyện (full fields)' })
  findAll() {
    return this.storiesService.findAllAdmin();
  }

  @Get('admin/stats')
  @ApiOperation({ summary: '[Admin] Thống kê tổng số truyện & readers' })
  getStats(
    @Query('date') date?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.storiesService.getStats({ date, month, year });
  }

  @Post('admin/stories')
  @ApiOperation({ summary: '[Admin] Thêm truyện mới' })
  create(@Body() dto: CreateStoryDto) {
    return this.storiesService.create(dto);
  }

  @Post('admin/stories/:id/cover')
  @ApiOperation({ summary: '[Admin] Upload ảnh bìa truyện lên Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file);
    return this.storiesService.update(id, { coverImage: result.secureUrl });
  }

  @Put('admin/stories/:id')
  @ApiOperation({ summary: '[Admin] Cập nhật truyện' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStoryDto) {
    return this.storiesService.update(id, dto);
  }

  @Delete('admin/stories/:id')
  @ApiOperation({ summary: '[Admin] Xóa truyện' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.remove(id);
  }

  @Get('admin/stories/pending')
  @ApiOperation({ summary: '[Admin] Lấy danh sách truyện chờ duyệt' })
  findPending() {
    return this.storiesService.findPendingAdmin();
  }

  @Patch('admin/stories/:id/approve')
  @ApiOperation({ summary: '[Admin] Duyệt truyện đăng ký' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.approve(id);
  }

  @Patch('admin/stories/:id/reject')
  @ApiOperation({ summary: '[Admin] Từ chối truyện đăng ký' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.reject(id);
  }

  // ─── Admin Genre CRUD ──────────────────────────────────────────────────────

  @Get('admin/genres')
  @ApiOperation({ summary: '[Admin] Lấy danh sách thể loại' })
  findAllGenres() {
    return this.storiesService.findAllGenres();
  }

  @Post('admin/genres')
  @ApiOperation({ summary: '[Admin] Thêm thể loại mới' })
  createGenre(@Body() dto: CreateGenreDto) {
    return this.storiesService.createGenre(dto);
  }

  @Put('admin/genres/:id')
  @ApiOperation({ summary: '[Admin] Cập nhật thể loại' })
  updateGenre(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGenreDto,
  ) {
    return this.storiesService.updateGenre(id, dto);
  }

  @Delete('admin/genres/:id')
  @ApiOperation({ summary: '[Admin] Xóa thể loại' })
  removeGenre(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.removeGenre(id);
  }

  // ─── Admin Readers CRUD ────────────────────────────────────────────────────

  @Get('admin/readers')
  @ApiOperation({ summary: '[Admin] Lấy danh sách độc giả' })
  findAllReaders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.storiesService.findAllReaders({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @Get('admin/readers/:id/stats')
  @ApiOperation({
    summary: '[Admin] Xem chi tiết & thống kê truyện của một độc giả',
  })
  getReaderStats(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.getReaderStats(id);
  }

  @Post('admin/notifications')
  @ApiOperation({
    summary: '[Admin] Gửi thông báo tùy chỉnh cho độc giả (hoặc gửi tất cả)',
  })
  sendCustomNotification(@Body() dto: SendNotificationDto) {
    return this.storiesService.sendCustomNotification(
      dto.readerId,
      dto.title,
      dto.content,
    );
  }

  @Get('admin/notifications')
  @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả thông báo đã gửi' })
  findAllNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.storiesService.findAllNotificationsAdmin({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @Delete('admin/notifications/:id')
  @ApiOperation({ summary: '[Admin] Xóa thông báo đã gửi' })
  removeNotification(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.removeNotificationAdmin(id);
  }

  // ─── Admin Chapters CRUD ───────────────────────────────────────────────────

  @Get('admin/stories/:id/chapters')
  @ApiOperation({ summary: '[Admin] Lấy danh sách tập của truyện' })
  getChapters(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.getChaptersByStory(id);
  }

  @Get('admin/stories/:id/chapters/:chapterNumber')
  @ApiOperation({ summary: '[Admin] Lấy chi tiết một tập' })
  getChapter(
    @Param('id', ParseIntPipe) id: number,
    @Param('chapterNumber', ParseIntPipe) chapterNumber: number,
  ) {
    return this.storiesService.getChapter(id, chapterNumber);
  }

  @Post('admin/stories/:id/chapters')
  @ApiOperation({ summary: '[Admin] Tạo tập mới cho truyện' })
  createChapter(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.storiesService.createChapter(id, dto);
  }

  @Put('admin/stories/:id/chapters/:chapterNumber')
  @ApiOperation({ summary: '[Admin] Cập nhật nội dung tập' })
  updateChapter(
    @Param('id', ParseIntPipe) id: number,
    @Param('chapterNumber', ParseIntPipe) chapterNumber: number,
    @Body() dto: any,
  ) {
    return this.storiesService.updateChapter(id, chapterNumber, dto);
  }

  @Delete('admin/stories/:id/chapters/:chapterNumber')
  @ApiOperation({ summary: '[Admin] Xóa tập' })
  deleteChapter(
    @Param('id', ParseIntPipe) id: number,
    @Param('chapterNumber', ParseIntPipe) chapterNumber: number,
  ) {
    return this.storiesService.deleteChapter(id, chapterNumber);
  }
}
