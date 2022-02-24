import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  DataSnapshotParamsDto,
  SnapshotParamsDto,
} from './dto/snapshot-params.dto';
import { encode } from './helper/base64-arraybuffer.conversion';

@Injectable()
export class AppService implements OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name);

  teamId: string;
  keyId: string;
  key: string;

  constructor(private httpService: HttpService) {
    this.teamId = process.env.TEAM_ID;
    this.keyId = process.env.KEY_ID;
    this.key = process.env.KEY;
  }

  onApplicationShutdown(signal: string) {
    this.logger.log(`Shutting down due to signal ${signal}...`);
  }

  getSnapshotUrl(dto: SnapshotParamsDto): string {
    const params = this.paramsBuilder(dto);
    return `https://snapshot.apple-mapkit.com${this.signRequest(params)}`;
  }

  async getSnapshotData(dto: DataSnapshotParamsDto): Promise<string> {
    const url = this.getSnapshotUrl(dto);
    const data = await this.performMapkitCall(url);
    const base64 = encode(data);
    if (dto.withPrefix) {
      return `data:image/png;base64,${base64}`;
    }
    return base64;
  }

  async getSnapshotPng(dto: SnapshotParamsDto, response: Response) {
    const url = this.getSnapshotUrl(dto);
    const data = await this.performMapkitCall(url);
    response.setHeader('Content-Type', 'image/png');
    response.type('png');
    response.send(data);
  }

  private paramsBuilder(dto: SnapshotParamsDto): string {
    let params = '';
    params += `center=${encodeURIComponent(dto.center)}&`;
    params += `z=${encodeURIComponent(dto.zoomLevel)}&`;
    if (dto.coordinateSpan) {
      params += `spn=${encodeURIComponent(dto.coordinateSpan)}&`;
    }
    params += `size=${encodeURIComponent(dto.size)}&`;
    params += `scale=${encodeURIComponent(dto.scale)}&`;
    params += `t=${encodeURIComponent(dto.type)}&`;
    params += `colorScheme=${encodeURIComponent(dto.colorScheme)}&`;
    params += `poi=${encodeURIComponent(dto.showPoints ? 1 : 0)}&`;
    params += `lang=${encodeURIComponent(dto.language)}&`;
    if (dto.annotations?.length > 0) {
      `annotations=${encodeURIComponent(JSON.stringify(dto.annotations))}&`;
    }
    if (dto.overlays?.length > 0) {
      const overlays = JSON.stringify(dto.overlays);
      `overlays=${encodeURIComponent(overlays)}&`;
    }
    if (dto.referrer) {
      params += `referrer=${encodeURIComponent(dto.referrer)}&`;
    }
    if (dto.expires) {
      params += `expires=${encodeURIComponent(dto.expires)}&`;
    }
    if (dto.images?.length > 0) {
      const images = JSON.stringify(dto.images);
      params += `imgs=${encodeURIComponent(images)}`;
    }
    if (params.endsWith('&')) {
      params = params.slice(0, -1);
    }
    return params;
  }

  private signRequest(params: string): string {
    const snapshotPath = `/api/v1/snapshot?${params}`;
    const completePath = `${snapshotPath}&teamId=${this.teamId}&keyId=${this.keyId}`;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const signature = require('jwa')('ES256').sign(completePath, this.key);

    return `${completePath}&signature=${signature}`;
  }

  private async performMapkitCall(url: string): Promise<ArrayBuffer> {
    try {
      return (
        await firstValueFrom(
          this.httpService.get(url, { responseType: 'arraybuffer' }),
        )
      ).data;
    } catch (error) {
      throw new BadRequestException(
        JSON.parse(new TextDecoder().decode(error.response.data)),
      );
    }
  }
}
