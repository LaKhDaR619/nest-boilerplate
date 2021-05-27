import {
  Controller,
  Request,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request as Req } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
@ApiUnauthorizedResponse()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse()
  async register(@Body() body: RegisterDto) {
    const result = { data: await this.authService.register(body) };
    return result;
  }

  @Post('login')
  @ApiCreatedResponse()
  async login(@Body() body: LoginDto, @Request() req: Req) {
    const result = { data: await this.authService.login(body) };

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('current-user')
  @ApiOkResponse()
  async currentUser(@Request() req: Req) {
    const { userId } = req.user as any;
    const result = { data: await this.authService.currentUser(userId) };
    return result;
  }
}
