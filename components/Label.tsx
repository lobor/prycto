import { LabelHTMLAttributes, ReactNode } from "react";
import { classnames, TArg } from "tailwindcss-classnames";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: ReactNode;
}
const Label = (props: LabelProps) => {
  const { className, children, label, ...otherProps } = props;
  return (
    <label
      {...otherProps}
      className={`flex flex-col mb-2 ${classnames(...((className || "").split(" ") as TArg[]))}`}
    >
      <div className="text-left pl-1">{label}</div>
      <div>{children}</div>
    </label>
  );
};

export default Label;
