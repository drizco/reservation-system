import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserType } from 'src/entities/users/user.entity';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';

describe('Users', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await app.init();
  });

  afterEach(async () => {
    await usersRepository.query('TRUNCATE TABLE users CASCADE');
    await app.close();
  });

  describe('POST /users', () => {
    it('can create a client user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@email.com',
          userType: UserType.CLIENT,
        })
        .expect(201);

      expect(response.body).toEqual({
        userId: expect.any(Number),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@email.com',
        userType: UserType.CLIENT,
        client: {
          clientId: expect.any(Number),
        },
      });
    });

    it('can create a provider user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Dr. John',
          lastName: 'Doe',
          email: 'drjohn@email.com',
          userType: UserType.PROVIDER,
          state: 'CO',
          license: 'abc123',
        })
        .expect(201);

      expect(response.body).toEqual({
        userId: expect.any(Number),
        firstName: 'Dr. John',
        lastName: 'Doe',
        email: 'drjohn@email.com',
        userType: UserType.PROVIDER,
        provider: {
          providerId: expect.any(Number),
          state: 'CO',
          license: 'abc123',
        },
      });
    });
  });

  describe('Get /users/{userId}', () => {
    let clientUserId: number;
    let providerUserId: number;
    beforeEach(async () => {
      const createClientResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@email.com',
          userType: UserType.CLIENT,
        })
        .expect(201);

      clientUserId = createClientResponse.body.userId;

      const createProviderResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Dr. John',
          lastName: 'Doe',
          email: 'drjohn@email.com',
          userType: UserType.PROVIDER,
          state: 'CO',
          license: 'abc123',
        })
        .expect(201);

      providerUserId = createProviderResponse.body.userId;
    });

    it('should fetch a client', async () => {
      const fetchClientResponse = await request(app.getHttpServer())
        .get(`/users/${clientUserId}`)
        .expect(200);

      expect(fetchClientResponse.body).toEqual({
        userId: clientUserId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@email.com',
        userType: UserType.CLIENT,
        client: {
          clientId: expect.any(Number),
        },
      });
    });

    it('should fetch a provider', async () => {
      const fetchProviderResponse = await request(app.getHttpServer())
        .get(`/users/${providerUserId}`)
        .expect(200);

      expect(fetchProviderResponse.body).toEqual({
        userId: providerUserId,
        firstName: 'Dr. John',
        lastName: 'Doe',
        email: 'drjohn@email.com',
        userType: UserType.PROVIDER,
        provider: {
          providerId: expect.any(Number),
          state: 'CO',
          license: 'abc123',
        },
      });
    });
  });
});
