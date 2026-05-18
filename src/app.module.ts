import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lead } from './leads/entities/lead.entity';
import { LeadsModule } from './leads/leads.module';
import { AiModule } from './ai/ai.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'admin'),
        password: configService.get<string>('DATABASE_PASS', 'root'),
        database: configService.get<string>('DATABASE_NAME', 'omc_leads'),

        entities: [Lead],

        synchronize: true,
      }),
    }),

    LeadsModule,

    AiModule,

    AuthModule,
  ],
  controllers: [AuthController],
})
export class AppModule {}
