import { useEffect, useMemo, useState } from "react";
import { useSocket, useEmit } from "socketio-hooks";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { omit, uniq } from "lodash";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";

const Dashboard = () => {
  const [hidden, setHidden] = useState<string[]>([]);
  const [positions, setPositions] = useState<
    {
      [key: string]: number;
      time: number;
    }[]
  >([]);
  const getPositions = useEmit("getHistoryPrice");
  useEffect(() => {
    getPositions();
  }, []);
  useSocket("getHistoryPrice", (message) => {
    setPositions(message);
  });

  const pairs = uniq(
    positions.reduce<string[]>((acc, position) => {
      return [...acc, ...Object.keys(omit(position, ["time"]))];
    }, [])
  ).sort();

  const colors = useMemo(() => {
    return [...Array(pairs.length)].map(
      (x) => `#${Math.floor(Math.random() * 16777215).toString(16)}`
    );
  }, [pairs.length]);

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <LineChart
          width={width}
          height={600}
          data={positions
            .sort((a, b) => a.time - b.time)
            .map((position) => {
              return {
                ...position,
                time: format(
                  new Date(position.time - 3600 * 2 * 1000),
                  "yyyy-MM-dd"
                ),
              };
            })}
        >
          {pairs.map((pair, index) => {
            const isHidden = hidden.includes(pair);
            return (
              <Line
                key={pair}
                type="monotone"
                dataKey={pair}
                hide={isHidden}
                stroke={colors[index]}
              />
            );
          })}
          <XAxis dataKey="time" />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Legend
            onClick={(e) => {
              if (hidden.includes(e.dataKey)) {
                setHidden(hidden.filter((key) => key !== e.dataKey));
              } else {
                setHidden([...hidden, e.dataKey]);
              }
            }}
          />
          <YAxis />
        </LineChart>
      )}
    </AutoSizer>
  );
};

export default Dashboard;
