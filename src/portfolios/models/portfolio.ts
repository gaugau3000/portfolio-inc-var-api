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
import { computeVar } from '../pure_functions/value-at-risk';

export class Portfolio {
  maxVarInDollar: number;
  maxOpenTradeSameSymbolSameDirection: number;
  nbComputePeriods: number;
  zscore: number;
  timeframe: timeframe;
  uuid: string;
  nameId: string;

  currentPositions: Array<position>;
  currentValueAtRisk: number;

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

    const proposedVar = await computeVar(
      this.zscore,
      [...this.currentPositions, positionOpportunity],
      this.nbComputePeriods,
      this.timeframe,
    );

    if (
      !isAcceptedOpportunity(
        positionOpportunity,
        this.currentPositions,
        proposedVar,
        {
          maxAllowedValueAtRisk: this.maxVarInDollar,
          maxOpenTradeSameSymbolSameDirection:
            this.maxOpenTradeSameSymbolSameDirection,
        },
      )
    )
      return rejectedStatus;

    const acceptedPosition: position = { ...positionOpportunity, uuid: uuid() };

    this.currentPositions.push(acceptedPosition);

    this.currentValueAtRisk = proposedVar;

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
