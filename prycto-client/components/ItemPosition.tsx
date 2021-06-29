import { useRouter } from "next/dist/client/router";
import Button from "./Button";
import Input from "./Input";
import classnames from "tailwindcss-classnames";
import { useTabsContext } from "../context/tabs";
import useEmit from "../hooks/useEmit";
import { GetPositionResponse, RemovePositionParams } from "../../type";
import round from "../utils/round";
import HideShow from "./HideShow";
import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  ExchangeByIdDocument,
  ExchangeByIdQuery,
  PositionsDocument,
  RemovePositionDocument,
  RemovePositionMutation,
  RemovePositionMutationVariables,
} from "../generated/graphql";

export interface Position extends GetPositionResponse {
  profit: number;
  market: number;
  total: number;
  exchangeId: string;
}
export interface ItemPositionProps {
  position: Position;
}

const ItemPosition = ({ position }: ItemPositionProps) => {
  const {
    _id,
    pair: symbol,
    exchange,
    investment,
    available,
    locked,
    profit = 0,
    market,
    objectif,
    total,
  } = position;
  const { data: exchangeData } = useQuery<ExchangeByIdQuery>(
    ExchangeByIdDocument,
    { variables: { _id: position.exchangeId } }
  );
  const [isEditObjectif, setEditObjectif] = useState(false);
  const router = useRouter();
  const [editPosition, { data, loading }] = useEmit("editPosition");
  const [updatePosition] = useEmit("syncPositions");
  const [getPositions] = useLazyQuery(PositionsDocument, { fetchPolicy: 'network-only' });
  const [removePosition] = useMutation<
    RemovePositionMutation,
    RemovePositionMutationVariables
  >(RemovePositionDocument, {
    onCompleted: () => {
      getPositions();
    },
  });
  const { addTab, selectTab } = useTabsContext();
  const handleEditObjectif = useCallback(() => {
    setEditObjectif(!isEditObjectif);
  }, [isEditObjectif]);

  const formik = useFormik({
    validationSchema: Yup.object({
      objectif: Yup.number().required(),
    }),
    initialValues: {
      objectif: objectif || 0,
    },
    onSubmit: (value) => {
      editPosition({ positionId: _id, ...value });
      setEditObjectif(false);
    },
  });

  const handleTrendingview = () => {
    if (exchangeData) {
      addTab({
        key: symbol,
        label: symbol,
        canClose: true,
        exchange: exchangeData.exchangeById.name,
        href: `/tradingview?pair=${symbol}`,
      });
      router.push(`/tradingview?pair=${symbol}`);
      selectTab(symbol);
    }
  };

  return (
    <div
      key={symbol}
      className="hover:bg-gray-900 text-gray-200 border-b border-gray-900 flex items-center"
    >
      <div className="py-2 px-6 flex-1">
        <Button variant="link" onClick={handleTrendingview}>
          {symbol}
        </Button>
      </div>
      <div className="py-2 px-6 hidden md:block flex-1">
        <HideShow>{total}</HideShow>
      </div>
      <div className="py-2 px-6 hidden md:block flex-1">
        <HideShow>{round(total === 0 ? 0 : investment / total, 8)}</HideShow>
      </div>
      <div className="py-2 px-6 hidden md:block flex-1">{market}</div>
      <div className="py-2 px-6 hidden md:block flex-1">
        <HideShow>{round(investment)}</HideShow> /{" "}
        <span className="text-gray-400">
          <HideShow>{round(market * total)}</HideShow>
        </span>
      </div>
      <div
        className={classnames("py-2", "px-6", "flex-1", {
          "text-green-500": profit >= 0,
          "text-red-600": profit < 0,
        })}
      >
        <HideShow>{round(profit)}</HideShow> (
        {investment !== 0 ? round((profit * 100) / investment) : 0}
        %)
      </div>
      <div
        className="py-2 px-6 hidden md:block flex-1 cursor-pointer"
        onClick={handleEditObjectif}
      >
        {isEditObjectif ? (
          <form onSubmit={formik.handleSubmit}>
            <Input
              autoFocus
              type="text"
              name="objectif"
              onBlur={handleEditObjectif}
              value={formik.values.objectif}
              onChange={(e) => {
                formik.setFieldValue("objectif", Number(e.currentTarget.value));
                formik.setFieldTouched("objectif", true);
              }}
              error={formik.errors.objectif}
            />
          </form>
        ) : (
          <>
            {objectif || 0} /{" "}
            <HideShow>{round(total * (objectif || 0))}</HideShow>
          </>
        )}
      </div>
      <div className="py-2 px-6 text-center w-60 hidden md:block">
        <Button
          onClick={() => {
            removePosition({ variables: { _id } });
          }}
        >
          &#x1F5D1;
          {/* Remove */}
        </Button>
        {/* <Button
          className="ml-2"
          onClick={() => {
            // setEditPositionShowing(position);
          }}
        >
          Edit
        </Button> */}
        <Button
          className="ml-2"
          onClick={() => {
            updatePosition({
              _id,
              pair: symbol,
              exchangeId: position.exchangeId,
            });
          }}
        >
          &#8635;
          {/* Update */}
        </Button>
      </div>
    </div>
  );
};

export default ItemPosition;
