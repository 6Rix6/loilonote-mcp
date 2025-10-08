import { AVAILABLE_TOOLS } from "@loilonote-mcp/shared";

export default defineBackground(() => {
  // index.jsの置き換え
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: [1],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              extensionPath: "/replacement/index.js",
            },
          },
          condition: {
            urlFilter: "js/client/index.js",
            resourceTypes: ["script"],
          },
        },
      ],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Redirect rule for index.js has been set up.");
      }
    }
  );

  const findLiloTab = async () => {
    const tabs = await chrome.tabs.query({});
    return tabs.find((tab) => tab.url && tab.url.includes("loilonote.app"));
  };

  let wsStatus: "disconnected" | "connecting" | "connected" = "disconnected";
  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;

  ws = new WebSocket("ws://localhost:8787");
  wsStatus = "connecting";
  ws.onopen = () => {
    wsStatus = "connected";
    console.log(wsStatus);
  };
  ws.onerror = () => {
    wsStatus = "disconnected";
    console.log(wsStatus);
  };
  ws.onclose = () => {
    wsStatus = "disconnected";
    console.log(wsStatus);
  };

  const connectWS = () => {
    ws = new WebSocket("ws://localhost:8787");

    ws.addEventListener("open", () => {
      console.log("WS接続成功");
      wsStatus = "connected";
      chrome.runtime.sendMessage({ status: "connected" });
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    });

    ws.addEventListener("error", (e) => {
      console.log("WS接続失敗");
      wsStatus = "disconnected";
      chrome.runtime.sendMessage({ status: "failed" });
      scheduleReconnect();
    });

    ws.addEventListener("close", () => {
      console.log("WS切断");
      wsStatus = "disconnected";
      chrome.runtime.sendMessage({ status: "closed" });
      scheduleReconnect();
    });
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      console.log("再接続を試みます...");
      connectWS();
    }, 3000);
  };

  // MCPサーバーからの通信
  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    console.log("message received. : ", data);
    const tab = await findLiloTab();
    if (!tab) return;

    if (AVAILABLE_TOOLS.includes(data.type)) {
      chrome.tabs.sendMessage(tab.id!, {
        type: data.type,
        payload: data,
      });
    }
  };

  // ポップアップからのステータス確認
  chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === "GET_WS_STATUS") {
      if (!ws) connectWS();
      sendResponse({ status: wsStatus });
    }

    if (msg.type === "RESULT") {
      if (!ws) return;
      ws.send(
        JSON.stringify({
          type: "RESPONSE",
          requestId: msg.requestId,
          result: msg.result,
          success: msg.success,
        })
      );
    }
  });
});
