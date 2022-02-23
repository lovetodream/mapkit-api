import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  DataSnapshotParamsDto,
  SnapshotParamsDto,
} from './dto/snapshot-params.dto';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot(), TerminusModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('health', async () => {
      expect((await appController.check()).status).toBe('ok');
    });
  });

  describe('snapshot', () => {
    describe('url', () => {
      it('should return a url with center at apple park', async () => {
        const params = new SnapshotParamsDto();
        params.center = 'apple park';

        expect(appController.getSnapshotUrl(params)).toMatch(
          /^https:\/\/snapshot\.apple-mapkit\.com\/api\/v1\/snapshot\?*center=apple%20park*/,
        );
      });
    });

    describe('data', () => {
      it('should return valid data', async () => {
        const params = new DataSnapshotParamsDto();
        params.center = 'apple park';

        expect(typeof (await appController.getSnapshotData(params))).toBe(
          'string',
        );
      });

      it('should return valid data with prefix', async () => {
        const params = new DataSnapshotParamsDto();
        params.center = 'apple park';
        params.withPrefix = true;

        expect(await appController.getSnapshotData(params)).toMatch(
          /data:image\/png;base64,*/,
        );
      });
    });
  });
});
