import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FrameworkService } from './framework.service';
import {
  CreateStoryFrameworkDto,
  CreateFrameworkPhaseDto,
  CreateFrameworkEpisodeDto,
} from '../stories/dtos/create-story-framework.dto';
import {
  UpdateStoryFrameworkDto,
  UpdateFrameworkPhaseDto,
  UpdateFrameworkEpisodeDto,
} from '../stories/dtos/update-story-framework.dto';

@ApiTags('Admin — Khung Kịch Bản')
@Controller({ version: '1' })
export class FrameworkController {
  constructor(private readonly frameworkService: FrameworkService) {}

  // ─── Framework ─────────────────────────────────────────────────────────────

  @Get('admin/frameworks')
  @ApiOperation({ summary: '[Admin] Lấy tất cả khung kịch bản' })
  getAllFrameworks() {
    return this.frameworkService.getAllFrameworks();
  }

  @Get('admin/stories/:storyId/framework')
  @ApiOperation({ summary: '[Admin] Lấy khung kịch bản theo truyện' })
  getByStory(@Param('storyId', ParseIntPipe) storyId: number) {
    return this.frameworkService.getFrameworkByStory(storyId);
  }

  @Get('stories/:storyId/framework')
  @ApiOperation({ summary: 'Lấy khung kịch bản theo truyện (public)' })
  getPublicByStory(@Param('storyId', ParseIntPipe) storyId: number) {
    return this.frameworkService.getFrameworkByStory(storyId);
  }

  @Post('admin/stories/:storyId/framework')
  @ApiOperation({
    summary: '[Admin] Tạo/Cập nhật toàn bộ khung kịch bản cho truyện',
  })
  createFramework(
    @Param('storyId', ParseIntPipe) storyId: number,
    @Body() dto: CreateStoryFrameworkDto,
  ) {
    return this.frameworkService.createFramework(storyId, dto);
  }

  @Put('admin/frameworks/:id')
  @ApiOperation({ summary: '[Admin] Cập nhật thông tin cơ bản khung kịch bản' })
  updateFramework(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoryFrameworkDto,
  ) {
    return this.frameworkService.updateFramework(id, dto);
  }

  @Delete('admin/frameworks/:id')
  @ApiOperation({ summary: '[Admin] Xóa khung kịch bản' })
  deleteFramework(@Param('id', ParseIntPipe) id: number) {
    return this.frameworkService.deleteFramework(id);
  }

  // ─── Phase ─────────────────────────────────────────────────────────────────

  @Post('admin/frameworks/:frameworkId/phases')
  @ApiOperation({ summary: '[Admin] Thêm giai đoạn vào khung kịch bản' })
  addPhase(
    @Param('frameworkId', ParseIntPipe) frameworkId: number,
    @Body() dto: CreateFrameworkPhaseDto,
  ) {
    return this.frameworkService.addPhase(frameworkId, dto);
  }

  @Put('admin/phases/:id')
  @ApiOperation({ summary: '[Admin] Cập nhật giai đoạn' })
  updatePhase(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFrameworkPhaseDto,
  ) {
    return this.frameworkService.updatePhase(id, dto);
  }

  @Delete('admin/phases/:id')
  @ApiOperation({ summary: '[Admin] Xóa giai đoạn' })
  deletePhase(@Param('id', ParseIntPipe) id: number) {
    return this.frameworkService.deletePhase(id);
  }

  // ─── Episode ───────────────────────────────────────────────────────────────

  @Post('admin/phases/:phaseId/episodes')
  @ApiOperation({ summary: '[Admin] Thêm tập vào giai đoạn' })
  addEpisode(
    @Param('phaseId', ParseIntPipe) phaseId: number,
    @Body() dto: CreateFrameworkEpisodeDto,
  ) {
    return this.frameworkService.addEpisode(phaseId, dto);
  }

  @Put('admin/episodes/:id')
  @ApiOperation({ summary: '[Admin] Cập nhật tập' })
  updateEpisode(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFrameworkEpisodeDto,
  ) {
    return this.frameworkService.updateEpisode(id, dto);
  }

  @Patch('admin/episodes/:id/toggle-complete')
  @ApiOperation({ summary: '[Admin] Đánh dấu tập đã/chưa hoàn thành' })
  async toggleEpisodeComplete(@Param('id', ParseIntPipe) id: number) {
    return this.frameworkService.toggleEpisodeComplete(id);
  }

  @Delete('admin/episodes/:id')
  @ApiOperation({ summary: '[Admin] Xóa tập' })
  deleteEpisode(@Param('id', ParseIntPipe) id: number) {
    return this.frameworkService.deleteEpisode(id);
  }
}
