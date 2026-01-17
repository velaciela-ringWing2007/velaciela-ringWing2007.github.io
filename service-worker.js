// Service Worker (PWA対応用ダミー)
// 必要に応じてキャッシュ戦略を追加してください

const CACHE_NAME = 'gh-pages-v1';

// インストール時
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// フェッチ時（ネットワークファースト）
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
