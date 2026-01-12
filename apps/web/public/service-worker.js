if (!self.define) {
  let s,
    e = {};
  const t = (t, n) => (
    (t = new URL(t + '.js', n).href),
    e[t] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = t), (s.onload = e), document.head.appendChild(s));
        } else ((s = t), importScripts(t), e());
      }).then(() => {
        let s = e[t];
        if (!s) throw new Error(`Module ${t} didn’t register its module`);
        return s;
      })
  );
  self.define = (n, a) => {
    const i = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[i]) return;
    let c = {};
    const r = (s) => t(s, i),
      d = { module: { uri: i }, exports: c, require: r };
    e[i] = Promise.all(n.map((s) => d[s] || r(s))).then((s) => (a(...s), c));
  };
}
define(['./workbox-495fd258'], function (s) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: 'd3f1e7223986ea4fe3d34d23376a63d2' },
        { url: '/_next/static/chunks/146.01f16f03818f54b2.js', revision: '01f16f03818f54b2' },
        { url: '/_next/static/chunks/166.6c5496b401d1af9e.js', revision: '6c5496b401d1af9e' },
        { url: '/_next/static/chunks/180-bb638c1eefeba026.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        {
          url: '/_next/static/chunks/1dd3208c-e5da56b1d2131a9b.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        { url: '/_next/static/chunks/231-a8c277e843783e76.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/233-c8d14937715711fb.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/312-d3d208ddc6491172.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/338-39ee6508eee6a2c7.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/393-8592051d1d34767d.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/425a1fef.4c842355d73588ca.js', revision: '4c842355d73588ca' },
        { url: '/_next/static/chunks/528-f5a4003b614f9931.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/628-9529ef157f5820d4.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/675-b1969137b479f8e1.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/816-8c22b5bdf8817ed1.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        {
          url: '/_next/static/chunks/89ddd23d-207d4a2f4b54f490.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        { url: '/_next/static/chunks/908-b309a3d77df69aef.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/978-fc8b125ba35a1808.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        { url: '/_next/static/chunks/98-ad24923ceece3176.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        {
          url: '/_next/static/chunks/98f82933-f26a2507fa71db83.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-c4c364cdfe169e69.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-5ab220d8bc605cd3.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/dashboard/layout-1c543369f92c9dbc.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/dashboard/movements/page-fc11da1057bc5081.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-65b3e6e67cec68bb.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/decision-today/page-5f4a3323e804ec9a.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/forage/new/page-ec27fdb7c34376cf.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/%5BherdId%5D/page-89345716adf64230.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/herds/new/page-0a7632cafb6931a3.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/%5BmovementId%5D/close/page-be69fd0630e9aae0.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/movements/new/page-70b769e408233a5b.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/paddocks/page-f606e11be7185f69.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/page-424a912b9912b52b.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/%5Bid%5D/weighings/new/page-96d9e7aa1e5aadb1.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/new/page-fee36d49d021356d.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/farms/page-b32ecf30b0fec52c.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/herds/page-5f2000136c3f4639.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/layout-889f5996d2760874.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/paddocks/page-c425b327351297d2.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/app/page-6a3cca7ac14232fd.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        { url: '/_next/static/chunks/da458701.9d4581a0a6f8d46b.js', revision: '9d4581a0a6f8d46b' },
        {
          url: '/_next/static/chunks/framework-5d515e4f968320cb.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/main-app-7644a26321ec7adf.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        { url: '/_next/static/chunks/main-ead1282e777f7d97.js', revision: 'z54Fsfl0z_FkJstWKbKdU' },
        {
          url: '/_next/static/chunks/pages/_app-58c3f1a8a070bd35.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/pages/_error-312a564ec7e2663f.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-c40da67bb9cc5875.js',
          revision: 'z54Fsfl0z_FkJstWKbKdU',
        },
        { url: '/_next/static/css/38e7ae30125e65ec.css', revision: '38e7ae30125e65ec' },
        {
          url: '/_next/static/z54Fsfl0z_FkJstWKbKdU/_buildManifest.js',
          revision: '2998701b640dbbd2df308cc966ba6729',
        },
        {
          url: '/_next/static/z54Fsfl0z_FkJstWKbKdU/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
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
            cacheWillUpdate: async ({ request: s, response: e, event: t, state: n }) =>
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
