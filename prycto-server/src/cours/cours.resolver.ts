import { UseGuards } from '@nestjs/common';
import { Query, Args, Context, Resolver, Int } from '@nestjs/graphql';
import { AppService } from 'src/app.service';
import { EchangeIdGuard } from 'src/exchanges/guards/exchangeId.guard';
import { Cours } from './cours.model';
import { CoursService } from './cours.service';
import { AuthGuard } from 'src/user/guards/auth.guard';

@Resolver(() => Cours)
export class CoursResolver {
  constructor(
    private readonly coursService: CoursService,
    private readonly appService: AppService,
  ) {}

  @Query(() => [Cours])
  @UseGuards(AuthGuard)
  @UseGuards(EchangeIdGuard)
  async getHistoryBySymbol(
    @Context() ctx: { exchangeId: string },
    @Args('symbol') symbol: string,
    @Args('limit', { nullable: true, defaultValue: 7, type: () => Int })
    limit: number,
  ): Promise<Cours[]> {
    return this.coursService.syncCoursHistory(ctx.exchangeId, symbol, limit);
  }
}
