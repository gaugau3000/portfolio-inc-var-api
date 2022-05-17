import {
  dataSource,
  position,
  positionOpportunity,
  positions,
  timeframe,
} from '../interfaces/interfaces';
import { computeVar } from './value-at-risk';
import { uuid as uuidv4 } from 'uuidv4';

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
  positionOpportunity: positionOpportunity,
  positions: Array<position>,
  params: {
    maxAllowedValueAtRisk: number;
    maxOpenTradeSameSymbolSameDirection: number;
    zscore: number;
    nbComputePeriods: number;
    timeframe: timeframe;
    dataSource: dataSource;
  },
): Promise<boolean> {
  if (
    !isBelowMaxOpenTradeSameSymbolSameDirection(
      positionOpportunity,
      positions,
      params.maxOpenTradeSameSymbolSameDirection,
    )
  )
    return false;

  const openPositions: Array<position | positionOpportunity> = positions;
  openPositions.push({
    pair: positionOpportunity.pair,
    dollarAmount: positionOpportunity.dollarAmount,
    direction: positionOpportunity.direction,
    dataSource: positionOpportunity.dataSource,
  });
  const proposedValueAtRisk = await computeVar(
    params.zscore,
    openPositions,
    params.nbComputePeriods,
    params.timeframe,
  );

  if (proposedValueAtRisk > params.maxAllowedValueAtRisk) return false;

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
