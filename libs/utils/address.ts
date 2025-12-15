export const truncateAddress = (
  address?: string,
  startLength?: number,
  endLength?: number
) => {
  if (!address) return "";
  const start = address.substring(0, startLength || 25);
  const end = address.substring(address.length - (endLength || 4));
  return `${start}...${end}`;
};
