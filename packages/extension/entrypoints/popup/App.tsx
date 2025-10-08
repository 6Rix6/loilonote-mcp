import { useEffect, useState } from "react";

export default function Popup() {
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_WS_STATUS" }, (resp) => {
      setWsStatus(resp.status);
    });
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>MCP Status</h1>
      <p>WebSocket: {wsStatus}</p>
    </div>
  );
}
