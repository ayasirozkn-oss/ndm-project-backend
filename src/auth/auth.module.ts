import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: 'bizim_gizli_anahtarimiz', // Guard'ın aradığı anahtarı buraya verdik!
      signOptions: { expiresIn: '15m' }, // Token süresini de buraya sabitleyebiliriz
    }),
  ],
})
export class AuthModule {}