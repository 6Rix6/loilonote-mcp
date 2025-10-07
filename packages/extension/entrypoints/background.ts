// entrypoints/background.ts
export default defineBackground(() => {
  // replace loilonote index.js to local one
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
});
