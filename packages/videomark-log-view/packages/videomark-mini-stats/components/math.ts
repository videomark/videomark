export const { min, max, floor } = Math;

export const clamp = (minValue: number, maxValue: number) => (
  value: number
) => {
  return max(minValue, min(maxValue, value));
};
