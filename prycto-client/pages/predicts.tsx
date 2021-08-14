import {
  AiOutlineCaretDown,
  AiOutlineCaretUp,
} from "react-icons/ai";
import { FormattedMessage } from "react-intl";

const pairs = [
  {
    symbol: "AXS/BUSD",
    up: 0.453,
    down: 0.6,
  },
  {
    symbol: "SLP/BUSD",
    up: 0.7002,
    down: 0.309,
  },
  {
    symbol: "SAND/BUSD",
    up: 0.99999,
    down: 0.00001,
  },
  {
    symbol: "ETH/BUSD",
    up: 0.001,
    down: 0.999999,
  },
  {
    symbol: "BTC/BUSD",
    up: 0.001,
    down: 0.999999,
  },
  {
    symbol: "DODO/BUSD",
    up: 0.001,
    down: 0.999999,
  },
  {
    symbol: "AVA/BUSD",
    up: 0.001,
    down: 0.999999,
  },
  {
    symbol: "ADA/BUSD",
    up: 0.001,
    down: 0.999999,
  },
];
const PredictPage = () => {
  return (
    <div className="text-gray-200">
      <div className="text-xl my-4">
        <FormattedMessage id="predict.description" />
      </div>
      <div className="flex-wrap flex">
        {pairs.map(({ symbol, up, down }, i) => {
          const isUp = up > down;
          return (
            <div
              key={`predict-${symbol}`}
              className={`p-2 border-2 w-1/12 rounded-md ${i === 0 ? '' : 'ml-5'} ${isUp ? 'border-green-500' : 'border-red-600'}`}
            >
              <div className="text-center">{symbol}</div>
              <div className={`text-center flex justify-center text-6xl ${isUp ? 'text-green-500' : 'text-red-600'}`}>{isUp ? <AiOutlineCaretUp /> : <AiOutlineCaretDown />}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictPage;
