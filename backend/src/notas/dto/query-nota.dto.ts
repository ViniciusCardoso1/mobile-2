import { IsOptional, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNotaDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID('4')
  aluno?: string;

  @IsOptional()
  @IsUUID('4')
  disciplina?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

