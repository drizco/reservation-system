import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { addDays, addHours, format, setHours, startOfToday } from 'date-fns';
import { Availability } from 'src/entities/reservations/availability.entity';
import { UserType } from 'src/entities/users/user.entity';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Reservations', () => {
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

    // not done in time
    it.todo('should guard against overlapping availability');
  });

  describe('GET /availability/{providerId}', () => {
    let date;
    let availabilityId;
    beforeEach(async () => {
      date = startOfToday();
      // 8:00 am
      const startTime = setHours(date, 8);
      // 4:30 pm
      const endTime = addHours(startTime, 8.5);

      const availabilityResponse = await request(app.getHttpServer())
        .post('/availability')
        .send({
          providerId,
          date: format(date, 'yyyy-MM-dd'),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(201);

      availabilityId = availabilityResponse.body.availabilityId;
    });

    it('should return a providers availability for a given date range', async () => {
      const getAvailabilityResponse = await request(app.getHttpServer())
        .get(`/availability/${providerId}`)
        .expect(200);

      const availability = getAvailabilityResponse.body;

      expect(availability).toHaveLength(1);
      expect(availability[0].appointments).toHaveLength((8.5 * 60) / 15);
    });

    it('should not return availability outside a given range', async () => {
      const getAvailabilityResponse = await request(app.getHttpServer())
        .get(`/availability/${providerId}`)
        .query({ startDate: addDays(new Date(), 1).toISOString() })
        .expect(200);

      const availability = getAvailabilityResponse.body;

      expect(availability).toHaveLength(0);
    });

    it('should not return appointments that are taken', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .send({
          availabilityId,
          providerId,
          appointmentTime: addHours(date, 9.25).toISOString(),
        })
        .expect(201);

      const getAvailabilityResponse = await request(app.getHttpServer())
        .get(`/availability/${providerId}`)
        .expect(200);

      const availability = getAvailabilityResponse.body;

      expect(availability[0].appointments).toHaveLength((8.5 * 60) / 15 - 1);
    });

    // not done in time
    it.todo('should only return future availability');

    it.todo('should limit number of days to 2 weeks');
  });

  describe('POST /appointments', () => {
    let date;
    let formattedDate;
    let availabilityId;
    beforeEach(async () => {
      date = startOfToday();
      formattedDate = format(date, 'yyyy-MM-dd');
      // 8:00 am
      const startTime = setHours(date, 8);
      // 4:30 pm
      const endTime = addHours(startTime, 8.5);

      const availabilityResponse = await request(app.getHttpServer())
        .post('/availability')
        .send({
          providerId,
          date: formattedDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(201);

      availabilityId = availabilityResponse.body.availabilityId;
    });

    it('should create an appointment', async () => {
      const appointmentTime = addHours(date, 9.25).toISOString();
      const appointmentResponse = await request(app.getHttpServer())
        .post('/appointments')
        .send({
          availabilityId,
          providerId,
          appointmentTime,
        })
        .expect(201);

      expect(appointmentResponse.body).toEqual({
        appointmentId: expect.any(Number),
        appointmentTime: appointmentTime,
        availability: {
          availabilityId: expect.any(Number),
          date: formattedDate,
          endTime: expect.any(String),
          startTime: expect.any(String),
        },
        confirmed: false,
      });
    });

    // not done in time
    it.todo('should not create an appointment if the time is taken');

    it.todo('should not create an appointment outside of availability hours');

    it.todo('should not create an appointment within 24 hours');

    it.todo('should trigger a cron job to handle releasing the apppointment');
  });

  describe('PATCH /appointments/{appointmentId}/confirm', () => {
    let date;
    let formattedDate;
    let availabilityId;
    let appointmentId;
    let appointmentTime;

    beforeEach(async () => {
      date = startOfToday();
      formattedDate = format(date, 'yyyy-MM-dd');
      // 8:00 am
      const startTime = setHours(date, 8);
      // 4:30 pm
      const endTime = addHours(startTime, 8.5);
      // 9:15
      appointmentTime = addHours(date, 9.25).toISOString();

      const availabilityResponse = await request(app.getHttpServer())
        .post('/availability')
        .send({
          providerId,
          date: formattedDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(201);

      availabilityId = availabilityResponse.body.availabilityId;

      const appointmentResponse = await request(app.getHttpServer())
        .post('/appointments')
        .send({
          availabilityId,
          providerId,
          appointmentTime,
        })
        .expect(201);

      appointmentId = appointmentResponse.body.appointmentId;
    });

    it('should confirm an appointment', async () => {
      const appointmentResponse = await request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}/confirm`)
        .expect(200);
      expect(appointmentResponse.body).toEqual({
        appointmentId: expect.any(Number),
        appointmentTime,
        confirmed: true,
      });
    });
  });
});
