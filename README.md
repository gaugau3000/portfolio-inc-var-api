
# Rest Api risk management trading tool based on incremental value at risk

[![codecov](https://codecov.io/gh/gaugau3000/portfolio-inc-var-api/branch/master/graph/badge.svg?token=HEYV9B8Z0B)](https://codecov.io/gh/gaugau3000/portfolio-inc-var-api)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/629e122459e04f898e81a71679cd804c)](https://www.codacy.com/gh/gaugau3000/portfolio-inc-var-api/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gaugau3000/portfolio-inc-var-api&amp;utm_campaign=Badge_Grade)

## Description

Following the  inspiration of the darwinex youtube playlist [Institutional-Grade Risk Management Techniques for Traders](https://www.youtube.com/watch?v=BxkkhzfD4Ug&list=PLv-cA-4O3y979Ltr9wQ2lRJu1INve3RCM&ab_channel=Darwinex) this api will allow you to manage the risk of your trading system based on incremental value at risk based on variance-covariance method (it take into account the volatility and the correlation between assets).

Once you have define a portfolio with a time-frame horizon, you will be able to add new trades opportunity that will be accepted or rejected regarding the increase risk level.

The project is built using Typescript and use nestjs framework.

https://user-images.githubusercontent.com/2643583/201255675-27241c3d-b1f7-4f42-909f-d01a01d80eb2.mp4


## DataProvider

To calculate the value at risk you need to get the last n candles of all the assets that are currently in the portfolio.

Below supported dataProvider.

| Data Source     | Status             |
| --------------- | ------------------ |
| Binance Futures | :white_check_mark: |
| Binance Spot    | :white_check_mark: |


## Running the app with docker compose using postgresql database)

1/ Create a folder for the project

2/ Download the init script that will create the database

```
wget https://raw.githubusercontent.com/gaugau3000/portfolio-inc-var-api/master/scripts/init-user-db.sh
```

2/ Download docker-compose file

```
wget https://raw.githubusercontent.com/gaugau3000/portfolio-inc-var-api/master/docker-compose.yml
```

3/ Run the docker compose file

```
docker-compose -up
```

4/ Open your favorite browser and go to, it will expose api using the swagger documentation

```
http://localhost:3000/api
```

5/ Now time to play !

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

## What's next ?

Please go to [project page](https://github.com/gaugau3000/portfolio-inc-var-api/projects)

## License

This tool is [MIT licensed](LICENSE).
