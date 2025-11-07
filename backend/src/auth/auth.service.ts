import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Usuário padrão para demonstração (em produção, usar banco de dados)
  private readonly users = [
    {
      id: 1,
      username: 'admin',
      password: '$2b$10$rQZ8qZ8qZ8qZ8qZ8qZ8qZ.8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8q', // 'admin123'
      role: 'admin',
    },
  ];

  constructor(private jwtService: JwtService) {
    // Criar hash da senha padrão
    this.initializeDefaultUser();
  }

  private async initializeDefaultUser() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    this.users[0].password = hashedPassword;
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find((u) => u.username === username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}

