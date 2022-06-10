import {
  direction,
  position,
  positionOpportunity,
  positions,
  portfolioState,
  portfolioConstraints,
} from '../interfaces/interfaces';
import { uuid as uuidv4 } from 'uuidv4';
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

export function addPosition(
  positionOpportunity: positionOpportunity,
  positions: Array<position>,
): positions {
  const uuid = uuidv4();
  const position: position = {
    uuid: uuid,
    pair: positionOpportunity.pair,
    direction: positionOpportunity.direction,
    dollarAmount: positionOpportunity.dollarAmount,
    dataSource: 'binance_future',
  };
  positions.push(position);
  return positions;
}

export function removePosition(
  uuid: string,
  positions: Array<position>,
): Array<position> {
  positions = positions.filter((position) => position.uuid !== uuid);
  return positions;
}
