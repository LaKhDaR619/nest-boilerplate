import { ApiParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdDto {
  @IsUUID()
  id: string;
}
