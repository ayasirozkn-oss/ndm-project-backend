import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { AuthGuard } from '../auth/auth.guard';

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
    getTasks(@Request() req: any) {
  // Eğer gelen kişinin rolü 'admin' ise, herkesin görevini döndür
     if (req.user.role === 'admin') {
        return this.taskService.getAllTasks();
  }
  // Değilse, sadece kendi görevlerini döndür
  return this.taskService.getTasks(req.user.sub);
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