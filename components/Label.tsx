import { LabelHTMLAttributes, ReactNode } from "react";
import { classnames, TArg } from "tailwindcss-classnames";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: ReactNode;
  variant?: "inline" | "row";
}
const Label = (props: LabelProps) => {
  const { className, children, label, variant, ...otherProps } = props;
  return (
    <label
      {...otherProps}
      className={`${classnames(...((className || "").split(" ") as TArg[]), {
        "flex-col": variant === "row" || !variant,
        "flex-row": variant === "inline",
      })} flex mb-2`}
    >
      <div className="text-left pl-1">{label}</div>
      <div>{children}</div>
    </label>
  );
};

export default Label;
