import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  encrypt = (msg: string) => {
    return CryptoJS.AES.encrypt(
      msg,
      this.configService.get<string>('HASH_BDD'),
    ).toString();
  };

  decrypt = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(
      ciphertext,
      this.configService.get<string>('HASH_BDD'),
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  };
}
