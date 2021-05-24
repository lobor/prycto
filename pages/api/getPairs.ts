// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AssetBalance } from 'binance-api-node';
import "../../services/Binance";

export default async (req: NextApiRequest, res: NextApiResponse<AssetBalance[]>) => {
  // const { balances } = await BincanceClient.accountInfo();

  // const pairsPositions = balances.filter(({ free }) => Number(free) > 0)
  // const order = await Promise.all(pairsPositions.map(({ asset }) => {
  //   console.log(`${asset}BUSD`)
  //   // return BincanceClient.allOrders({
  //   //   symbol: `${asset}BUSD`,
  //   // })
  // }))

  // console.log(order)
  
  // console.log(balances.filter(({ free }) => Number(free) > 0));
  res.status(200).json([]);
};
