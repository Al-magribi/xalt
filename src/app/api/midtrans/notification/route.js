import { NextResponse } from "next/server";
import { processMidtransNotificationAction } from "@/actions/order";

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const result = await processMidtransNotificationAction(payload);

    if (!result?.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: result?.message || "Notifikasi Midtrans gagal diproses.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Internal server error.",
      },
      { status: 500 },
    );
  }
}
