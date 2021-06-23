const round = (num: number, decimal = 2) => {
  let decimalFactor = 1;
  for (let i = 0; i < decimal; i++) {
    decimalFactor *= 10;
  }
  return Math.round((num + Number.EPSILON) * decimalFactor) / decimalFactor;
};

export default round;
