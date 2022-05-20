import {
  addPositionResponse,
  position,
  positionOpportunity,
} from '../interfaces/interfaces';
import { uuid } from 'uuidv4';
import { CreatePortfolioDto } from '../dto/create-portfolio.dto';
import {
  isBelowMaxOpenTradeSameSymbolSameDirection,
  isAcceptedOpportunity,
} from '../pure_functions/portfolio';
import { timeframe } from '../interfaces/interfaces';

export class Portfolio {
  maxVarInDollar: number;
  maxOpenTradeSameSymbolSameDirection: number;
  nbComputePeriods: number;
  zscore: number;
  timeframe: timeframe;
  uuid: string;
  nameId: string;

  currentPositions: Array<position>;

  constructor(obj: CreatePortfolioDto) {
    this.maxVarInDollar = obj.maxVarInDollar;
    this.maxOpenTradeSameSymbolSameDirection =
      obj.maxOpenTradeSameSymbolSameDirection;
    this.nbComputePeriods = obj.nbComputePeriods;
    this.zscore = obj.zscore;
    this.timeframe = obj.timeframe;
    this.currentPositions = [];
    this.uuid = uuid();
    this.nameId = obj.nameId;
  }

  async addPosition(
    positionOpportunity: positionOpportunity,
  ): Promise<addPositionResponse> {
    const rejectedStatus: addPositionResponse = {
      status: 'rejected',
    };
    if (
      !isBelowMaxOpenTradeSameSymbolSameDirection(
        positionOpportunity,
        this.currentPositions,
        this.maxOpenTradeSameSymbolSameDirection,
      )
    )
      return rejectedStatus;

    if (
      !(await isAcceptedOpportunity(
        positionOpportunity,
        this.currentPositions,
        {
          maxAllowedValueAtRisk: this.maxVarInDollar,
          maxOpenTradeSameSymbolSameDirection:
            this.maxOpenTradeSameSymbolSameDirection,
          zscore: this.zscore,
          nbComputePeriods: this.nbComputePeriods,
          timeframe: this.timeframe,
          dataSource: positionOpportunity.dataSource,
        },
      ))
    )
      return rejectedStatus;

    const acceptedPosition: position = { ...positionOpportunity, uuid: uuid() };

    this.currentPositions.push(acceptedPosition);

    return {
      status: 'accepted',
      uuid: acceptedPosition.uuid,
    };
  }

  removePosition(uuid: string): void {
    this.currentPositions = this.currentPositions.filter(
      (position) => position.uuid !== uuid,
    );
  }
}
