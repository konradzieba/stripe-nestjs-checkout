import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PingDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email to ping' })
  @IsEmail()
  email!: string;
}
