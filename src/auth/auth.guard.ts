import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) throw new UnauthorizedException('Kimlik kartı (Token) bulunamadı.');

    try {
      // Token'ı gizli anahtarımızla doğruluyoruz
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'gizli-anahtar-123',
      });
      // Bilet geçerliyse, kullanıcının ID'sini (payload.sub) isteğin içine saklıyoruz
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş kimlik kartı.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}