import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { Client } from 'src/entities/users/client.entity';
import { Provider } from 'src/entities/users/provider.entity';
import { User, UserType } from 'src/entities/users/user.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    if (createUserDto.userType === UserType.PROVIDER) {
      const provider = this.providersRepository.create(createUserDto);
      await this.providersRepository.save(provider);
      user.provider = provider;
    }
    if (createUserDto.userType === UserType.CLIENT) {
      const client = this.clientsRepository.create({});
      await this.clientsRepository.save(client);
      user.client = client;
    }
    await this.usersRepository.save(user);
    return user;
  }

  async findOne(userId: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { userId },
      relations: ['client', 'provider'],
    });
    if (user.userType === UserType.PROVIDER) {
      delete user.client;
    }
    if (user.userType === UserType.CLIENT) {
      delete user.provider;
    }
    return user;
  }

  remove(id: number): Promise<DeleteResult> {
    return this.usersRepository.delete(id);
  }
}
