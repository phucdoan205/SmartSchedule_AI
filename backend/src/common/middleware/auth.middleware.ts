import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: any, res: any, next: () => void) {
    const authHeader = req.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        try {
          const secret = process.env.JWT_SECRET || 'mysecretkey123';
          const decoded = this.jwtService.verify(token, { secret });
          req.user = decoded;
        } catch {
          // Token không hợp lệ hoặc đã hết hạn - để req.user là undefined
        }
      }
    }
    next();
  }
}
