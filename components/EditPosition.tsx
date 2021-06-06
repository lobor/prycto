import Label from "./Label";
import Input from "./Input";
import Button from "./Button";
import { useState } from "react";

interface Position {
  _id: string;
  pair: string;
  exchange: string;
  available: number;
  investment: number;
  locked?: number;
}
interface AddPositionProps {
  onSubmit: (params: { pair: string; exchange: string }) => void;
  onCancel: () => void;
  position?: Position;
}
const EditPosition = ({ onSubmit, onCancel, position }: AddPositionProps) => {
  const [value, setValue] = useState<Position>(position);
  return (
    <div className="h-screen absolute w-full flex flex-col items-center justify-center font-sans top-0 z-10">
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-800 opacity-90"></div>
      <div className="h-screen w-full absolute flex items-center justify-center top-0">
        <div className="bg-gray-800 text-gray-200 rounded shadow p-8 m-4 max-w-xs max-h-full text-center ">
          <div className="mb-4">
            <h1>Edit position - {position && position.pair}</h1>
          </div>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (value) {
                onSubmit(value);
              }
            }}
          >
            <div className="mb-8">
              <Label htmlFor="available" label="Available">
                <Input
                  id="available"
                  name="available"
                  defaultValue={position && position.available}
                  onChange={(e) => {
                    setValue({ ...value, available: Number(e.currentTarget.value) });
                  }}
                />
              </Label>
              <Label htmlFor="locked" label="Locked">
                <Input
                  id="locked"
                  name="locked"
                  value={position && position.locked}
                  onChange={(e) => {
                    setValue({ ...value, locked: Number(e.currentTarget.value) });
                  }}
                />
              </Label>
            </div>
            <div className="flex justify-center">
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="submit" variant="validate" className="ml-2">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPosition;
