import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { Cours, CoursDocument } from './cours.schema';

@Injectable()
export class CoursService {
  constructor(
    @InjectModel(Cours.name)
    private readonly coursModel: Model<CoursDocument>,
  ) {}

  findByExchangeIdAndSymbol(
    _id: string,
    symbol,
  ): Query<CoursDocument[], CoursDocument, Record<string, unknown>> {
    return this.coursModel.find({ exchangeId: _id, symbol });
  }

  insertMany(doc: Omit<Cours, '_id'>[]) {
    return this.coursModel.insertMany(doc);
  }
}
