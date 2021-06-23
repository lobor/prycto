import { useState } from "react";
import useSocket from "../hooks/useSocket";
import useEmit from "../hooks/useEmit";
import Button from "../components/Button";
import AddPosition from "../components/AddPosition";
// import EditPosition from "../components/EditPosition";
import TotalPnl from "../components/totalPnl";
import { AddPositionParams, GetPositionResponse } from "../type";
import ItemPosition from "../components/ItemPosition";

const Positions = () => {
  const [addPosisitonShowing, setAddPositionShowing] = useState(false);
  // const [editPositionShowing, setEditPositionShowing] = useState<any>();

  const [addPosition] = useEmit<AddPositionParams>("addPosition");
  // const [editPosition] = useEmit<EditPositionParams>("editPosition");

  const { data: positions } = useSocket<GetPositionResponse[]>("getPositions");

  return (
    <>
      <TotalPnl />
      {addPosisitonShowing && (
        <AddPosition
          onSubmit={(e) => {
            addPosition(e);
            setAddPositionShowing(false);
          }}
          onCancel={() => {
            setAddPositionShowing(false);
          }}
        />
      )}
      {/* {editPositionShowing && (
        <EditPosition
          position={editPositionShowing}
          onSubmit={(e) => {
            editPosition({
              exchangeId: e.exchangeId,
              available: e.available,
              locked: e.locked || 0,
              positionId: e._id,
            });
            setEditPositionShowing(undefined);
          }}
          onCancel={() => {
            setEditPositionShowing(undefined);
          }}
        />
      )} */}
      <div className="shadow-md mt-6">
        <div className="w-full hidden md:flex">
          <div className="w-full bg-gray-900 text-gray-200 flex flex-row items-center">
            <div className="flex-1 py-4 px-6 font-bold uppercase text-sm ">Paires</div>
            <div className="flex-1 py-4 px-6 font-bold uppercase text-sm">Amount</div>
            <div className="flex-1 py-4 px-6 font-bold uppercase text-sm">
              Price bought
            </div>
            <div className="flex-1 py-4 px-6 font-bold uppercase text-sm">Market</div>
            <div className="flex-1 py-4 px-6 font-bold uppercase text-sm">
              Investment
            </div>
            <div className="flex-1 py-4 px-6 font-bold uppercase text-sm">Profit</div>
            <div className="py-4 px-6 font-bold uppercase text-sm text-center w-60">
              <Button
                variant="validate"
                onClick={() => {
                  setAddPositionShowing(true);
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        {positions && (
          <div>
            {positions.map((position) => {
              return <ItemPosition key={position.pair} position={position} />;
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Positions;
