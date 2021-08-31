Prycto app for cryptocurrency  
You can add different exchange with API key  
Add position pair  
And app get wallet balance, and associate to pair  
You can set objectif of sell  

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

Then, run development container:

```bash
docker-compose up
```

Open [http://prycto.localhost](http://prycto.localhost) with your browser to see the result.

<!-- ## Doc front component
```bash
npx lerna exec --scope prycto-client -- npm run doc
``` -->