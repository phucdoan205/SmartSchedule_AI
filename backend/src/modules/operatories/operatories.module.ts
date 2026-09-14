import { Module } from '@nestjs/common';
import { OperatoriesService } from './operatories.service.js';
import { OperatoriesController } from './operatories.controller.js';

@Module({
  controllers: [OperatoriesController],
  providers: [OperatoriesService],
  exports: [OperatoriesService],
})
export class OperatoriesModule {}
