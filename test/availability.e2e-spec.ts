import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Availability } from 'src/entities/reservations/availability.entity';
import { UserType } from 'src/entities/users/user.entity';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Availability', () => {
  let app: INestApplication;
  let availabilityRepository: Repository<Availability>;
  let clientId: number;
  let providerId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    availabilityRepository = moduleFixture.get<Repository<Availability>>(
      getRepositoryToken(Availability),
    );
    await app.init();

    const createClientResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@email.com',
        userType: UserType.CLIENT,
      })
      .expect(201);

    clientId = createClientResponse.body.client.clientId;

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

    providerId = createProviderResponse.body.provider.providerId;
  });

  afterEach(async () => {
    await availabilityRepository.query(
      'TRUNCATE TABLE users, availability CASCADE',
    );
    await app.close();
  });

  describe('POST /availability', () => {
    it('can create availability for a provider', async () => {
      const date = '2024-06-01';
      // 8:00 am
      const startTime = new Date();
      startTime.setHours(8, 0, 0, 0);

      // 4:30 pm
      const endTime = new Date();
      endTime.setHours(16, 30, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/availability')
        .send({
          providerId,
          date,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(201);

      expect(response.body).toEqual({
        availabilityId: expect.any(Number),
        date,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        provider: {
          providerId: expect.any(Number),
          license: 'abc123',
          state: 'CO',
        },
      });
    });

    it.todo('should guard against overlapping availability');
  });

  describe('GET /availability/{providerId}', () => {
    beforeEach(async () => {
      const date = '2024-06-01';
      // 8:00 am
      const startTime = new Date();
      startTime.setHours(8, 0, 0, 0);

      // 4:30 pm
      const endTime = new Date();
      endTime.setHours(16, 30, 0, 0);

      const createAvailabilityResponse = await request(app.getHttpServer())
        .post('/availability')
        .send({
          providerId,
          date,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(201);
    });

    it('return a providers availability for a given date range', async () => {
      const getAvailabilityResponse = await request(app.getHttpServer())
        .get(`/availability/${providerId}`)
        .query({ startDate: '2024-05-25', endDate: '2024-06-5' })
        .expect(200);
    });
  });
});
