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


## Concept

## 1. Company Certification in Industry Fusion (IF)

Every company participating in Industry Fusion must undergo a **Know Your Customer (KYC)** process to obtain a **Certificate of Authenticity**.  
Once verified, the company can purchase this certificate, which enables it to certify its products on the platform.


## 2. Certificate Issuance Process

Using an open-source service, each company’s certificate request is received and processed as follows:

- A **Hedera account** and **Decentralized Identifier (DID)** document are created in the **Hedera File Service (HFS)**.
- The **public key** of the Hedera account is stored in the company’s IF account.
- The **private key** is securely delivered to the user and is **never stored** on the platform.


## 3. Role of the DID Document

The **DID document** serves as the foundational identity for managing certificates.  
It supports key lifecycle operations such as:

- Certificate revocation
- Certificate reissuance


## 4. Issuing Digital Product Passports (DPP)

Upon successful creation of the Hedera account and DID:

- The company can issue **product certificates** in the form of **Verifiable Credentials (VCs)**.
- These VCs are recorded on **Hedera Consensus Service (HCS)** for transparency and immutability.


## 5. Verifiable Credential Creation and Signing

- VCs can be issued individually or in batches.
- The company’s **DID certificate** acts as the **ownership identity**.
- VCs are **digitally signed** using the company’s **private key**, securely provided by user in UI and transmitted for single use.


## 6. Ownership Transfer and VC Reissuance

When a product (e.g., a machine) changes ownership (e.g., from manufacturer to end user):

- The existing VC is **revoked**.
- A new VC is issued with:
  - The **new owner’s DID**
  - A **digital signature** using the new owner’s private key


## 7. Verifiable Credentials for Dataspace Contracts

VCs are also issued for **Industry Fusion Dataspace Contracts**.  
These credentials:

- Reference the **DIDs of the participating data-sharing parties**
- Ensure **secure and verifiable authenticity** for the contractual relationship
- Reference the **VC of the digital product/machine in context of data sharing**


> ⚠️ Note: All cryptographic keys are handled securely, and private keys are never retained by the platform.