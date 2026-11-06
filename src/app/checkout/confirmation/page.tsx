import type { Metadata } from "next";
import { OrderConfirmation } from "./components/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order confirmation · Northline Supply",
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return <OrderConfirmation />;
}
