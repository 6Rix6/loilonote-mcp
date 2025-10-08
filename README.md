# ロイロノート MCP

## アーキテクチャ

```plaintext
[MCP Server] ←→ (WebSocket) ←→ [background.js]
                                     ↓
                             chrome.runtime.sendMessage()
                                     ↓
                              [content.js]
                                     ↓
                           window.postMessage()
                                     ↓
                              [inject.js]
                                     ↓
                           window.somePageFunc()
```
