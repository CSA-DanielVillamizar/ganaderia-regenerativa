if (!self.define) {
  let e,
    s = {};
  const t = (t, n) => (
    (t = new URL(t + '.js', n).href),
    s[t] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = t), (e.onload = s), document.head.appendChild(e));
        } else ((e = t), importScripts(t), s());
      }).then(() => {
        let e = s[t];
        if (!e) throw new Error(`Module ${t} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, a) => {
    const i = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[i]) return;
    let c = {};
    const u = (e) => t(e, i),
      r = { module: { uri: i }, exports: c, require: u };
    s[i] = Promise.all(n.map((e) => r[e] || u(e))).then((e) => (a(...e), c));
  };
}
define(['./workbox-495fd258'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '0f5436a3a3a06a73818a47f1393d166f' },
        {
          url: '/_next/static/0Ym3QBu4uZKTJ0AE0qtJj/_buildManifest.js',
          revision: '2998701b640dbbd2df308cc966ba6729',
        },
        {
          url: '/_next/static/0Ym3QBu4uZKTJ0AE0qtJj/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/126-fcfe44ac5655daf3.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/146.01f16f03818f54b2.js', revision: '01f16f03818f54b2' },
        { url: '/_next/static/chunks/166.6c5496b401d1af9e.js', revision: '6c5496b401d1af9e' },
        { url: '/_next/static/chunks/180-53dd119026c8631d.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        {
          url: '/_next/static/chunks/1dd3208c-e581d1ea586744e1.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        { url: '/_next/static/chunks/233-bcad5e00a71cdb0e.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/284-03de0ff5f9cc66d7.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/312-f0cbff34eb2b2c33.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/338-882d4055de3edf4b.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/393-8592051d1d34767d.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/425a1fef.4c842355d73588ca.js', revision: '4c842355d73588ca' },
        { url: '/_next/static/chunks/503-79493703e229e4c0.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/528-c4e86338e4ef0a85.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/583-5137709e541862c6.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/675-1db2217fc03707cc.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/737-791690ce1254b6d4.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        {
          url: '/_next/static/chunks/89ddd23d-207d4a2f4b54f490.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        { url: '/_next/static/chunks/908-b309a3d77df69aef.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        { url: '/_next/static/chunks/978-45c120374dc74fe0.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        {
          url: '/_next/static/chunks/98f82933-f26a2507fa71db83.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-c579ae0b6c5001b3.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-d54e571d2b232894.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/dashboard/layout-1c543369f92c9dbc.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/dashboard/movements/page-1a142e4caf1d87da.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-93f58095aeecccd1.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/decision-today/page-89fc650651400f89.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/forage/new/page-884b0195ec4df8df.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/%5BherdId%5D/page-8088d0c8feb0e47c.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/new/page-ec8feee642420a54.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/%5BmovementId%5D/close/page-f5a77fd131a83d3d.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/new/page-5922378044598bb0.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/paddocks/page-b399c3d5181e7430.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/page-ba31148574377924.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/weighings/new/page-e8417d7956baec49.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/new/page-4a10977cb59d5df8.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/farms/page-119bbe22fc6c5022.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/herds/page-fa1edf14d9fcecc8.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/layout-fdc7918b96c8f553.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/paddocks/page-be4930bdb9d71cee.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/app/page-7c59a31b466ce96f.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        { url: '/_next/static/chunks/da458701.9d4581a0a6f8d46b.js', revision: '9d4581a0a6f8d46b' },
        {
          url: '/_next/static/chunks/framework-5d515e4f968320cb.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/main-app-7644a26321ec7adf.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        { url: '/_next/static/chunks/main-ead1282e777f7d97.js', revision: '0Ym3QBu4uZKTJ0AE0qtJj' },
        {
          url: '/_next/static/chunks/pages/_app-58c3f1a8a070bd35.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/pages/_error-312a564ec7e2663f.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-c40da67bb9cc5875.js',
          revision: '0Ym3QBu4uZKTJ0AE0qtJj',
        },
        { url: '/_next/static/css/ce5686ad03c07dde.css', revision: 'ce5686ad03c07dde' },
        { url: '/icon-generator.html', revision: '4430bb6791bcbaaa3eac92e12e9b9926' },
        { url: '/icons/icon-192x192.png', revision: 'c1b36f909f3e3d1f563d695b4327bae6' },
        { url: '/icons/icon-512x512.png', revision: 'c1b36f909f3e3d1f563d695b4327bae6' },
        { url: '/icons/icon-apple-touch.png', revision: 'c1b36f909f3e3d1f563d695b4327bae6' },
        { url: '/manifest.json', revision: '8c2184bd9a827b300f73db694549f6b1' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: t, state: n }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ));
});
