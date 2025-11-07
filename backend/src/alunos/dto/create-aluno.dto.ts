import { IsString, IsEmail, IsNotEmpty, Length, Matches, IsOptional, IsUUID } from 'class-validator';

export class CreateAlunoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(3, 255, { message: 'Nome deve ter entre 3 e 255 caracteres' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Matrícula é obrigatória' })
  @Length(3, 50, { message: 'Matrícula deve ter entre 3 e 50 caracteres' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Matrícula deve conter apenas letras maiúsculas e números' })
  matricula: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve conter 10 ou 11 dígitos' })
  telefone: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID da turma deve ser um UUID válido' })
  turma?: string;
}

