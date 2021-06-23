import { Socket } from "socket.io";
import { Db } from "mongodb";

export default (
  eventName: string,
  cb: (
    msg: any,
    ctx: {
      socket: Socket;
      db: Db;
      emit: (response: any) => void;
      error: (code: number, error: string) => void;
    }
  ) => Promise<any | void> | any | void,
  ctx: { socket: Socket; db: Db }
) => {
  ctx.socket.on(`${eventName}:request`, async (msg: any) => {
    const start = Date.now();
    console.log(`Socket:${eventName} requested`);
    await cb(msg, {
      ...ctx,
      emit: (response: any) => {
        console.log(`Socket:${eventName} response in ${Date.now() - start}ms`);
        ctx.socket.emit(`${eventName}:response`, response);
      },
      error: (code: number, error: string) => {
        console.error(`Socket:${eventName} error -`, code, " - ", error);
        ctx.socket.emit(`${eventName}:response`, error);
      },
    });
  });
};
