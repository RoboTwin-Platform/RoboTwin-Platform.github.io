/* Shared loader for the leaderboard boards.
   Classic script (not an ES module) so the page also works from file://,
   where browsers block module scripts and fetch(). */
window.RoboTwinLB = window.RoboTwinLB || {};

(function (LB) {
  const ROBODOJO_URL = 'https://robodojo-benchmark.com/data/leaderboard.generated.json';

  // Column order and labels follow robodojo-benchmark.com/LeaderBoard; keep in
  // sync with BOARDS in tools/sync_robodojo_data.py.
  const ROBODOJO_DIMENSIONS = {
    sim: [
      { id: 'average', label: 'Average' },
      { id: 'sft', label: 'Avg. (w/o Open)' },
      { id: 'generalization', label: 'Generalization' },
      { id: 'precision', label: 'Precision' },
      { id: 'longHorizon', label: 'Long-Horizon' },
      { id: 'memory', label: 'Memory' },
      { id: 'open', label: 'Open' },
    ],
    realworld: [
      { id: 'average', label: 'Average' },
      { id: 'arxX5', label: 'ARX X5' },
      { id: 'piper', label: 'Piper' },
      { id: 'piperX', label: 'Piper X' },
    ],
  };

  LB.SOURCES = {
    robotwin: { url: 'data/robotwin_leaderboard.json', fallback: 'robotwin-data-fallback' },
    robodojo: {
      live: ROBODOJO_URL, section: 'sim',
      url: 'data/robodojo_leaderboard.json', fallback: 'robodojo-data-fallback',
    },
    robodojoReal: {
      live: ROBODOJO_URL, section: 'realworld',
      url: 'data/robodojo_real_leaderboard.json', fallback: 'robodojo-real-data-fallback',
    },
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

  const fetchJson = (url) => fetch(url, { cache: 'no-cache' }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

  // Convert one section of the official leaderboard.generated.json into the
  // { board, entries } shape of data/robodojo_*.json.
  const fromRoboDojoGenerated = (json, mirror, section) => {
    const rows = json && json[section];
    const dims = ROBODOJO_DIMENSIONS[section];
    if (!Array.isArray(rows) || !rows.length) throw new Error(`no ${section} entries`);
    const entries = rows.map((row) => {
      const entry = { model: row.model, team: row.team || '' };
      dims.forEach((d) => {
        const cell = row.dimensions && row.dimensions[d.id];
        if (cell) entry[d.id] = [Number(cell.score), Number(cell.successRate)];
      });
      return entry;
    });
    const updated = json.updatedAt && json.updatedAt.iso ? json.updatedAt.iso.slice(0, 10) : undefined;
    return {
      ...mirror,
      board: { ...(mirror && mirror.board), dimensions: dims, ...(updated ? { updated } : {}) },
      entries,
    };
  };

  // Boards with a `live` URL read the official JSON first; data/*.json stays the
  // canonical, crawlable mirror, and the inline block only covers the case where
  // neither can be fetched.
  LB.loadBoard = function (source) {
    const local = fetchJson(source.url);
    local.catch(() => {}); // handled below; avoids an unhandled-rejection warning while live is pending
    const data = source.live
      ? fetchJson(source.live)
        .then((json) => local
          .catch(() => readInline(source.fallback))
          .then((mirror) => fromRoboDojoGenerated(json, mirror, source.section)))
        .catch((err) => {
          console.warn(`${source.live} unavailable (${err.message}); using ${source.url}.`);
          return local;
        })
      : local;
    return data
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
