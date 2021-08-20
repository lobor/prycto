import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { VictoryChart, VictoryAxis, VictoryArea } from "victory";
import { GetHistoryBySymbolDocument, GetHistoryBySymbolQuery, GetHistoryBySymbolQueryVariables } from "../generated/graphql";

interface GraphProps {
  symbol: string;
  market: number;
}

const Graph = ({ symbol, market }: GraphProps) => {
  const { data: dataHistory } = useQuery<GetHistoryBySymbolQuery, GetHistoryBySymbolQueryVariables>(
    GetHistoryBySymbolDocument,
    { variables: { symbol, limit: 30 } }
  );
  const { min, max } = useMemo(() => {
    return ((dataHistory && dataHistory.getHistoryBySymbol) || []).reduce(
      (acc, history) => {
        if (acc.min > history.close || acc.min === 0) {
          acc.min = history.close;
        }
        if (acc.max < history.close) {
          acc.max = history.close;
        }
        return acc;
      },
      { min: 0, max: 0 }
    );
  }, [dataHistory]);
  return (
    <VictoryChart
      width={1}
      height={50}
      style={{
        parent: { width: "80px", height: "40px" },
      }}
      // scale={{ x: "time" }}
      // domainPadding={{ x: 0, y: 0 }}
      minDomain={{ y: min }}
    >
      <VictoryArea
        style={{
          data: { stroke: "rgb(59, 130, 246)" },
        }}
        data={[
          ...((dataHistory && dataHistory.getHistoryBySymbol) || []),
          { timestamp: Date.now(), close: market },
        ]}
        x="timestamp"
        y="close"
      />
      <VictoryAxis
        invertAxis
        tickFormat={() => ""}
        style={{
          axisLabel: { color: "transparent" },
          axis: { stroke: "none" },
        }}
      />
      <VictoryAxis
        dependentAxis
        invertAxis
        tickFormat={() => ""}
        style={{
          axisLabel: { color: "transparent" },
          axis: { stroke: "none" },
        }}
      />
    </VictoryChart>
  );
};

export default Graph;
