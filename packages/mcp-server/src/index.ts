import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8787 });
console.log("✅ MCP WebSocket server started on ws://localhost:8787");

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("message", (msg) => console.log("Received:", msg.toString()));
  ws.send(JSON.stringify({ hello: "from MCP server" }));
});
