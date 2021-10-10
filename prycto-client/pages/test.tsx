import { useEffect } from "react";
import axios from "axios";

const Test = () => {
  useEffect(() => {
    axios
      .get(
        "https://api2.poocoin.app/candles-bsc?to=2021-10-04T00%3A00%3A00.000Z&limit=321&lpAddress=0x18791a4927a4011a42F41Ecbc692B97b69094785&interval=1d&baseLp=0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1"
      )
      .then((e) => {
          console.log(e)
      })
      .catch((e) => {
          console.log('error', e)
      });
  }, []);
  return <div>test</div>;
};

export default Test;
