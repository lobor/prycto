Prycto app for cryptocurrency  
You can add different exchange with API key  
Add position pair  
And app get wallet balance, and associate to pair  
You can set objectif of sell  

## Getting Started

First, run install dependencies:

```bash
npm install
# or
yarn install
```

copy and paste `prycto-client/.env.dist` to `prycto-client/.env`  

Then, run development container:

```bash
npx lerna exec --scope prycto-client -- npm run build
docker-compose up
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

<!-- ## Doc front component
```bash
npx lerna exec --scope prycto-client -- npm run doc
``` -->