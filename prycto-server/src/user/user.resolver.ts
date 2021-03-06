import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, ID, Context } from '@nestjs/graphql';
import { UseUser } from './decorators/user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { User } from './user.model';
import { User as UserSchema } from './user.schema';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    return this.userService.login(email, password);
  }

  @Mutation(() => Boolean)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('confirmPassword') confirmPassword: string,
  ): Promise<boolean> {
    await this.userService.register(email, password, confirmPassword);
    return true;
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateUser(
    @Context() ctx: { user: User },
    @Args('_id', { type: () => ID }) _id: string,
    @Args('email') email: string,
  ): Promise<User> {
    return this.userService.updateById(ctx.user._id.toString(), {
      $set: { email },
    });
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updatePassword(
    @Context() ctx: { user: User },
    @Args('oldPassword') oldPassword: string,
    @Args('password') password: string,
    @Args('confirmPassword') confirmPassword: string,
  ): Promise<User> {
    return this.userService.updatePassword(
      ctx.user._id,
      oldPassword,
      password,
      confirmPassword,
    );
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async user(@UseUser() user: UserSchema): Promise<User> {
    return user;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async logout(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('confirmPassword') confirmPassword: string,
  ): Promise<boolean> {
    await this.userService.register(email, password, confirmPassword);
    return true;
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateLang(
    @UseUser() user: UserSchema,
    @Args('lang') lang: string,
  ): Promise<User> {
    return this.userService.updateUserById(user._id, { $set: { lang } });
  }
}
