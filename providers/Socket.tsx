import SocketIOContext from "../context/socket";
import React, { useState } from "react";
import io, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { useRef } from "react";
import { useEffect } from "react";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";

type Options = Partial<ManagerOptions & SocketOptions>;

// TODO since this is a public facing component it should
// expose PropTypes
interface IProps {
  url: string;
  connectionOptions?: Options;
}

const SocketProvider: React.FC<IProps> = (props) => {
  const { children, url, connectionOptions } = props;

  const [socket, setSocket] =
    useState<Socket<DefaultEventsMap, DefaultEventsMap>>();

  useEffect(() => {
    if (!socket) {
      const socketInit = io(url, connectionOptions);
      setSocket(socketInit);
    }
  }, [socket]);

  if (!socket) {
    return <>{children}</>;
  }
  return (
    <SocketIOContext.Provider value={socket}>
      {children}
    </SocketIOContext.Provider>
  );
};

export default SocketProvider;
