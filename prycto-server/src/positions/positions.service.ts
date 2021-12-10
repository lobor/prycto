import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
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

  async findByExchangeId(
    exchangeId: string,
    other: FilterQuery<PositionDocument> = {},
  ): Promise<PositionDocument[]> {
    return this.positionModel.find({ exchangeId, ...other });
  }

  async findByPositionIds(positionIds: string[]): Promise<PositionDocument[]> {
    return this.positionModel.find({ _id: { $in: positionIds } });
  }

  async findUserId(userId: string): Promise<PositionDocument[]> {
    return this.positionModel.find({ userId }).exec();
  }

  async findManyByExchangeId(
    exchangeIds: string[],
  ): Promise<PositionDocument[]> {
    return this.positionModel.find({ exchangeId: { $in: exchangeIds } });
  }

  async findByPair(
    exchangeId: string,
    pair: string,
  ): Promise<PositionDocument> {
    return this.positionModel.findOne({ exchangeId, pair }).exec();
  }

  async findById(_id: string): Promise<Position> {
    return (await this.positionModel.findOne({ _id }).exec()).toJSON();
  }

  async updateOne(
    _id: string,
    doc: UpdateQuery<Position>,
  ): Promise<PositionDocument> {
    return this.positionModel
      .findOneAndUpdate({ _id }, { $set: doc }, { new: true })
      .exec();
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
