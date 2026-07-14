import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoryFramework } from '../stories/entities/story-framework.entity';
import { FrameworkPhase } from '../stories/entities/framework-phase.entity';
import { FrameworkEpisode } from '../stories/entities/framework-episode.entity';
import { Story } from '../stories/entities/story.entity';
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
import { BaseResponse } from 'src/common/responses/base-response';

@Injectable()
export class FrameworkService {
  constructor(
    @InjectRepository(StoryFramework)
    private readonly frameworkRepo: Repository<StoryFramework>,
    @InjectRepository(FrameworkPhase)
    private readonly phaseRepo: Repository<FrameworkPhase>,
    @InjectRepository(FrameworkEpisode)
    private readonly episodeRepo: Repository<FrameworkEpisode>,
    @InjectRepository(Story)
    private readonly storyRepo: Repository<Story>,
  ) {}

  // ─── Framework ────────────────────────────────────────────────────────────

  async getFrameworkByStory(storyId: number) {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');

    const framework = await this.frameworkRepo.findOne({
      where: { storyId },
      relations: ['phases', 'phases.episodes', 'story'],
    });

    return new BaseResponse(
      200,
      'Lấy khung kịch bản thành công',
      framework || null,
    );
  }

  async getAllFrameworks() {
    const frameworks = await this.frameworkRepo.find({
      relations: ['story', 'story.genre'],
      order: { createdAt: 'DESC' },
    });
    return new BaseResponse(
      200,
      'Lấy danh sách khung kịch bản thành công',
      frameworks,
    );
  }

  async createFramework(storyId: number, dto: CreateStoryFrameworkDto) {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');

    const existing = await this.frameworkRepo.findOne({ where: { storyId } });
    if (existing) {
      // Update the existing framework instead
      Object.assign(existing, {
        totalEpisodes: dto.totalEpisodes,
        overview: dto.overview,
      });
      await this.frameworkRepo.save(existing);

      if (dto.phases) {
        // Remove old phases and recreate
        await this.phaseRepo.delete({ frameworkId: existing.id });
        for (let i = 0; i < dto.phases.length; i++) {
          await this.createPhaseInternal(existing.id, dto.phases[i], i);
        }
      }

      const updated = await this.frameworkRepo.findOne({
        where: { id: existing.id },
        relations: ['phases', 'phases.episodes', 'story'],
      });
      return new BaseResponse(
        200,
        'Cập nhật khung kịch bản thành công',
        updated,
      );
    }

    const framework = this.frameworkRepo.create({
      storyId,
      totalEpisodes: dto.totalEpisodes,
      overview: dto.overview,
    });
    const savedFw = await this.frameworkRepo.save(framework);

    if (dto.phases) {
      for (let i = 0; i < dto.phases.length; i++) {
        await this.createPhaseInternal(savedFw.id, dto.phases[i], i);
      }
    }

    const full = await this.frameworkRepo.findOne({
      where: { id: savedFw.id },
      relations: ['phases', 'phases.episodes', 'story'],
    });
    return new BaseResponse(201, 'Tạo khung kịch bản thành công', full);
  }

  async updateFramework(frameworkId: number, dto: UpdateStoryFrameworkDto) {
    const framework = await this.frameworkRepo.findOne({
      where: { id: frameworkId },
    });
    if (!framework)
      throw new NotFoundException('Không tìm thấy khung kịch bản');
    Object.assign(framework, dto);
    const saved = await this.frameworkRepo.save(framework);
    return new BaseResponse(200, 'Cập nhật khung kịch bản thành công', saved);
  }

  async deleteFramework(frameworkId: number) {
    const framework = await this.frameworkRepo.findOne({
      where: { id: frameworkId },
    });
    if (!framework)
      throw new NotFoundException('Không tìm thấy khung kịch bản');
    await this.frameworkRepo.remove(framework);
    return new BaseResponse(200, 'Xóa khung kịch bản thành công', null);
  }

  // ─── Phase ────────────────────────────────────────────────────────────────

  private async createPhaseInternal(
    frameworkId: number,
    dto: CreateFrameworkPhaseDto,
    order: number,
  ) {
    const phase = this.phaseRepo.create({
      frameworkId,
      title: dto.title,
      description: dto.description,
      episodeFrom: dto.episodeFrom,
      episodeTo: dto.episodeTo,
      order: dto.order ?? order,
    });
    const savedPhase = await this.phaseRepo.save(phase);

    if (dto.episodes) {
      for (let i = 0; i < dto.episodes.length; i++) {
        await this.createEpisodeInternal(savedPhase.id, dto.episodes[i], i);
      }
    }
    return savedPhase;
  }

  async addPhase(frameworkId: number, dto: CreateFrameworkPhaseDto) {
    const framework = await this.frameworkRepo.findOne({
      where: { id: frameworkId },
    });
    if (!framework)
      throw new NotFoundException('Không tìm thấy khung kịch bản');

    const count = await this.phaseRepo.count({ where: { frameworkId } });
    const phase = await this.createPhaseInternal(frameworkId, dto, count);

    const full = await this.phaseRepo.findOne({
      where: { id: phase.id },
      relations: ['episodes'],
    });
    return new BaseResponse(201, 'Thêm giai đoạn thành công', full);
  }

  async updatePhase(phaseId: number, dto: UpdateFrameworkPhaseDto) {
    const phase = await this.phaseRepo.findOne({ where: { id: phaseId } });
    if (!phase) throw new NotFoundException('Không tìm thấy giai đoạn');
    const phaseData = { ...dto };
    delete (phaseData as any).episodes;
    Object.assign(phase, phaseData);
    const saved = await this.phaseRepo.save(phase);
    return new BaseResponse(200, 'Cập nhật giai đoạn thành công', saved);
  }

  async deletePhase(phaseId: number) {
    const phase = await this.phaseRepo.findOne({ where: { id: phaseId } });
    if (!phase) throw new NotFoundException('Không tìm thấy giai đoạn');
    await this.phaseRepo.remove(phase);
    return new BaseResponse(200, 'Xóa giai đoạn thành công', null);
  }

  // ─── Episode ──────────────────────────────────────────────────────────────

  private async createEpisodeInternal(
    phaseId: number,
    dto: CreateFrameworkEpisodeDto,
    order: number,
  ) {
    const ep = this.episodeRepo.create({
      phaseId,
      episodeNumber: dto.episodeNumber,
      title: dto.title,
      synopsis: dto.synopsis,
      keyEvents: dto.keyEvents,
      charactersInvolved: dto.charactersInvolved,
      isCompleted: dto.isCompleted ?? false,
      order: dto.order ?? order,
    });
    return await this.episodeRepo.save(ep);
  }

  async addEpisode(phaseId: number, dto: CreateFrameworkEpisodeDto) {
    const phase = await this.phaseRepo.findOne({ where: { id: phaseId } });
    if (!phase) throw new NotFoundException('Không tìm thấy giai đoạn');

    const count = await this.episodeRepo.count({ where: { phaseId } });
    const ep = await this.createEpisodeInternal(phaseId, dto, count);
    return new BaseResponse(201, 'Thêm tập thành công', ep);
  }

  async updateEpisode(episodeId: number, dto: UpdateFrameworkEpisodeDto) {
    const ep = await this.episodeRepo.findOne({ where: { id: episodeId } });
    if (!ep) throw new NotFoundException('Không tìm thấy tập');
    Object.assign(ep, dto);
    const saved = await this.episodeRepo.save(ep);
    return new BaseResponse(200, 'Cập nhật tập thành công', saved);
  }

  async deleteEpisode(episodeId: number) {
    const ep = await this.episodeRepo.findOne({ where: { id: episodeId } });
    if (!ep) throw new NotFoundException('Không tìm thấy tập');
    await this.episodeRepo.remove(ep);
    return new BaseResponse(200, 'Xóa tập thành công', null);
  }

  async toggleEpisodeComplete(episodeId: number) {
    const ep = await this.episodeRepo.findOne({ where: { id: episodeId } });
    if (!ep) throw new NotFoundException('Không tìm thấy tập');
    ep.isCompleted = !ep.isCompleted;
    const saved = await this.episodeRepo.save(ep);
    return new BaseResponse(200, 'Cập nhật trạng thái tập thành công', saved);
  }
}
