import {
  Body,
  Controller,
  Get,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import {
  DataSnapshotParamsDto,
  SnapshotParamsDto,
} from './dto/snapshot-params.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('snapshot/url')
  @UsePipes(new ValidationPipe({ transform: true }))
  getSnapshotUrl(@Body() params: SnapshotParamsDto): string {
    return this.appService.getSnapshotUrl(params);
  }

  @Get('snapshot/data')
  @UsePipes(new ValidationPipe({ transform: true }))
  getSnapshotData(@Body() params: DataSnapshotParamsDto): Promise<string> {
    return this.appService.getSnapshotData(params);
  }

  @Get('snapshot/png')
  @UsePipes(new ValidationPipe({ transform: true }))
  getSnapshotPng(@Body() params: SnapshotParamsDto, @Res() response: Response) {
    return this.appService.getSnapshotPng(params, response);
  }
}
