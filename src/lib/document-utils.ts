export interface LineItem {
  description: string;
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
  quantity: 1,
  rate: 0,
  amount: 0,
});
