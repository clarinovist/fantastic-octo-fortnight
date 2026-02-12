export const getSearchParamValue = <T extends string | number>(
  param: string | string[] | undefined,
  defaultValue: T,
): T => {
  const value = Array.isArray(param) ? param[0] : param;
  return (value || defaultValue) as T;
};
