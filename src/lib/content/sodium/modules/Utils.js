const sizeFormat = (bytes, exponent) => {
  const divider = 1024 ** exponent;
  // 整数部が4桁になったら小数部は省く
  const fraction = bytes >= divider * 1000 ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(bytes / divider);
};

export const megaSizeFormat = (bytes) => sizeFormat(bytes, 2);

export const kiloSizeFormat = (bytes) => sizeFormat(bytes, 1);

export const jsonParseSafe = (text, defaultValue = {}) => {
  try {
    const value = JSON.parse(text);
    // undefinedとnullは存在しないプロパティにアクセスすると
    // エラーを投げるので、代わりにdefaultValueを返す
    return value === undefined || value === null ? defaultValue : value;
  } catch (e) {
    return defaultValue;
  }
};
