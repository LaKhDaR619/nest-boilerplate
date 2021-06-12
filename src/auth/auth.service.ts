import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
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

    const newUser = new User();
    newUser.email = registerDTO.email;
    await newUser.setPassword(registerDTO.password);

    const { id: newUserId } = await this.userRepository.save(newUser);

    return { data: { id: newUserId } };
  }

  async login(loginDTO: LoginDto) {
    const fetchedUser = await this.userRepository.findOne({
      where: {
        email: loginDTO.email,
      },
    });

    if (!fetchedUser || !(await fetchedUser.checkPassword(loginDTO.password)))
      throw new UnauthorizedException();

    const payload = { email: fetchedUser.email, sub: fetchedUser.id };
    return {
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: fetchedUser.id,
          email: fetchedUser.email,
        },
      },
    };
  }

  async currentUser(id: string) {
    const fetchedUser = await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'email'],
    });

    if (!fetchedUser) throw new UnauthorizedException();

    return {
      data: {
        user: fetchedUser,
      },
    };
  }
}
