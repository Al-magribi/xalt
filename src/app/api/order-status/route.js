import { NextResponse } from "next/server";
import { getMerchandiseOrderPaymentStatusAction } from "@/actions/order";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderCode = String(searchParams.get("order_code") || "");
  const result = await getMerchandiseOrderPaymentStatusAction({ orderCode });

  if (!result?.ok) {
    return NextResponse.json(
      { ok: false, message: result?.message || "Order tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, data: result.data }, { status: 200 });
}
