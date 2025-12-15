export const isAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);
