import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Req,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dtos/create-story.dto';
import { UpdateStoryDto } from './dtos/update-story.dto';
import { BaseResponse } from 'src/common/responses/base-response';
import {
  SendOtpDto,
  RegisterReaderDto,
  LoginReaderDto,
  UpdateReaderDto,
} from './dtos/reader-auth.dto';

@ApiTags('Public — Truyện')
@Controller({ version: '1' })
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get('stories')
  @ApiOperation({ summary: 'Lấy danh sách tất cả truyện' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách truyện (không bao gồm content)',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('genreId') genreId?: string,
    @Query('search') search?: string,
  ) {
    return this.storiesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      genreId: genreId ? parseInt(genreId, 10) : undefined,
      search,
    });
  }

  @Get('stories/:id')
  @ApiOperation({ summary: 'Lấy chi tiết 1 truyện (full content)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.findOne(id);
  }

  @Post('stories/visit')
  @ApiOperation({ summary: 'Ghi nhận một lượt truy cập mới (session)' })
  logSessionVisit(@Req() req: Request) {
    this.storiesService.logVisit(req.ip);
    return new BaseResponse(200, 'Ghi nhận truy cập thành công', null);
  }

  @Post('stories/register')
  @ApiOperation({ summary: 'Đăng ký viết truyện mới' })
  register(@Body() dto: CreateStoryDto) {
    return this.storiesService.register(dto);
  }

  @Get('stories/history')
  @ApiOperation({ summary: 'Lấy lịch sử truyện đã đăng ký' })
  findReaderHistory(@Query('author') author: string) {
    return this.storiesService.findReaderHistory(author);
  }

  @Put('stories/register/:id')
  @ApiOperation({
    summary: 'Chỉnh sửa truyện đã đăng ký (chỉ khi chưa được duyệt)',
  })
  updateRegisteredStory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoryDto,
  ) {
    return this.storiesService.updateRegisteredStory(id, dto);
  }

  @Get('stories/:id/chapters')
  @ApiOperation({ summary: 'Lấy danh sách tập của truyện' })
  getChapters(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.getChaptersByStory(id);
  }

  @Get('stories/:id/chapters/:chapterNumber')
  @ApiOperation({ summary: 'Lấy chi tiết tập truyện' })
  getChapter(
    @Param('id', ParseIntPipe) id: number,
    @Param('chapterNumber', ParseIntPipe) chapterNumber: number,
  ) {
    return this.storiesService.getChapter(id, chapterNumber);
  }

  @Get('genres')
  @ApiOperation({ summary: 'Lấy danh sách tất cả thể loại' })
  @ApiResponse({ status: 200, description: 'Danh sách thể loại' })
  findAllGenres(@Query('hasStories') hasStories?: string) {
    return this.storiesService.findAllGenres({
      hasStories: hasStories === 'true',
    });
  }

  // ─── Reader Auth ───────────────────────────────────────────────────────────

  @Post('readers/send-otp')
  @ApiOperation({ summary: 'Gửi mã OTP xác minh email đăng ký độc giả' })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.storiesService.sendOtp(dto.email);
  }

  @Post('readers/register')
  @ApiOperation({ summary: 'Đăng ký tài khoản độc giả (tên + email + OTP)' })
  registerReader(@Body() dto: RegisterReaderDto) {
    return this.storiesService.registerReader(dto.username, dto.email, dto.otp);
  }

  @Post('readers/login')
  @ApiOperation({ summary: 'Đăng nhập bằng email' })
  loginByEmail(@Body() dto: LoginReaderDto) {
    return this.storiesService.loginByEmail(dto.email);
  }

  @Get('readers/:id')
  @ApiOperation({ summary: 'Lấy thông tin độc giả theo ID' })
  getReaderById(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.getReaderById(id);
  }

  @Put('readers/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin độc giả' })
  updateReader(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReaderDto,
  ) {
    return this.storiesService.updateReader(id, dto.username, dto.email);
  }

  @Get('readers/:id/stats')
  @ApiOperation({ summary: 'Thống kê truyện của một độc giả' })
  getReaderStats(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.getReaderStats(id);
  }

  @Get('readers/:id/notifications')
  @ApiOperation({ summary: 'Lấy danh sách thông báo của độc giả' })
  getReaderNotifications(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.getReaderNotifications(id);
  }

  @Put('readers/:readerId/notifications/:id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  markNotificationAsRead(
    @Param('readerId', ParseIntPipe) readerId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.storiesService.markNotificationAsRead(id, readerId);
  }
}
