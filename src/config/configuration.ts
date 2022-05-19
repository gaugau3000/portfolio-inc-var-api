export default () => ({
  ccxtExtraConfig: {
    binanceFutureUrlOverwrite:
      process.env.BINANCE_FUTURE_URL_OVERWRITE || undefined,
  },
});
