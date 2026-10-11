import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [AuthModule, PrismaModule, TaskModule], // PrismaModule'ü buraya ekledik
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}