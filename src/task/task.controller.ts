import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { AuthGuard } from '../auth/auth.guard';
// Swagger eklentilerini projeye çağırıyoruz
import { ApiHeader, ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger'; 

@ApiTags('Task') // Arayüzde "Task" başlığı altında derli toplu durmasını sağlar
@ApiBearerAuth() // Sağ üstteki token kilidini bu rotalar için aktif eder

@UseGuards(AuthGuard) // Güvenlik Çemberi! Bileti olmayan kimse buraya giremez.
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  createTask(@Request() req: any, @Body() dto: CreateTaskDto) {
    // req.user.sub, Guard'ın içine sakladığı kullanıcı ID'sidir
    return this.taskService.createTask(req.user.sub, dto); 
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Görev başlığında arama yap' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Sayfa numarası (Varsayılan: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Sayfa başına kayıt (Varsayılan: 10)' })
  getTasks(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    // URL'den gelen parametreleri sayıya çeviriyoruz
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Eğer gelen kişinin rolü 'admin' ise, herkesin görevini sayfalı döndür
    if (req.user.role === 'admin') {
        return this.taskService.getAllTasks(search, pageNumber, limitNumber);
    }
    // Değilse, sadece kendi görevlerini sayfalı döndür
    return this.taskService.getTasks(req.user.sub, search, pageNumber, limitNumber);
  }

  @Get('admin/summary')
  getAdminUserSummary(@Request() req: any) {
    // Sadece maymuncuk şifreyi (x-admin-key) kullananların bu raporu çekmesine izin ver
    if (req.user?.role !== 'admin') {
      return { mesaj: 'Erişim engellendi! Bu raporu sadece patron görebilir.' };
    }
    return this.taskService.getAdminUserSummary();
  }

  @Patch(':id')
  updateTask(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    // URL'den gelen 'id' metin olduğu için (Number) ile sayıya çeviriyoruz
    return this.taskService.updateTask(req.user.sub, Number(id), dto);
  }

  @Delete(':id')
  deleteTask(@Request() req: any, @Param('id') id: string) {
    return this.taskService.deleteTask(req.user.sub, Number(id));
  }
}