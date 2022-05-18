
# Rest Api risk management trading tool based on incremental value at risk

## Description

Following the  inspiration of the darwinex youtube playlist [Institutional-Grade Risk Management Techniques for Traders](https://www.youtube.com/watch?v=BxkkhzfD4Ug&list=PLv-cA-4O3y979Ltr9wQ2lRJu1INve3RCM&ab_channel=Darwinex) this api will allow you to manage the risk of your trading systems based on incremental value at risk based on variance-covariance method (take into account the volatility and the correlation between assets)

The project is built in Typescript using nestjs framework.

## DataProvider

To calculate the value at risk you need to get the last n candles of the asset. Below supported dataProvider.

| Data Source  | Status          | 
| --------------- |--------------- |
| Binance Future  | :white_check_mark: |


## Running the app with docker

```
docker run -p 3000:3000 gaugau3000/portfolio-inc-var-api
```

## Running the app with node js

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentation

Please find swagger doc [here](https://gaugau3000.github.io/portfolio-inc-var-api/)
You can make tests on this api going to http://localhost:3000/api

## License

This tool is [MIT licensed](LICENSE).
