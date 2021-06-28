import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position, PositionDocument } from './positions.schema';

@Injectable()
export class PositionsService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<PositionDocument>,
  ) {}

  async findAll(): Promise<Position[]> {
    return this.positionModel.find().exec();
  }

  async findByExchangeId(exchangeId: string): Promise<PositionDocument[]> {
    return this.positionModel.find({ exchangeId });
  }
}
