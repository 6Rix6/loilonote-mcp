import { AVAILABLE_TOOLS, MessageType } from "../../shared/src";

export default defineContentScript({
  matches: ["*://loilonote.app/*"],
  async main() {
    // ページにJSを注入
    console.log("Injecting script...");
    await injectScript("/inject.js", {
      keepInDom: true,
    });

    // background からメッセージ受信
    chrome.runtime.onMessage.addListener((msg) => {
      if (AVAILABLE_TOOLS.includes(msg.type)) {
        window.postMessage({ type: msg.type, payload: msg.payload }, "*");
      }
    });

    // injected.js からのメッセージ受信
    window.addEventListener("message", (event) => {
      if (event.source !== window || !event.data.type) return;
      if (event.data.type === MessageType.RESULT) {
        chrome.runtime.sendMessage({
          type: MessageType.RESULT,
          requestId: event.data.requestId,
          success: event.data.success,
          result: event.data.result,
        });
      }
      if (event.data.type === "NOTE_INFO") {
        chrome.runtime.sendMessage({
          type: "NOTE_INFO",
          open: event.data.open,
        });
      }
    });
  },
});
