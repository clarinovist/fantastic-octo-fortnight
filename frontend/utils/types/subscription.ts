export type Plan = {
  id: string;
  name: string;
  price: string;
  interval: "monthly" | "yearly";
}
export type TransactionItem = {
  id: string;
  name: string;
  price: string;
  interval: string;
  intervalCount: number;
  url: string;
  startAt: string;
  endAt: string;
  status: "pending" | "active";
}
