import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

@Injectable()
export class AuthService {
    
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService){
    
  }

async create(createUserDto: CreateUserDto): Promise <ResponseUserDto> {
    const numRound = 10;
     
    //Desestructurar
    const {email, password} = createUserDto;

    // 1. Verificamos que no existe un usuario con el mismo correo
    const emailExiste = await this.usersRepository.findOneBy( { email } );
    if (emailExiste) {
        const error = {
            "statusCode": 409,
            "error": "Conflict",
            "message": ["El email ya existe"]
        };
        // Si se cumple la condicion el usuario existe en la base de datos
      throw new ConflictException(error);
    }

    // 2. Encriptamos la password
    const hashPassword = await bcrypt.hash(password, numRound);
    createUserDto.password = hashPassword;

    // 3. Guardamos en la base de datos
    const user = await this.usersRepository.save(createUserDto);

    return {
        name: user.name,
        email: user.email
    };
  }

  async login (loginUserDto: LoginUserDto) {
   // Desestructurar
    const {email, password} = loginUserDto;

    // 1. Verificar que el Email existe
    const emailExist = await this.usersRepository.findOneBy( { email });
    if (!emailExist) {
        const error = {
            "statusCode": 404,
            "error": "Not Found",
            "message": ["El usuario no existe"]
        };
        // Si el email no esta registrado
        throw new NotFoundException(error);
    }

    // 2. Comparar que las contraseñas sean iguales
    const matchPassword = await bcrypt.compare(password, emailExist.password);
    if (!matchPassword) {
        const error = {
            "statusCode": 401,
            "error": "Unauthorized",
            "message": ["Contraseña incorrecta"]
        };
        // Si las contraseñas no coincided
        throw new UnauthorizedException(error);
    }

    // 3. Regresar el JWT token
    // Datos significativos
    const payload = {
        sub: emailExist.id,
        name: emailExist.name,
        email: emailExist.email
    };

    const token = await this.jwtService.signAsync(payload);

    return { token };
  }

}
