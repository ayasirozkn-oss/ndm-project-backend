import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: AuthDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });

      // TS Hatası Çözümü 1: TypeScript'i kandırarak şifreyi siliyoruz
      delete (user as any).password;
      return user;
    } catch (error) {
      // TS Hatası Çözümü 2: Hatanın Prisma hatası (any) olduğunu belirtiyoruz
      if ((error as any).code === 'P2002') {
        throw new ForbiddenException('Bu e-posta adresi zaten kullanımda.');
      }
      throw error;
    }
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    
    if (!user) throw new ForbiddenException('Kullanıcı bulunamadı veya şifre yanlış.');
    
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Kullanıcı bulunamadı veya hatalı şifre.');

    return this.signToken(user.id, user.email);
  }

  private async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret = 'gizli-anahtar-123';
    
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    
    return { access_token: token };
  }
}