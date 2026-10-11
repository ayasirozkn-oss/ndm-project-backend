import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail({}, { message: 'Geçerli bir email adresi girmelisiniz.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Şifreniz en az 6 karakter olmalıdır.' })
  password: string;
}