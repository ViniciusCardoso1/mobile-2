import { IsString, IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateProfessorDto {
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
  @IsNotEmpty({ message: 'Titulação é obrigatória' })
  titulacao: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
}

