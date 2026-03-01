import { getAdminMerchandiseOrdersAction } from "@/actions/order";
import AdminOrderComponent from "@/components/admin/order/Order";

export default async function AdminOrderPage() {
  const orders = await getAdminMerchandiseOrdersAction();

  return <AdminOrderComponent orders={orders} />;
}
