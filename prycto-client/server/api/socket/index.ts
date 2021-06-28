import { Socket } from "socket.io";
import init from './init';
import balances from './balances';
import pairs from './pairs';
import positions from './positions';
import markets from './markets';
import exchanges from './exchanges';
import pnl from './pnl';
import { Db } from "mongodb";

export default (ctx: { socket: Socket, db: Db }) => {
  init(ctx);
  balances(ctx);
  pairs(ctx);
  positions(ctx);
  markets(ctx);
  exchanges(ctx);
  pnl(ctx);
}