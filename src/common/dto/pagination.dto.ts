import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(20)
  limit: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  offset: number;
}
