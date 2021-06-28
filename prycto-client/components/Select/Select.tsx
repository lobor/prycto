import ReactSelect, { Props } from 'react-select'

interface SelectProps extends Props {
  error?: string | false;
}
const Select = ({ error, ...props }: SelectProps) => {
  // const { className, children, error, ...otherProps } = props;
  return (
    <>
      <ReactSelect {...props} className="select-container" classNamePrefix="select" />
      <span className="text-red-800">{error}</span>
    </>
  );
};

export default Select;
