import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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

    const newUser = this.userRepository.create(registerDTO);
    const { id: newUserId } = await this.userRepository.save(newUser);

    return { data: { id: newUserId } };
  }

  async login(loginDTO: LoginDto) {
    const fetchedUser = await this.userRepository.findOne({
      email: loginDTO.email,
    });

    if (
      !fetchedUser ||
      !(await bcrypt.compare(loginDTO.password, fetchedUser.password))
    )
      throw new UnauthorizedException();

    const payload = { email: fetchedUser.email, sub: fetchedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
