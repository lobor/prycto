import {
  Injectable,
  UnauthorizedException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userModel.findOne({
      email,
      password: this.encrypt(password),
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const token = jwt.sign(
      { ...user.toJSON(), when: Date.now() },
      process.env.JWT_HASH,
    );
    await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { token: { $push: token } },
    );

    return token;
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    password: string,
    confirmPassword: string,
  ): Promise<UserDocument> {
    if (confirmPassword !== password) {
      throw new PreconditionFailedException(
        'Password ans confirm password not match',
      );
    }
    const userBdd = await this.userModel.findOne({
      _id: userId,
      password: this.encrypt(oldPassword),
    });
    if (!userBdd) {
      throw new PreconditionFailedException('User not found');
    }

    return this.updateById(userId, {
      $set: { password: this.encrypt(password) },
    });
  }

  async register(email: string, password: string, confirmPassword: string) {
    if (confirmPassword !== password) {
      throw new PreconditionFailedException(
        'Password ans confirm password not match',
      );
    }
    const userBdd = await this.userModel.findOne({ email });
    if (userBdd) {
      throw new PreconditionFailedException('Email already exist');
    }
    const user = new this.userModel({
      email,
      password: this.encrypt(password),
      createdAt: Date.now(),
    });
    await user.save();

    return user;
  }

  findById(id: string) {
    return this.userModel.findOne({ _id: new Object(id) });
  }

  encrypt(password: string) {
    return CryptoJS.HmacSHA256(process.env.HASH_PASSWORD, password).toString();
  }

  updateUserById(userId: string, doc: UpdateQuery<User>) {
    return this.userModel
      .findOneAndUpdate({ _id: new ObjectId(userId) }, doc, { new: true })
      .exec();
  }

  updateById(
    _id: string,
    document: UpdateQuery<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id }, document, { new: true })
      .exec();
  }

  verifyToken(token): User | false {
    try {
      return jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_HASH,
      ) as User;
    } catch (e) {
      console.error('UserService:verifyToken', e.toString());
      return false;
    }
  }
}
