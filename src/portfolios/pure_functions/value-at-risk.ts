import { getAssetLastCloses } from './candles';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const calculateCorrelation = require('calculate-correlation');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const math = require('mathjs');

import {
  direction,
  position,
  positionOpportunity,
} from 'src/portfolios/interfaces/interfaces';

export async function computeVar(
  zscore: number,
  positions: Array<position | positionOpportunity>,
  nbComputePeriods: number,
  timeframe: string,
): Promise<number> {
  let positionsLastCloses: number[][] = [];

  const assetLastClosesPromises = [];

  positions.forEach((position) => {
    assetLastClosesPromises.push(
      getAssetLastCloses(
        position.pair,
        nbComputePeriods,
        timeframe,
        position.dataSource,
      ),
    );
  });

  positionsLastCloses = await Promise.all(assetLastClosesPromises);

  console.log({ positionsLastCloses });

  const positionsStd = [];
  positionsLastCloses.forEach((positionLastCloses) => {
    positionsStd.push(math.std(pctChange(positionLastCloses)));
  });

  const weights: number[] = computeWeights(positions);

  const portfolioStd: number = getPortfolioStd(
    weights,
    positionsStd,
    getPositionsCorrMatrix(
      positionsLastCloses,
      positions.map((position) => position.direction),
    ),
  );

  const totalInvestedAmount: number = sumInvestedAmount(positions);

  console.log({ zscore, portfolioStd, totalInvestedAmount });

  const valueAtRisk = zscore * portfolioStd * totalInvestedAmount;

  return valueAtRisk;
}

function pctChange(lastCloses: number[]) {
  const pctChanges = [];
  for (let i = 0; i < lastCloses.length - 1; i++) {
    pctChanges.push(lastCloses[i + 1] / lastCloses[i] - 1);
  }

  return pctChanges;
}

export function getPositionsCorrMatrix(
  positionsLastCloses: number[][],
  positionsDirection: direction[],
): number[][] {
  function getGroupCorr(
    positionIndex: number,
    positionsLastClose: number[][],
  ): Array<number> {
    const groupCorr = [];
    for (let i = positionIndex; i < positionsLastClose.length - 1; i++) {
      let corrCoeff = calculateCorrelation(
        positionsLastClose[positionIndex],
        positionsLastClose[i + 1],
      );
      corrCoeff =
        positionsDirection[positionIndex] === positionsDirection[i + 1]
          ? corrCoeff
          : -corrCoeff;

      groupCorr.push(corrCoeff);
    }

    return groupCorr;
  }

  const corrMatrix = [];

  for (let i = 0; i < positionsLastCloses.length - 1; i++) {
    corrMatrix.push(getGroupCorr(i, positionsLastCloses));
  }

  return corrMatrix;
}

export function getPortfolioStd(
  positionsWeights: Array<number>,
  positionsStd: Array<number>,
  positionsCorrMatrix: Array<Array<number>>,
): number {
  let portfolioStdSquare = 0;

  const weightsStdMember = computeWeightsStdMember(
    positionsWeights,
    positionsStd,
  );
  const weightsStdCorrMember = computeWeightsStdCorrMember(
    positionsWeights,
    positionsStd,
    positionsCorrMatrix,
  );
  portfolioStdSquare = weightsStdMember + weightsStdCorrMember;

  return Math.sqrt(portfolioStdSquare);
}

function computeWeightsStdCorrMember(
  positionsWeights: Array<number>,
  positionsStd: Array<number>,
  positionsCorrMatrix: Array<Array<number>>,
): number {
  let weightsStdCorrMember = 0;

  positionsCorrMatrix.forEach((groupCorr, groupCorrIndex) => {
    groupCorr.forEach((groupCorrElement) => {
      weightsStdCorrMember =
        weightsStdCorrMember +
        2 *
          positionsWeights[groupCorrIndex] *
          positionsWeights[groupCorrIndex + 1] *
          groupCorrElement *
          positionsStd[groupCorrIndex] *
          positionsStd[groupCorrIndex + 1];
    });
  });

  return weightsStdCorrMember;
}

function computeWeightsStdMember(
  positionsWeights: Array<number>,
  positionsStd: Array<number>,
): number {
  let weightsStdMember = 0;

  for (let i = 0; i < positionsWeights.length; i++) {
    weightsStdMember =
      weightsStdMember + positionsWeights[i] ** 2 * positionsStd[i] ** 2;
  }

  return weightsStdMember;
}

function computeWeights(
  positions: Array<positionOpportunity | position>,
): Array<number> {
  const investedAmount = sumInvestedAmount(positions);
  const weights = [];
  positions.forEach((position) => {
    weights.push(position.dollarAmount / investedAmount);
  });
  return weights;
}

export function sumInvestedAmount(
  positions: Array<positionOpportunity | position>,
): number {
  let investedDollarAmount = 0;

  positions.forEach((position) => {
    investedDollarAmount = investedDollarAmount + position.dollarAmount;
  });

  return investedDollarAmount;
}
