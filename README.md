# Prycto
Prycto app for cryptocurrency  
You can add different exchange with API key  
The objective of the application is to follow its positions on a pair and not on a crypto
Usually we trade stablecoins, having our balance is one thing, but knowing what we earn is more important.


## Coming soon
- Addition of Metamask, with price management according to a pool
- migration of cloud server
- encryption of balances

## Requirements
- node
- docker
- docker-compose


## Getting Started

First, run install dependencies:

```bash
npm install
# or
yarn install
```

copy and paste `prycto-client/.env.dist` to `prycto-client/.env` and change variable env  
copy and paste `prycto-server/.env.dist` to `prycto-server/.env` and change variable env  

Add in `/etc/hosts`
```txt
127.0.0.1    prycto.localhost
127.0.0.1    prycto-api.localhost
```


Then, run development container:

```bash
docker-compose up
```

Open [http://prycto.localhost](http://prycto.localhost) with your browser to see the result.

## Donations
I am not greedy, I take if you want to give
BSC `0x29373EcE043a1a86066b37e89eEa6b93FD700E36`  