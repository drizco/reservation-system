import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserType } from 'src/entities/users/user.entity';

export class CreateUserDto {
  firstName: string;

  lastName: string;

  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsOptional()
  @IsString()
  license?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
