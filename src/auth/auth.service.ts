import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDTO: RegisterDto): Promise<{ data: { id: string } }> {
    const fetchedUser = await this.userRepository.findOne({
      where: { email: registerDTO.email },
    });

    if (fetchedUser) throw new BadRequestException('email already in use');

    const newUser = new User();
    newUser.email = registerDTO.email;
    await newUser.setPassword(registerDTO.password);

    const { id: newUserId } = await this.userRepository.save(newUser);

    return { data: { id: newUserId } };
  }

  async login(loginDTO: LoginDto) {
    const fetchedUser = await this.userRepository.findOne({
      email: loginDTO.email,
    });

    if (!fetchedUser || !(await fetchedUser.checkPassword(loginDTO.password)))
      throw new UnauthorizedException();

    const payload = { email: fetchedUser.email, sub: fetchedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async currentUser(id: string) {
    return this.userRepository.findOne(id);
  }
}
