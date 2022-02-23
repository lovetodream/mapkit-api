import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('ok');
      });
  });

  it('/snapshot/url (GET)', () => {
    return request(app.getHttpServer())
      .get('/snapshot/url')
      .send({ center: 'apple park' })
      .expect(200)
      .expect(
        /^https:\/\/snapshot\.apple-mapkit\.com\/api\/v1\/snapshot\?*center=apple%20park*/,
      );
  });

  describe('/snapshot/data (GET)', () => {
    it('should return data without prefix', () => {
      return request(app.getHttpServer())
        .get('/snapshot/data')
        .send({ center: 'apple park' })
        .expect(200)
        .expect('content-type', 'text/html; charset=utf-8');
    });

    it('should return data with prefix', () => {
      return request(app.getHttpServer())
        .get('/snapshot/data')
        .send({ center: 'apple park', withPrefix: true })
        .expect(200)
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(/data:image\/png;base64,*/);
    });

    it('should fail due to bad request', () => {
      return request(app.getHttpServer()).get('/snapshot/data').expect(400);
    });
  });

  describe('/snapshot/png (GET)', () => {
    it('should return a valid png', () => {
      return request(app.getHttpServer())
        .get('/snapshot/png')
        .send({ center: 'apple park' })
        .expect(200)
        .expect('content-type', 'image/png');
    });

    it('should fail due to bad request', () => {
      return request(app.getHttpServer()).get('/snapshot/png').expect(400);
    });
  });
});
