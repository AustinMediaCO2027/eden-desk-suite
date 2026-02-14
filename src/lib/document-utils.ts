export interface LineItem {
  description: string;
  details: string;
  quantity: number;
  rate: number;
  amount: number;
}

export const calculateTotals = (items: LineItem[], taxRate: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
};

export const emptyLineItem = (): LineItem => ({
  description: "",
  details: "",
  quantity: 1,
  rate: 0,
  amount: 0,
});

/** Format number input value — clears leading zero so users can type naturally */
export const formatNumberInput = (value: number): string => {
  return value === 0 ? "" : String(value);
};

/** Parse number input — treats empty string as 0 */
export const parseNumberInput = (value: string): number => {
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
};
