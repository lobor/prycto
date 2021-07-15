import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserImport } from './user.schema';

@Module({
  imports: [UserImport],
  providers: [UserService, UserResolver]
})
export class UserModule {}
