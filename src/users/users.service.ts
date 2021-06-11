import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<any> {
    const fetchedUsers = await this.userRepository.find({
      select: ['id', 'email'],
    });

    return {
      data: {
        users: fetchedUsers,
      },
    };
  }

  async findOne(id: string) {
    const fetchedUser = await this.userRepository.findOne({ id });

    if (!fetchedUser) throw new BadRequestException('user not found');

    return {
      data: {
        user: fetchedUser,
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    const fetchedUser = await this.userRepository.findOne({ id });

    if (!fetchedUser) throw new BadRequestException('user not found');

    if (updateUserDto.email) fetchedUser.email = updateUserDto.email;
    if (updateUserDto.password) fetchedUser.password = updateUserDto.password;

    await this.userRepository.save(fetchedUser);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete({ id });
  }
}
