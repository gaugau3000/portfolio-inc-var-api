export default () => ({
  ccxtExtraConfig: {
    binanceFutureUrlOverwrite:
      process.env.BINANCE_FUTURES_URL_OVERWRITE || undefined,
  },
});
