type ExtendedWindow = typeof window & {
  V: any;
  k: any;
};

export default defineUnlistedScript(() => {
  console.log("Hello from injected.ts");
  const extendedWindow = window as ExtendedWindow;
  setTimeout(() => {
    console.log(extendedWindow.V);
  }, 2000);
  setTimeout(() => {
    const text = "hello from wsx";
    const pageManager = extendedWindow.k;
    const topCardId = pageManager.note._zOrders.at(-1);
    const card = pageManager.note.cardMap.get(topCardId);
    card.gadgets.title.text = text;
  }, 2000);
});
