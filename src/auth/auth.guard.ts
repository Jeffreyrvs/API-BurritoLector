import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    
    constructor (private jwtService: JwtService) {

    }

    async canActivate(context: ExecutionContext,): Promise<boolean> {
        // 1.1 Obtener la solicitud del cliente
        const request = context.switchToHttp().getRequest();
        // 1.2 Obtener el token
        const token = this.extractTokenFromHeader(request);

        if(!token) {
            throw new UnauthorizedException('Acceso invalido, falta el token requerido')
        }
        try {
            // Payload - carga util
            const payload = await this.jwtService.verifyAsync(token);
            // Agregamos a nuestra solicitud el usuario que verificamos
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException('Token expirado o invalido');
        }
        return true;
        
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

}