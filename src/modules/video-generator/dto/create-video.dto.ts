import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  script: string;

  @IsOptional()
  @IsString()
  voice?: string; // vi-VN-NamMinhNeural | vi-VN-HoaiMyNeural

  @IsOptional()
  rate?: string; // e.g. "+0%" | "+10%" | "-10%"
}
