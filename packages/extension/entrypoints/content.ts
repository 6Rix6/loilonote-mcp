export default defineContentScript({
  matches: ["*://loilonote.app/*"],
  async main() {
    console.log("Injecting script...");
    await injectScript("/inject.js", {
      keepInDom: true,
    });
  },
});
