import { handlers } from "@/libs/handlers";
import { AvailableTool, MessageType } from "../../shared/src";

export default defineUnlistedScript(() => {
  console.log("Script injected.");

  // 結果を送信
  const sendResult = (requestId: string, success: boolean, result: string) => {
    window.postMessage(
      { type: MessageType.RESULT, requestId, success, result },
      "*"
    );
  };

  window.addEventListener("message", async (event) => {
    if (event.source !== window || !event.data.type || !event.data.payload)
      return;

    const { type, payload } = event.data;

    if (type === MessageType.GET_NOTE_INFO) {
      const noteManager = (window as any).k;
      window.postMessage({ type: "NOTE_INFO", open: !!noteManager }, "*");
    }

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
