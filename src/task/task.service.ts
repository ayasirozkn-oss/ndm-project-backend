import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  // 1. YENİ GÖREV EKLEME
  async createTask(userId: number, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        userId: userId, // Görevin sahibini mühürlüyoruz
        title: dto.title,
        description: dto.description,
      },
    });
    return task;
  }

  // 2. KULLANICININ TÜM GÖREVLERİNİ GETİRME
  async getTasks(userId: number) {
    return this.prisma.task.findMany({
      where: {
        userId: userId, // Sadece bu ID'ye ait görevleri getirir
      },
    });
  }

  // 3. GÖREV GÜNCELLEME (Tamamlandı işaretleme veya isim değiştirme)
  async updateTask(userId: number, taskId: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Görev bulunamadı veya bu görevi değiştirmeye yetkiniz yok.');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { ...dto },
    });
  }

  // 4. GÖREV SİLME
  async deleteTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Görev bulunamadı veya silmeye yetkiniz yok.');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Görev başarıyla silindi' };
  }
}