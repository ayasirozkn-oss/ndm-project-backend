import {Body,Controller, Post} from '@nestjs/common';
import {AuthService}from './auth.service';
import {AuthDto} from  './dto/auth.dto';

@Controller('auth') //gelen isteklerin rotası
export class AuthController{
    constructor(private authService: AuthService){}
    @Post('register') // http://localhost:3000/auth/register adresine POST isteği gelirse burası çalışır
  register(@Body() dto: AuthDto) {
    // @Body() sayesinde dışarıdan gelen email ve şifreyi alıp doğrudan servisimize gönderiyoruz
    return this.authService.register(dto);
  }
    @Post('login') // http://localhost:3000/auth/login adresine POST isteği gelirse burası çalışır
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
    }

