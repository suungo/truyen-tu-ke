import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReaderDto {
  @ApiProperty({ example: 'nguyen_van_a' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  username: string;
}
