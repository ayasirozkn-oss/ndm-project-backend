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

  async getTasks(userId: number, search?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit; // Kaç veri atlanacak hesapla
    
    // Arama kelimesi varsa başlıkta (title) arayacak dinamik bir filtre oluşturuyoruz
    const whereCondition = {
      userId: userId,
      ...(search && { title: { contains: search } }) 
    };

    // Veriyi ve toplam sayıyı eşzamanlı olarak çekiyoruz
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // En yeni görevler en üstte gelsin
      }),
      this.prisma.task.count({ where: whereCondition }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTasks(search?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const whereCondition = {
      ...(search && { title: { contains: search } })
    };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where: whereCondition }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
  async getAdminUserSummary() {
    // Prisma ile tüm kullanıcıları ve onlara ait görevleri tek seferde (join) çekiyoruz
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        tasks: true, // Prisma'nın sihri: Kullanıcıya ait tüm görevleri de getir
      },
    });

    // Patron için okuması kolay, şık bir rapora dönüştürüyoruz
    return users.map((user) => ({
      kullaniciId: user.id,
      email: user.email,
      toplamGorevSayisi: user.tasks.length,
      gorevler: user.tasks,
    }));
  }
}