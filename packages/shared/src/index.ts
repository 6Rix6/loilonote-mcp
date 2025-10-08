/**
 * メッセージタイプの定義
 */
export const MessageType = {
  WRITE_TO_CURRENT_CARD: "WRITE_TO_CURRENT_CARD",
  READ_FROM_CURRENT_CARD: "READ_FROM_CURRENT_CARD",
  RESPONSE: "RESPONSE",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

/**
 * ツールとして利用可能なメッセージタイプ
 */
export const AVAILABLE_TOOLS = [
  MessageType.READ_FROM_CURRENT_CARD,
  MessageType.WRITE_TO_CURRENT_CARD,
] as const;

export type AvailableTool = (typeof AVAILABLE_TOOLS)[number];

/**
 * 各メッセージタイプのペイロード定義
 */
export interface MessagePayloads {
  [MessageType.WRITE_TO_CURRENT_CARD]: {
    text: string;
  };
  [MessageType.READ_FROM_CURRENT_CARD]: Record<string, never>; // 空のオブジェクト
  [MessageType.RESPONSE]: {
    requestId: string;
    success: boolean;
    result: string;
  };
}

/**
 * WebSocketメッセージの型
 */
export interface WebSocketMessage<T extends MessageType = MessageType> {
  type: T;
  requestId: string;
  payload?: T extends keyof MessagePayloads ? MessagePayloads[T] : unknown;
}

/**
 * ツールチェック用のヘルパー関数
 */
// export function isAvailableTool(type: string): type is AvailableTool {
//   return AVAILABLE_TOOLS.includes(type as AvailableTool);
// }
