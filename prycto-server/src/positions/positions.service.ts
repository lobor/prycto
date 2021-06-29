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

  async findByPair(
    exchangeId: string,
    pair: string,
  ): Promise<PositionDocument> {
    return this.positionModel.findOne({ exchangeId, pair }).exec();
  }

  async deleteOne(_id: string): Promise<void> {
    await this.positionModel.deleteOne({ _id });
  }

  async insertOne(position: Omit<Position, '_id'>): Promise<Position> {
    const positionSaved = new this.positionModel(position);
    await positionSaved.save();
    return positionSaved.toJSON();
  }
}
