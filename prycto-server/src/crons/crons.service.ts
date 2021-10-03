import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { uniqBy } from 'lodash';
import { CoursService } from 'src/cours/cours.service';
import { PositionsService } from 'src/positions/positions.service';

@Injectable()
export class CronsService {
  private readonly logger = new Logger(CronsService.name);

  constructor(
    private readonly coursService: CoursService,
    private readonly positionsService: PositionsService,
  ) {}

  @Cron('* 5 0 * * *')
  async syncCours() {
    const start = Date.now();
    this.logger.log('syncCours start');
    const positions = await this.positionsService.findAll();
    const uniqPositions = uniqBy(positions, 'pair');
    for (const position of uniqPositions) {
      const { exchangeId, pair: symbol } = position;
      await this.coursService.syncCoursHistory(exchangeId, symbol, 110);
    }
    this.logger.log(`syncCours end in ${Date.now() - start}ms`);
  }
}
