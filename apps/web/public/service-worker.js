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
    const u = (s) => n(s, i),
      l = { module: { uri: i }, exports: c, require: u };
    e[i] = Promise.all(a.map((s) => l[s] || u(s))).then((s) => (t(...s), c));
  };
}
define(['./workbox-495fd258'], function (s) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '64a36cda6a5d811a748f7db121741baa' },
        {
          url: '/_next/static/CKkXsW8BhG1mElM9-lu2A/_buildManifest.js',
          revision: '2998701b640dbbd2df308cc966ba6729',
        },
        {
          url: '/_next/static/CKkXsW8BhG1mElM9-lu2A/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/146.01f16f03818f54b2.js', revision: '01f16f03818f54b2' },
        { url: '/_next/static/chunks/166.6c5496b401d1af9e.js', revision: '6c5496b401d1af9e' },
        { url: '/_next/static/chunks/180-2cc9de87f75435f3.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/199-c365896aa083a64f.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        {
          url: '/_next/static/chunks/1dd3208c-e581d1ea586744e1.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        { url: '/_next/static/chunks/233-98fd7510742cd795.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/312-f0cbff34eb2b2c33.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/338-882d4055de3edf4b.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/376-32b33187a1c38b88.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/393-8592051d1d34767d.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/425a1fef.4c842355d73588ca.js', revision: '4c842355d73588ca' },
        { url: '/_next/static/chunks/477-14b1122a163dc0b6.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/528-c4e86338e4ef0a85.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/583-2513aad41d4cebb9.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/675-1db2217fc03707cc.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/786-2596e702902a9b2d.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        {
          url: '/_next/static/chunks/89ddd23d-207d4a2f4b54f490.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        { url: '/_next/static/chunks/908-c98d32a32bee3b0c.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        { url: '/_next/static/chunks/978-45c120374dc74fe0.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        {
          url: '/_next/static/chunks/98f82933-f26a2507fa71db83.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-c579ae0b6c5001b3.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-8d831a40b438cbac.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/dashboard/layout-1c543369f92c9dbc.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/dashboard/movements/page-2eaafe0941ceaf7d.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-4ef22bb3989d84e5.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/decision-today/page-6b91a1c7bf78c76f.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/forage/new/page-2c5847125de67dd5.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/%5BherdId%5D/page-2c76983567725ea0.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/new/page-974a64ff5464d00d.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/%5BmovementId%5D/close/page-535b2afd19f651b2.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/new/page-d65a2f3e95758bf5.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/paddocks/page-c5d06c91c9f9af01.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/page-5211ee0a9937b917.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/weighings/new/page-dae9555cfe0a2e47.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/new/page-e7ec76d562a3c346.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/farms/page-3952c471ce49cbc9.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/herds/page-723f8f2f44eb742b.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/layout-bfd07dcc0e0e0d9f.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/paddocks/page-d02df44e59dac152.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/app/page-7c59a31b466ce96f.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        { url: '/_next/static/chunks/da458701.9d4581a0a6f8d46b.js', revision: '9d4581a0a6f8d46b' },
        {
          url: '/_next/static/chunks/framework-5d515e4f968320cb.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/main-app-7644a26321ec7adf.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        { url: '/_next/static/chunks/main-ead1282e777f7d97.js', revision: 'CKkXsW8BhG1mElM9-lu2A' },
        {
          url: '/_next/static/chunks/pages/_app-58c3f1a8a070bd35.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/pages/_error-312a564ec7e2663f.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-c40da67bb9cc5875.js',
          revision: 'CKkXsW8BhG1mElM9-lu2A',
        },
        { url: '/_next/static/css/38e7ae30125e65ec.css', revision: '38e7ae30125e65ec' },
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
