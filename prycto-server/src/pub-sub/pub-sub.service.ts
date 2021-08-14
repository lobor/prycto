import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';

@Injectable()
export class PubSubService {
  private pubSub: RedisPubSub;
  constructor() {
    const options = {
      host: 'localhost',
      port: 6377,
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
