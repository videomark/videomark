export const { min, max, floor } = Math;
export const clamp = (minValue, maxValue) => (value) => {
    return max(minValue, min(maxValue, value));
};
