import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GenresModule } from './genres/genres.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RatingModule } from './rating/rating.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    AuthModule,
    BooksModule,
    GenresModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
    type: 'postgres',     
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    autoLoadEntities: true,
    synchronize: true,
    ssl: { rejectUnauthorized: false },
  }),
    RatingModule,],
    controllers: [AppController],
    providers: [AppService],
  })
export class AppModule {}
