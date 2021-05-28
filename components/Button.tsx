import { ButtonHTMLAttributes } from "react";
import { classnames, TArg } from "tailwindcss-classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "danger" | "validate" | "link" | "default";
  size?: "default" | "small";
}
const Boutton = (props: ButtonProps) => {
  const { children, className, size, variant, ...otherProps } = props;

  let sizeClassName = "px-4 py-2";
  if (size === "small") {
    sizeClassName = "px-2 py-1";
  }

  let classNameVariant = `${sizeClassName} text-xs font-semibold bg-gray-900 tracking-wider text-gray-200 hover:text-white rounded hover:bg-gray-700 disabled:opacity-50`;
  if (variant === "validate") {
    classNameVariant = `bg-green-900 ${sizeClassName} text-xs font-semibold tracking-wider text-gray-200 rounded hover:bg-green-800 disabled:opacity-50`;
  } else if (variant === "danger") {
    classNameVariant = `${sizeClassName} text-xs font-semibold text-gray-200 tracking-wider text-black rounded bg-red-900 hover:bg-red-800 disabled:opacity-50`;
  } else if (variant === "link") {
    classNameVariant = "hover:underline text-blue-500";
  }

  return (
    <button
      type="button"
      {...otherProps}
      className={`${classNameVariant} ${classnames(
        ...((className || "").split(" ") as TArg[])
      )}`}
    >
      {children}
    </button>
  );
};

export default Boutton;
