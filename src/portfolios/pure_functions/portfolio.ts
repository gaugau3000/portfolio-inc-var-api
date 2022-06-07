import {
  position,
  positionOpportunity,
  positions,
} from '../interfaces/interfaces';
import { uuid as uuidv4 } from 'uuidv4';
import { opportunityInfo } from '../interfaces/interfaces';

export function isBelowMaxOpenTradeSameSymbolSameDirection(
  positionOpportunity: positionOpportunity,
  positions: Array<position>,
  maxOpenTradeSameSymbolSameDirection: number,
): boolean {
  let nbOpenTradeCurrentSymbolSameDirection =
    positionOpportunity.direction === 'long' ? 1 : -1;

  positions.forEach((position) => {
    if (position.pair == positionOpportunity.pair) {
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
): Promise<boolean> {
  if (
    !isBelowMaxOpenTradeSameSymbolSameDirection(
      opportunityInfo.opportunity.positionOpportunity,
      opportunityInfo.state.currentPositions,
      opportunityInfo.constraints.maxOpenTradeSameSymbolSameDirection,
    )
  )
    return false;

  if (
    opportunityInfo.opportunity.proposedVar >
      opportunityInfo.constraints.maxVarInDollar &&
    opportunityInfo.opportunity.proposedVar >
      opportunityInfo.state.currentValueAtRisk
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
