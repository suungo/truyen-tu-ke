import { PartialType } from '@nestjs/swagger';
import {
  CreateFrameworkEpisodeDto,
  CreateFrameworkPhaseDto,
  CreateStoryFrameworkDto,
} from './create-story-framework.dto';

export class UpdateFrameworkEpisodeDto extends PartialType(
  CreateFrameworkEpisodeDto,
) {}

export class UpdateFrameworkPhaseDto extends PartialType(
  CreateFrameworkPhaseDto,
) {}

export class UpdateStoryFrameworkDto extends PartialType(
  CreateStoryFrameworkDto,
) {}
