import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  clientEmail: string;

  @IsString()
  @IsNotEmpty()
  clientPassword: string;
}
