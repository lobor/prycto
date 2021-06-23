import { createContext } from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";

const SocketContext = createContext<
  Socket<DefaultEventsMap, DefaultEventsMap> | null
>(null);

export default SocketContext;
