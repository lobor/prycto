import { FC } from "react";
import { useHideShow } from "../context/hideShow";

const HideShow: FC = ({ children }) => {
  const { isHide } = useHideShow();
  return <>{isHide ? "*****" : children}</>;
};

export default HideShow;
