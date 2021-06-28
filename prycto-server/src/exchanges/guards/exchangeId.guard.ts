import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExchangeService } from '../service';

@Injectable()
export class EchangeIdGuard implements CanActivate {
  constructor(private exchangeService: ExchangeService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (!ctx.exchangeId) {
      return false;
    }

    const exchange = await this.exchangeService.findById(ctx.exchangeId);
    if (!exchange) {
      return false;
    }

    return true;
  }
}
