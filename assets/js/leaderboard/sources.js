/* Shared loader for the leaderboard boards.
   Classic script (not an ES module) so the page also works from file://,
   where browsers block module scripts and fetch(). */
window.RoboTwinLB = window.RoboTwinLB || {};

(function (LB) {
  LB.SOURCES = {
    robotwin: { url: 'data/robotwin_leaderboard.json', fallback: 'robotwin-data-fallback' },
    robodojo: { url: 'data/robodojo_leaderboard.json', fallback: 'robodojo-data-fallback' },
  };

  function readInline(elementId) {
    const el = elementId && document.getElementById(elementId);
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (err) {
      console.error(`inline fallback #${elementId} is not valid JSON`, err);
      return null;
    }
  }

  // data/*.json stays the canonical, crawlable copy; the inline block only
  // covers the case where it cannot be fetched.
  LB.loadBoard = function (source) {
    return fetch(source.url, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        const inline = readInline(source.fallback);
        if (inline) {
          console.warn(`${source.url} unavailable (${err.message}); using inline copy.`);
          return inline;
        }
        throw err;
      });
  };

  LB.renderBoardError = function (selector, url, err) {
    const host = document.querySelector(selector);
    if (!host) return;
    host.innerHTML = `<tr><td colspan="99" class="board-error">
      Could not load <code>${url}</code> (${err.message}).
    </td></tr>`;
  };
})(window.RoboTwinLB);
