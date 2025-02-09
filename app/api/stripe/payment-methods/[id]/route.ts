import { NextResponse } from "next/server";
import { deletePaymentMethod } from "@/lib/payments/stripe";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // セッションチェック
    const session = await getSession();
    console.log("セッション情報:", {
      hasSession: !!session,
      hasUser: !!session?.user,
    });

    if (!session?.user) {
      console.log("未認証エラー");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // パラメータのバリデーション
    const { id } = context.params;
    console.log("受信したパラメータ:", { id });

    if (typeof id !== "string" || !id || id === "undefined") {
      console.log("無効なパラメータ:", { id });
      return NextResponse.json(
        { error: "カードIDが必要です" },
        { status: 400 }
      );
    }

    console.log("カード削除処理開始 - ID:", id);

    // 支払い方法の削除
    await deletePaymentMethod(id);
    console.log("カード削除成功");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("カード削除エラー:", error);

    if (
      error instanceof Error &&
      error.message.includes("No such PaymentMethod")
    ) {
      return NextResponse.json(
        { error: "カードが見つかりませんでした" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
