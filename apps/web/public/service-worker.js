if (!self.define) {
  let s,
    e = {};
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    e[n] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = n), (s.onload = e), document.head.appendChild(s));
        } else ((s = n), importScripts(n), e());
      }).then(() => {
        let s = e[n];
        if (!s) throw new Error(`Module ${n} didn’t register its module`);
        return s;
      })
  );
  self.define = (a, t) => {
    const i = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[i]) return;
    let c = {};
    const r = (s) => n(s, i),
      b = { module: { uri: i }, exports: c, require: r };
    e[i] = Promise.all(a.map((s) => b[s] || r(s))).then((s) => (t(...s), c));
  };
}
define(['./workbox-495fd258'], function (s) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '81abcc961cb87a69472855ec11d90e85' },
        { url: '/_next/static/chunks/126-fcfe44ac5655daf3.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/146.01f16f03818f54b2.js', revision: '01f16f03818f54b2' },
        { url: '/_next/static/chunks/166.6c5496b401d1af9e.js', revision: '6c5496b401d1af9e' },
        { url: '/_next/static/chunks/180-bc1c376034806e2a.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        {
          url: '/_next/static/chunks/1dd3208c-e581d1ea586744e1.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        { url: '/_next/static/chunks/233-f785c47872a69741.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/284-03de0ff5f9cc66d7.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/338-882d4055de3edf4b.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/370-65af11cf5502c14f.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/393-8592051d1d34767d.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/425a1fef.4c842355d73588ca.js', revision: '4c842355d73588ca' },
        { url: '/_next/static/chunks/503-522a7a7ba42f4d51.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/528-c4e86338e4ef0a85.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/675-1db2217fc03707cc.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/737-791690ce1254b6d4.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/842-829ab6e9748c5dce.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        {
          url: '/_next/static/chunks/89ddd23d-207d4a2f4b54f490.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        { url: '/_next/static/chunks/908-b309a3d77df69aef.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        { url: '/_next/static/chunks/978-45c120374dc74fe0.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        {
          url: '/_next/static/chunks/98f82933-f26a2507fa71db83.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-c579ae0b6c5001b3.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-096a7708ab417547.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/dashboard/layout-1c543369f92c9dbc.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/dashboard/movements/page-9c2332895a907698.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-fb4df1a446d1a5e1.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/decision-today/page-02b9c26fe2c96508.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/forage/new/page-39d1d349197ce3b0.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/%5BherdId%5D/page-d132aa0ca0be8aca.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/new/page-07f48d98c644b440.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/%5BmovementId%5D/close/page-0b57153c3f0c558c.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/new/page-a04adfd746f4297a.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/paddocks/page-a5fe9b96e09c7a6e.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/page-ba31148574377924.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/weighings/new/page-0be9f4ff0d346733.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/new/page-442e708c8e1e4335.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/farms/page-119bbe22fc6c5022.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/herds/page-fa1edf14d9fcecc8.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/layout-7672d51fb41be12d.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/paddocks/page-be4930bdb9d71cee.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/app/page-7c59a31b466ce96f.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        { url: '/_next/static/chunks/da458701.9d4581a0a6f8d46b.js', revision: '9d4581a0a6f8d46b' },
        {
          url: '/_next/static/chunks/framework-5d515e4f968320cb.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/main-app-7644a26321ec7adf.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        { url: '/_next/static/chunks/main-ead1282e777f7d97.js', revision: 'iIhDtslSaGb6kEbnDpTKF' },
        {
          url: '/_next/static/chunks/pages/_app-58c3f1a8a070bd35.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/pages/_error-312a564ec7e2663f.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-c40da67bb9cc5875.js',
          revision: 'iIhDtslSaGb6kEbnDpTKF',
        },
        { url: '/_next/static/css/cf2909480398af57.css', revision: 'cf2909480398af57' },
        {
          url: '/_next/static/iIhDtslSaGb6kEbnDpTKF/_buildManifest.js',
          revision: '2998701b640dbbd2df308cc966ba6729',
        },
        {
          url: '/_next/static/iIhDtslSaGb6kEbnDpTKF/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/icon-generator.html', revision: '4430bb6791bcbaaa3eac92e12e9b9926' },
        { url: '/icons/icon-192x192.png', revision: 'c1b36f909f3e3d1f563d695b4327bae6' },
        { url: '/icons/icon-512x512.png', revision: 'c1b36f909f3e3d1f563d695b4327bae6' },
        { url: '/icons/icon-apple-touch.png', revision: 'c1b36f909f3e3d1f563d695b4327bae6' },
        { url: '/manifest.json', revision: '8c2184bd9a827b300f73db694549f6b1' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      '/',
      new s.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: s, response: e, event: n, state: a }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, { status: 200, statusText: 'OK', headers: e.headers })
                : e,
          },
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new s.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new s.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new s.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:mp4)$/i,
      new s.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:js)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:css|less)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new s.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ url: s }) => {
        if (!(self.origin === s.origin)) return !1;
        const e = s.pathname;
        return !e.startsWith('/api/auth/') && !!e.startsWith('/api/');
      },
      new s.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ url: s }) => {
        if (!(self.origin === s.origin)) return !1;
        return !s.pathname.startsWith('/api/');
      },
      new s.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ url: s }) => !(self.origin === s.origin),
      new s.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ));
});
