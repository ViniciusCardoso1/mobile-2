import { Injectable } from "@nestjs/common";
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: this.configService.get("DB_HOST", "localhost"),
      port: parseInt(this.configService.get("DB_PORT", "5432"), 10),
      username: this.configService.get("DB_USERNAME", "postgres"),
      password: this.configService.get("DB_PASSWORD", "postgres"),
      database: this.configService.get("DB_NAME", "mobile2"),
      entities: [__dirname + "/../**/*.entity{.ts,.js}"],
      synchronize: false, // Usar migrations
      migrations: [__dirname + "/../migrations/*{.ts,.js}"],
      migrationsRun: true,
      logging: false,
    };
  }
}
