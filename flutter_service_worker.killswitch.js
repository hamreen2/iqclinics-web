// One-time kill switch for a previously-installed Flutter web service worker.
//
// Deploy this ONCE in place of the normal generated flutter_service_worker.js.
// Any browser that already has the OLD service worker installed will, per
// normal browser behavior, eventually re-fetch this file from the network to
// check for updates (on next navigation / within ~24h). Since the bytes
// differ, the browser installs THIS worker, which immediately wipes every
// cache, unregisters itself, and force-reloads any open tabs - after which
// that browser has no service worker left and always loads the real,
// current site directly from network, with zero customer action needed.
//
// Not needed for a NEW visitor - they never get a service worker at all,
// since the app is now built with --pwa-strategy=none.
//
// Ported from the sibling dental_lab_flutter project (byte-for-byte
// identical file, no app-specific content) after discovering this app had
// never received the original PWA-caching fix at all -- see this project's
// own CLAUDE.md, "Web builds were caching the whole app for offline use",
// for dental_lab_flutter's own incident writeup. Confirmed live that EVERY
// verification note in this project's own CLAUDE.md history uses a plain
// `flutter build web` with no `--pwa-strategy=none` flag anywhere -- meaning
// this app's own published site has been shipping the same offline-caching
// service worker dental_lab_flutter had to kill-switch away from, the whole
// time. This file alone does nothing until the next real deploy of this app
// uses BOTH `flutter build web --pwa-strategy=none` AND then overwrites the
// freshly generated build/web/flutter_service_worker.js with this file's own
// content (see dental_lab_flutter's own build/publish steps for the exact
// two commands) -- not done as part of this pass, since this project's own
// hosting/deploy target isn't set up in this checkout (no linked Netlify
// site, no git repository found here) to actually publish it.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});
