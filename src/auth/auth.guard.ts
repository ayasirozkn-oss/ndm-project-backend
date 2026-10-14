import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Admin (Patron) giriş izni
    const adminKey = request.headers['x-admin-key'];
    if (adminKey === 'PATRON_BENIM') {
      request.user = { id: 999, role: 'admin' };
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Kimlik kartı (Token) bulunamadı.');
    }

    try {
      // AuthService ile birebir aynı olan o kritik şifremiz:
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'gizli-anahtar-123',
      });
      request.user = payload;
    } catch (error: any) {
      // Hata detayı dedektifimiz ve TypeScript any düzeltmesi
      console.log("Hata detayı:", error.message);
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş kimlik kartı.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}