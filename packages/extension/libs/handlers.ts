import { MessageType, MessagePayloads } from "@loilonote-mcp/shared";

type Handler<T extends MessageType> = (
  payload: MessagePayloads[T],
  noteManager: any
) => string;

type HandlerMap = {
  [K in MessageType]?: Handler<K>;
};

function getTopCard(noteManager: any) {
  const topCardId = noteManager.note._zOrders.at(-1);
  return noteManager.note.cardMap.get(topCardId);
}

export const handlers: HandlerMap = {
  [MessageType.WRITE_TO_CURRENT_CARD]: (payload, noteManager) => {
    const card = getTopCard(noteManager);
    if (!card) throw new Error("カードがありません");
    card.gadgets.title.text = payload.text;
    return `書き込み成功: ${payload.text}`;
  },
  [MessageType.READ_FROM_CURRENT_CARD]: (payload, noteManager) => {
    const card = getTopCard(noteManager);
    if (!card) throw new Error("カードがありません");
    return card.gadgets.title.text;
  },
};
