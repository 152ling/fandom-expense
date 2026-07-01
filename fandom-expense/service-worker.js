// self.addEventListener("install", () => self.skipWaiting());
// self.addEventListener("activate", () => console.log("SW active"));
// service-worker.js 
// 這是專門用來讓 Service Worker 自殺並清除所有快取的程式碼

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 下載後立刻啟用
});

self.addEventListener('activate', (event) => {
  // 1. 強制註銷自己
  self.registration.unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      // 2. 讓所有打開的 PWA 分頁立刻重新整理，脫離操控
      clients.forEach(client => client.navigate(client.url));
    });

  // 3. 順便把 Cache Storage 的網頁檔案快取全部清空（不傷 localStorage）
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => caches.delete(key)));
    })
  );
});
