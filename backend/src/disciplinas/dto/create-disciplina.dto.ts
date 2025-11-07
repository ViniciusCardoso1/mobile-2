import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, Length, Matches } from 'class-validator';

export class CreateDisciplinaDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(3, 255, { message: 'Nome deve ter entre 3 e 255 caracteres' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @Length(3, 50, { message: 'Código deve ter entre 3 e 50 caracteres' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Código deve conter apenas letras maiúsculas e números' })
  codigo: string;

  @IsInt({ message: 'Carga horária deve ser um número inteiro' })
  @Min(20, { message: 'Carga horária mínima é 20 horas' })
  @Max(200, { message: 'Carga horária máxima é 200 horas' })
  carga_horaria: number;

  @IsString()
  @IsNotEmpty({ message: 'Departamento é obrigatório' })
  @Length(3, 255, { message: 'Departamento deve ter entre 3 e 255 caracteres' })
  departamento: string;

  @IsOptional()
  @IsString()
  ementa?: string;
}

