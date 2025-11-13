import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar se username já existe
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException("Username já está em uso");
    }

    // Verificar se email já existe
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException("Email já está em uso");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar usuário
    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: "user",
    });

    const savedUser = await this.userRepository.save(user);

    // Retornar sem a senha
    const { password: _, ...result } = savedUser;
    return result;
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
