import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'src/entities/users/client.entity';
import { Provider } from 'src/entities/users/provider.entity';
import { User } from 'src/entities/users/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Provider, Client])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
