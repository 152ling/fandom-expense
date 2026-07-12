const CACHE_NAME = 'fe-v11-cache-v13';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.0',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
//claude給的版本，之後有改版都要改CACHE_NAME才會抓到新版


// 這是專門用來讓 Service Worker 自殺並清除所有快取的程式碼

// self.addEventListener('install', (event) => {
//   self.skipWaiting(); // 下載後立刻啟用
// });

// self.addEventListener('activate', (event) => {
//   // 1. 強制註銷自己
//   self.registration.unregister()
//     .then(() => self.clients.matchAll())
//     .then((clients) => {
//       // 2. 讓所有打開的 PWA 分頁立刻重新整理，脫離操控
//       // clients.forEach(client => client.navigate(client.url));
//       clients.forEach(client => {
//         if (client.url) {
//           client.navigate('/'); 
//         }
//       });
//     });

//   // 3. 順便把 Cache Storage 的網頁檔案快取全部清空（不傷 localStorage）
//   event.waitUntil(
//     caches.keys().then((keys) => {
//       return Promise.all(keys.map(key => caches.delete(key)));
//     })
//   );
// });