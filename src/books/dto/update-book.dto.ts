import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  editor?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  adminScore?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  genreIds?: number[];
}
