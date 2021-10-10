import {
  BscConnector,
  UserRejectedRequestError,
} from "@binance-chain/bsc-connector";
import { FC } from "react";
import { ConnectionRejectedError, UseWalletProvider } from "use-wallet";

const bsc = new BscConnector({});

const Wallet: FC = ({ children }) => {
  return <UseWalletProvider connectors={{ bsc }}>{children}</UseWalletProvider>;
};

export default Wallet;
