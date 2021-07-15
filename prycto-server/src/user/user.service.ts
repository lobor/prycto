import {
  Injectable,
  UnauthorizedException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    return this.userModel.findOne({ _id: id });
  }

  encrypt(password: string) {
    return CryptoJS.HmacSHA256(process.env.HASH_PASSWORD, password).toString();
  }

  verifyToken(token): User | false {
    try {
      return jwt.verify(token.replace('Bearer ', ''), process.env.JWT_HASH) as User;
    } catch(e) {
      console.error('UserService:verifyToken', e.toString())
      return false;
    }
  }
}
