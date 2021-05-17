import { IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @MinLength(3)
  password: string;
}
