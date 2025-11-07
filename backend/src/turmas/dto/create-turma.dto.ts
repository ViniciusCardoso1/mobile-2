import { IsString, IsNotEmpty, IsInt, Min, Max, Length, Matches, IsOptional, IsUUID } from 'class-validator';

export class CreateTurmaDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(3, 255, { message: 'Nome deve ter entre 3 e 255 caracteres' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @Length(3, 50, { message: 'Código deve ter entre 3 e 50 caracteres' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Código deve conter apenas letras maiúsculas e números' })
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'Período é obrigatório' })
  @Matches(/^\d{4}\/[12]$/, { message: 'Período deve estar no formato YYYY/1 ou YYYY/2' })
  periodo: string;

  @IsInt({ message: 'Capacidade deve ser um número inteiro' })
  @Min(5, { message: 'Capacidade mínima é 5 alunos' })
  @Max(50, { message: 'Capacidade máxima é 50 alunos' })
  capacidade: number;

  @IsOptional()
  @IsUUID('4', { message: 'ID do professor deve ser um UUID válido' })
  professor?: string;
}

