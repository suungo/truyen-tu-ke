import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({ example: 'Kỳ ảo' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;
}
