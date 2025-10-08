import { handlers } from "@/libs/handlers";
import { AvailableTool } from "../../shared/src";

export default defineUnlistedScript(() => {
  console.log("Script injected.");

  // 結果を送信
  const sendResult = (requestId: string, success: boolean, result: string) => {
    window.postMessage({ type: "RESULT", requestId, success, result }, "*");
  };

  window.addEventListener("message", async (event) => {
    if (event.source !== window || !event.data.type || !event.data.payload)
      return;

    const { type, payload } = event.data;

    // リクエストに応じたハンドラを作成
    const handler = handlers[type as AvailableTool];
    const { requestId } = payload;

    try {
      if (!handler) throw new Error("不正なリクエストです");
      const noteManager = (window as any).k;
      if (!noteManager) throw new Error("ノートが開かれていないようです");

      const result = handler(payload, noteManager);
      sendResult(requestId, true, result);
    } catch (e: any) {
      sendResult(requestId, false, e.message);
    }
  });
});
