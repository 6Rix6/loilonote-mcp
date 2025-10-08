import { WebSocketServer, WebSocket } from "ws";
import type { RawData } from "ws";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomUUID } from "crypto";
import { Result } from "./types/result";
import {
  MessageType,
  MessagePayloads,
  AvailableTool,
} from "@loilonote-mcp/shared";

// 定数
const WS_PORT = 8787;
const TIMEOUT_MS = 5000;
const SERVER_NAME = "loilonote-mcp-server";
const SERVER_VERSION = "1.0.0";

// WebSocket関連の処理を管理するクラス
class WebSocketManager {
  private wss: WebSocketServer;
  private pendingResponses: Map<string, (data: any) => void>;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.pendingResponses = new Map();
    this.setupConnectionHandler();
  }

  private setupConnectionHandler(): void {
    this.wss.on("connection", (ws) => {
      ws.on("message", (msg) => {
        this.handleMessage(msg);
      });
    });
  }

  private handleMessage(msg: RawData | string): void {
    try {
      const data = JSON.parse(msg.toString());

      if (this.isResponseMessage(data)) {
        this.resolveResponse(data.requestId, data);
      }
    } catch (err) {
      // メッセージのパースエラーは無視
    }
  }

  private isResponseMessage(data: any): boolean {
    return (
      data.type === MessageType.RESPONSE &&
      data.requestId &&
      this.pendingResponses.has(data.requestId)
    );
  }

  private resolveResponse(requestId: string, data: any): void {
    const resolve = this.pendingResponses.get(requestId);
    if (resolve) {
      this.pendingResponses.delete(requestId);
      resolve(data);
    }
  }

  async sendRequest<T extends AvailableTool>(
    type: T,
    payload?: MessagePayloads[T]
  ): Promise<Result> {
    const requestId = randomUUID();

    const responsePromise = this.createResponsePromise(requestId);
    this.broadcastMessage({ type, requestId, ...payload });

    const result = (await responsePromise) as Result;

    if (!result.success) {
      throw new Error(result.result);
    }

    return result;
  }

  private createResponsePromise(requestId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pendingResponses.set(requestId, resolve);

      setTimeout(() => {
        if (this.pendingResponses.has(requestId)) {
          this.pendingResponses.delete(requestId);
          reject(new Error("拡張機能からの応答がタイムアウトしました"));
        }
      }, TIMEOUT_MS);
    });
  }

  private broadcastMessage(message: Record<string, any>): void {
    const messageStr = JSON.stringify(message);

    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    }
  }
}

// ツールのレスポンスを生成するヘルパー関数
function createToolResponse(text: string, isError: boolean = false) {
  return {
    content: [{ type: "text" as const, text }],
    ...(isError && { isError: true }),
  };
}

// MCPサーバーのセットアップ
function setupMcpServer(wsManager: WebSocketManager): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // カードへの書き込みツール
  server.tool(
    "Write to current Card",
    "ロイロノートで現在開いているカードに書き込むツール(上書き)",
    {
      text: z.string().describe("書き込む内容"),
    },
    async ({ text }) => {
      try {
        const result = await wsManager.sendRequest(
          MessageType.WRITE_TO_CURRENT_CARD,
          { text }
        );
        return createToolResponse(result.result);
      } catch (e: any) {
        return createToolResponse(`エラー: ${e.message}`, true);
      }
    }
  );

  // カードの読み取りツール
  server.tool(
    "Read from current Card",
    "ロイロノートで現在開いているカードの内容を取得するツール",
    {},
    async () => {
      try {
        const result = await wsManager.sendRequest(
          MessageType.READ_FROM_CURRENT_CARD
        );
        return createToolResponse(result.result);
      } catch (e: any) {
        return createToolResponse(`エラー: ${e.message}`, true);
      }
    }
  );

  return server;
}

// メイン処理
async function main(): Promise<void> {
  const wsManager = new WebSocketManager(WS_PORT);
  const server = setupMcpServer(wsManager);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// アプリケーションの起動
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
