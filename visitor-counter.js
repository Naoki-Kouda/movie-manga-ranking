(() => {
  'use strict';

  const COUNTER_KEY = 'kouda_movie_manga_ranking_visits_8d3f1c72';
  const COUNTER_API = `https://countapi.mileshilliard.com/api/v1`;
  const LEGACY_COUNT = 14033;
  const SESSION_LENGTH = 30 * 60 * 1000;
  const SESSION_STORAGE_KEY = 'kouda-ranking:last-counted-at';

  const countElement = document.getElementById('visitor-count');
  if (!countElement) return;

  const showCount = value => {
    countElement.textContent = Number(value).toLocaleString('ja-JP');
  };

  showCount(LEGACY_COUNT);

  const isLocalPreview =
    window.location.protocol === 'file:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  let shouldIncrement = !isLocalPreview;
  let visitTimestamp = null;

  try {
    const now = Date.now();
    const lastCountedAt = Number(localStorage.getItem(SESSION_STORAGE_KEY));
    const elapsed = now - lastCountedAt;
    shouldIncrement = shouldIncrement &&
      (!Number.isFinite(lastCountedAt) || elapsed < 0 || elapsed >= SESSION_LENGTH);

    if (shouldIncrement) {
      visitTimestamp = String(now);
      localStorage.setItem(SESSION_STORAGE_KEY, visitTimestamp);
    }
  } catch {
    // Storage may be unavailable in privacy modes; the counter itself still works.
  }

  const action = shouldIncrement ? 'hit' : 'get';
  const endpoint = `${COUNTER_API}/${action}/${COUNTER_KEY}`;

  fetch(endpoint, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`Counter request failed: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const value = Number(data.value);
      if (Number.isFinite(value)) showCount(Math.max(value, LEGACY_COUNT));
    })
    .catch(() => {
      if (visitTimestamp) {
        try {
          if (localStorage.getItem(SESSION_STORAGE_KEY) === visitTimestamp) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } catch {
          // Keep the inherited count visible even when storage is unavailable.
        }
      }
      showCount(LEGACY_COUNT);
    });
})();
