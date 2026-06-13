import { IsArray, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  author!: string;

  @IsNotEmpty()
  @IsString()
  editor!: string;

  @IsNotEmpty()
  @IsString()
  synopsis!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  adminScore!: number;

  @IsArray()
  @IsInt({ each: true })
  genreIds!: number[];
}
