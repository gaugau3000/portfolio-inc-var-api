
**Rest Api risk management trading tool based on incremental value at risk**

## Description

Following the  inspiration of the darwinex youtube playlist [Institutional-Grade Risk Management Techniques for Traders](https://www.youtube.com/watch?v=BxkkhzfD4Ug&list=PLv-cA-4O3y979Ltr9wQ2lRJu1INve3RCM&ab_channel=Darwinex) this api will allow you to manage the risk of your trading systems based on incremental value at risk (take into account the volatility and the correlation between assets)

The project is built in Typescript using nestjs framework.

## Running the app with docker

```
docker run --name incremental-var -p 3000:3000 gaugau3000/incremental_var
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



## License

Nest is [MIT licensed](LICENSE).
