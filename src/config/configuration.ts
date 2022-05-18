export default () => ({
  ccxt_extra: {
    enableRateLimit: false,
    urls: {
      api: {
        public: 'http://binance_proxy:8090/api/v3',
        fapiPublic: 'http://binance_proxy:8091/fapi/v1',
      },
    },
  },
});
