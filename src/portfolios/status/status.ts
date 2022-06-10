import { addPositionResponse } from '../interfaces/interfaces';

const addPositionRejectedStatus: addPositionResponse = {
  status: 'rejected',
};

export const addPositionRejectedUpperMaxTradeStatus: addPositionResponse = {
  ...addPositionRejectedStatus,
  reason: 'upper the max open trades is the same direction',
};

export const addPositionRejectedUpperMaxVarStatus: addPositionResponse = {
  ...addPositionRejectedStatus,
  reason:
    'you cannot add this position because you will exceed max allowed var',
};
