import { IsString, IsNotEmpty, IsNumber, Min, Max, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotaDto {
  @IsUUID('4', { message: 'ID do aluno deve ser um UUID válido' })
  @IsNotEmpty({ message: 'Aluno é obrigatório' })
  aluno: string;

  @IsUUID('4', { message: 'ID da disciplina deve ser um UUID válido' })
  @IsNotEmpty({ message: 'Disciplina é obrigatória' })
  disciplina: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Nota deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Nota mínima é 0' })
  @Max(10, { message: 'Nota máxima é 10' })
  @IsNotEmpty({ message: 'Nota é obrigatória' })
  nota: number;

  @IsDateString({}, { message: 'Data deve estar no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data é obrigatória' })
  data: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

