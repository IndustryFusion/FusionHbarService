[![Nigthly](https://github.com/IndustryFusion/FusionHbarService/actions/workflows/nightly.yaml/badge.svg?branch=main)](https://github.com/IndustryFusion/FusionHbarService/actions/workflows/nightly.yaml)

# Fusion HBAR (Hedera) Service

## Description


This service is responsible for providing endpoints for IndustryFusion user/company, product objects to be published to Hedera Blockchain to prove authenticity and ownership of Digital Twins.

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.


## Project setup

```bash
$ npm install
```

## Compile and run the project

Requires .env with following contents in root folder.

```
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=
HEDERA_PRIVATE_KEY=
HEDERA_PUBLIC_KEY=
PLATFORM_DID=
VC_TOPIC_ID=
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Docker

```bash
# build
$ docker build -t <imagename> .

# run
$ docker run --env-file .env <imagename> -p 4021:4021 

```

## API Reference

👉 View the full interactive documentation here: [Swagger UI](https://dev-fusionhbar-backend.ifrax.org/api-docs)
