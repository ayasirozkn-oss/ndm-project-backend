import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule], // JwtService'i kullanabilmek için ekledik
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}