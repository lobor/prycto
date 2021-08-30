import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PubSubService {
  private pubSub: RedisPubSub;
  constructor(private configService: ConfigService) {
    const options = {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<string>('REDIS_PORT'),
    };

    this.pubSub = new RedisPubSub({
      publisher: new Redis(options),
      subscriber: new Redis(options),
    });
  }

  publish(name: string, payload: any) {
    return this.pubSub.publish(name, payload);
  }

  asyncIterator(name: string) {
    return this.pubSub.asyncIterator(name);
  }
}
