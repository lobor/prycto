const StepInitBar = ({ step }: { step: number }) => {
  const selectedClass = 'bg-blue-500 border-blue-500 text-black'
  let className1 = '';
  let className2 = '';
  let className3 = '';
  if (step === 1) {
    className1 = selectedClass
  }
  if (step === 2) {
    className2 = selectedClass
  }
  if (step === 3) {
    className3 = selectedClass
  }
  return (
    <div className="px-6">
      <div className="flex items-center">
        <div className="flex items-center text-gray-500 relative">
          <div className={`text-center w-32 text-xs font-medium uppercase rounded-full h-12 flex flex-col justify-center border-2 ${className1}`}>
            Exchange
          </div>
        </div>
        <div className="flex-auto border-t-2 border-teal-600"></div>
        <div className="flex items-center text-gray-500 relative">
          <div className={`text-center w-32 text-xs font-medium uppercase rounded-full h-12 flex flex-col justify-center border-2 ${className2}`}>
            Balance
          </div>
        </div>
        <div className="flex-auto border-t-2 border-gray-300"></div>
        <div className="flex items-center text-gray-500 relative">
          <div className={`text-center w-32 text-xs font-medium uppercase rounded-full h-12 flex flex-col justify-center border-2 ${className3}`}>
            Pairs
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepInitBar;
