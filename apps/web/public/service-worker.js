if (!self.define) {
  let e,
    s = {};
  const n = (n, c) => (
    (n = new URL(n + '.js', c).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = n), (e.onload = s), document.head.appendChild(e));
        } else ((e = n), importScripts(n), s());
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, a) => {
    const t = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[t]) return;
    let i = {};
    const d = (e) => n(e, t),
      r = { module: { uri: t }, exports: i, require: d };
    s[t] = Promise.all(c.map((e) => r[e] || d(e))).then((e) => (a(...e), i));
  };
}
define(['./workbox-495fd258'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '640b004ed82ec88063e191ccf321943a' },
        {
          url: '/_next/static/PbTcKtzkdv6dPanEVckbe/_buildManifest.js',
          revision: '2998701b640dbbd2df308cc966ba6729',
        },
        {
          url: '/_next/static/PbTcKtzkdv6dPanEVckbe/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/146.01f16f03818f54b2.js', revision: '01f16f03818f54b2' },
        { url: '/_next/static/chunks/166.6c5496b401d1af9e.js', revision: '6c5496b401d1af9e' },
        { url: '/_next/static/chunks/180-bb638c1eefeba026.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        {
          url: '/_next/static/chunks/1dd3208c-e5da56b1d2131a9b.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        { url: '/_next/static/chunks/231-a8c277e843783e76.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/233-c8d14937715711fb.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/312-d3d208ddc6491172.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/338-39ee6508eee6a2c7.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/393-8592051d1d34767d.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/425a1fef.4c842355d73588ca.js', revision: '4c842355d73588ca' },
        { url: '/_next/static/chunks/528-f5a4003b614f9931.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/628-9529ef157f5820d4.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/675-b1969137b479f8e1.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/816-8c22b5bdf8817ed1.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        {
          url: '/_next/static/chunks/89ddd23d-207d4a2f4b54f490.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        { url: '/_next/static/chunks/908-b309a3d77df69aef.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/978-fc8b125ba35a1808.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        { url: '/_next/static/chunks/98-ad24923ceece3176.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        {
          url: '/_next/static/chunks/98f82933-f26a2507fa71db83.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-c4c364cdfe169e69.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-5ab220d8bc605cd3.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/dashboard/layout-1c543369f92c9dbc.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/dashboard/movements/page-fc11da1057bc5081.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-65b3e6e67cec68bb.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/decision-today/page-5f4a3323e804ec9a.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/forage/new/page-ec27fdb7c34376cf.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/%5BherdId%5D/page-89345716adf64230.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/new/page-0a7632cafb6931a3.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/%5BmovementId%5D/close/page-be69fd0630e9aae0.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/new/page-70b769e408233a5b.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/paddocks/page-f606e11be7185f69.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/page-424a912b9912b52b.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/weighings/new/page-96d9e7aa1e5aadb1.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/new/page-fee36d49d021356d.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/farms/page-b32ecf30b0fec52c.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/herds/page-5f2000136c3f4639.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/layout-4d07cd7835a27d70.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/paddocks/page-c425b327351297d2.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/app/page-6a3cca7ac14232fd.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        { url: '/_next/static/chunks/da458701.9d4581a0a6f8d46b.js', revision: '9d4581a0a6f8d46b' },
        {
          url: '/_next/static/chunks/framework-5d515e4f968320cb.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/main-app-7644a26321ec7adf.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        { url: '/_next/static/chunks/main-ead1282e777f7d97.js', revision: 'PbTcKtzkdv6dPanEVckbe' },
        {
          url: '/_next/static/chunks/pages/_app-58c3f1a8a070bd35.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/pages/_error-312a564ec7e2663f.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-c40da67bb9cc5875.js',
          revision: 'PbTcKtzkdv6dPanEVckbe',
        },
        { url: '/_next/static/css/8dfcd29279da27b1.css', revision: '8dfcd29279da27b1' },
        { url: '/manifest.json', revision: '500b17c67b1d4e945a93d882b1e44a8b' },
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
            cacheWillUpdate: async ({ request: e, response: s, event: n, state: c }) =>
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
