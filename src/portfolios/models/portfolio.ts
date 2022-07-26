import {
  addPositionResponse,
  portfolioConstraints,
  portfolioState,
  portfolioParams,
  positionOpportunity,
} from '../interfaces/interfaces';
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

  constructor(
    obj: CreatePortfolioDto & {
      state: portfolioState;
    },
  ) {
    this.params = obj.params;
    this.constraints = obj.constraints;
    this.state = obj.state;
  }

  async updateVar() {
    this.state.valueAtRisk = await computeVar(
      this.params.zscore,
      this.state.positions,
      this.params.nbComputePeriods,
      this.params.timeframe,
    );
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

    // const acceptedPosition: position = { ...positionOpportunity, id: id() };

    // this.state.positions.push(acceptedPosition);

    this.state.valueAtRisk = proposedVar;

    return {
      status: 'accepted',
    };
  }

  // async removePosition(id: string): Promise<void> {
  //   this.state.positions = this.state.positions.filter(
  //     (position) => position.id !== id,
  //   );

  //   this.state.valueAtRisk = await computeVar(
  //     this.params.zscore,
  //     this.state.positions,
  //     this.params.nbComputePeriods,
  //     this.params.timeframe,
  //   );
  // }
}
