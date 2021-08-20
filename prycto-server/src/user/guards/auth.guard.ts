import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserService } from '../user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(
    context: ExecutionContext & { user: any },
  ): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (!ctx.token) {
      throw new UnauthorizedException('notLogin');
    }

    const decoded = this.userService.verifyToken(ctx.token);

    if (!decoded) {
      throw new UnauthorizedException('notLogin');
    }

    const user = await this.userService.findById(decoded._id);
    if (!user) {
      throw new UnauthorizedException('notLogin');
    }
    ctx.user = user;
    return true;
  }
}
