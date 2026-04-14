export const getOrdinal = (number: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const lastTwoDigits = number % 100;
  return number + (suffixes[(lastTwoDigits - 20) % 10] || suffixes[lastTwoDigits] || suffixes[0]);
};
