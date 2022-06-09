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
import { timeframe, opportunityInfo } from '../interfaces/interfaces';
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
    this.currentValueAtRisk = 0;
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
      return {
        ...rejectedStatus,
        reason: 'upper the max open trades is the same direction',
      };

    const proposedVar = await computeVar(
      this.zscore,
      [...this.currentPositions, positionOpportunity],
      this.nbComputePeriods,
      this.timeframe,
    );

    const opportunityInfo: opportunityInfo = {
      opportunity: {
        positionOpportunity: positionOpportunity,
        proposedVar: proposedVar,
      },
      state: {
        currentPositions: this.currentPositions,
        currentValueAtRisk: this.currentValueAtRisk,
      },

      constraints: {
        maxVarInDollar: this.maxVarInDollar,
        maxOpenTradeSameSymbolSameDirection:
          this.maxOpenTradeSameSymbolSameDirection,
      },
    };

    const isAcceptedOpportunityStatus = await isAcceptedOpportunity(
      opportunityInfo,
    );

    if (!isAcceptedOpportunityStatus)
      return {
        ...rejectedStatus,
        reason: 'upper the max var allowed',
      };

    const acceptedPosition: position = { ...positionOpportunity, uuid: uuid() };

    this.currentPositions.push(acceptedPosition);

    this.currentValueAtRisk = proposedVar;

    return {
      status: 'accepted',
      uuid: acceptedPosition.uuid,
    };
  }

  async removePosition(uuid: string): Promise<void> {
    this.currentPositions = this.currentPositions.filter(
      (position) => position.uuid !== uuid,
    );

    this.currentValueAtRisk = await computeVar(
      this.zscore,
      this.currentPositions,
      this.nbComputePeriods,
      this.timeframe,
    );
  }
}
