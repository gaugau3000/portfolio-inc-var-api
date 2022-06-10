import {
  addPositionResponse,
  portfolioConstraints,
  portfolioState,
  portfolioParams,
  position,
  positionOpportunity,
} from '../interfaces/interfaces';
import { uuid } from 'uuidv4';
import { CreatePortfolioDto } from '../dto/create-portfolio.dto';
import {
  isBelowMaxOpenTradeSameSymbolSameDirection,
  isAcceptedOpportunity,
} from '../pure_functions/portfolio';
import { opportunityInfo } from '../interfaces/interfaces';
import { computeVar } from '../pure_functions/value-at-risk';
import {
  addPositionRejectedUpperMaxTradeStatus,
  addPositionRejectedUpperMaxVarStatus,
} from '../status/status';

export class Portfolio {
  constraints: portfolioConstraints;

  params: portfolioParams;

  state: portfolioState;

  constructor(obj: CreatePortfolioDto) {
    this.params = obj.params;
    this.constraints = obj.constraints;
    this.state = { positions: [], uuid: uuid(), valueAtRisk: 0 };
  }

  async addPosition(
    positionOpportunity: positionOpportunity,
  ): Promise<addPositionResponse> {
    if (
      !isBelowMaxOpenTradeSameSymbolSameDirection(
        positionOpportunity.pair,
        positionOpportunity.direction,
        this.state.positions,
        this.constraints.maxOpenTradeSameSymbolSameDirection,
      )
    )
      return addPositionRejectedUpperMaxTradeStatus;

    const proposedVar = await computeVar(
      this.params.zscore,
      [...this.state.positions, positionOpportunity],
      this.params.nbComputePeriods,
      this.params.timeframe,
    );

    const opportunityInfo: opportunityInfo = {
      opportunity: {
        positionOpportunity: positionOpportunity,
        proposedVar: proposedVar,
      },
    };

    const isAcceptedOpportunityStatus = await isAcceptedOpportunity(
      opportunityInfo,
      this.state,
      this.constraints,
    );

    if (!isAcceptedOpportunityStatus)
      return addPositionRejectedUpperMaxVarStatus;

    const acceptedPosition: position = { ...positionOpportunity, uuid: uuid() };

    this.state.positions.push(acceptedPosition);

    this.state.valueAtRisk = proposedVar;

    return {
      status: 'accepted',
      uuid: acceptedPosition.uuid,
    };
  }

  async removePosition(uuid: string): Promise<void> {
    this.state.positions = this.state.positions.filter(
      (position) => position.uuid !== uuid,
    );

    this.state.valueAtRisk = await computeVar(
      this.params.zscore,
      this.state.positions,
      this.params.nbComputePeriods,
      this.params.timeframe,
    );
  }
}
