import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "ロイロノートMCP",
    version: "1.0",

    permissions: [
      "declarativeNetRequest",
      "declarativeNetRequestWithHostAccess",
      "scripting",
      "activeTab",
      "tabs",
    ],

    host_permissions: ["*://*.loilonote.app/*", "*://loilonote.app/*"],

    web_accessible_resources: [
      {
        resources: ["/replacement/index.js", "inject.js"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
