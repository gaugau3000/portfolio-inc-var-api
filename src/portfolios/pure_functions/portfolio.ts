import {
  direction,
  position,
  portfolioState,
  portfolioConstraints,
} from '../interfaces/interfaces';
import { opportunityInfo } from '../interfaces/interfaces';

export function isBelowMaxOpenTradeSameSymbolSameDirection(
  positionOpportunityPair: string,
  positionOpportunityDirection: direction,
  openPositions: Array<position>,
  maxOpenTradeSameSymbolSameDirection: number,
): boolean {
  let nbOpenTradeCurrentSymbolSameDirection =
    positionOpportunityDirection === 'long' ? 1 : -1;

  openPositions.forEach((position) => {
    if (position.pair == positionOpportunityPair) {
      if (position.direction == 'long') nbOpenTradeCurrentSymbolSameDirection++;
      if (position.direction == 'short')
        nbOpenTradeCurrentSymbolSameDirection--;
    }
  });

  if (
    nbOpenTradeCurrentSymbolSameDirection <= maxOpenTradeSameSymbolSameDirection
  )
    return true;
  return false;
}

export async function isAcceptedOpportunity(
  opportunityInfo: opportunityInfo,
  portfolioState: portfolioState,
  portfolioConstraints: portfolioConstraints,
): Promise<boolean> {
  if (
    !isBelowMaxOpenTradeSameSymbolSameDirection(
      opportunityInfo.opportunity.positionOpportunity.pair,
      opportunityInfo.opportunity.positionOpportunity.direction,
      portfolioState.positions,
      portfolioConstraints.maxOpenTradeSameSymbolSameDirection,
    )
  )
    return false;

  if (
    opportunityInfo.opportunity.proposedVar >
      portfolioConstraints.maxVarInDollar &&
    opportunityInfo.opportunity.proposedVar > portfolioState.valueAtRisk
  )
    return false;

  return true;
}
