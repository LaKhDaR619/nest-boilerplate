import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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
    const fetchedUser = await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'email'],
    });

    if (!fetchedUser) throw new BadRequestException('user not found');

    return {
      data: {
        user: fetchedUser,
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    const fetchedUser = await this.userRepository.findOne(id);

    if (!fetchedUser) throw new BadRequestException('user not found');

    // check if email is used
    const isEmailUsed = await this.userRepository.findOne({
      where: {
        id: Not(id),
        email: updateUserDto.email,
      },
    });

    if (isEmailUsed) throw new BadRequestException('email already used');

    if (updateUserDto.email) fetchedUser.email = updateUserDto.email;
    if (updateUserDto.password) fetchedUser.setPassword(updateUserDto.password);

    await this.userRepository.save(fetchedUser);
  }

  async remove(id: string): Promise<void> {
    const fetchedUser = await this.userRepository.findOne(id);

    if (!fetchedUser) throw new BadRequestException('user not found');

    await this.userRepository.remove(fetchedUser);
  }
}
