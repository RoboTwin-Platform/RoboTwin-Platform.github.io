window.RoboTwinLB = window.RoboTwinLB || {};

(function (LB) {

const fmt = (v, digits) => {
  if (digits != null) return v.toFixed(digits) + '%';
  return (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1)) + '%';
};

const heat = (v) => {
  const t = Math.max(0, Math.min(100, v)) / 100;
  return `background:rgba(101,164,135,${0.08 + 0.55 * t})`;
};

const avgMean = (e) => (e.easy_mean + e.hard_mean) / 2;

const scoreOf = (e, key) => {
  if (key === 'easy') return e.easy_mean;
  if (key === 'hard') return e.hard_mean;
  return avgMean(e);
};

LB.initRoboTwinBoard = function (data) {
  const board = data.board || {};
  const tasks = data.tasks || [];
  const entries = data.entries || [];
  const rankings = board.rankings || [];
  const settings = new Map((board.settings || []).map((s) => [s.id, s]));
  const defaultContributor = board.default_contributor || '—';

  let sortKey = board.default_ranking || 'avg';
  let viewMode = 'all';

  const rankingOf = (key) => rankings.find((r) => r.id === key) || { label: key, eval: key };
  const settingNameOf = (key) => rankingOf(key).label;
  const evalLabelOf = (key) => rankingOf(key).eval;
  const digitsOf = (e) => (e.setting === 'sft' ? 2 : 1);

  const sortedEntries = () => {
    const altKey = sortKey === 'easy' ? 'hard' : 'easy';
    return [...entries].sort((a, b) =>
      (scoreOf(b, sortKey) - scoreOf(a, sortKey)) ||
      (scoreOf(b, altKey) - scoreOf(a, altKey))
    );
  };

  const visibleRankEntries = () => {
    const rows = sortedEntries();
    return viewMode === 'top10' ? rows.slice(0, 10) : rows;
  };

  const updateRankHeading = () => {
    const suffix = viewMode === 'top10' ? ' · Top 10' : '';
    document.getElementById('rankHeading').textContent =
      `Overall Ranking — ${settingNameOf(sortKey)}${suffix}`;
  };

  const renderRank = () => {
    const rows = visibleRankEntries();
    const tbody = document.querySelector('#rankTable tbody');
    tbody.innerHTML = rows.map((e, i) => {
      const rank = i + 1;
      const setting = settings.get(e.setting);
      const badge = e.setting === 'sft'
        ? `<span class="badge-sft">${setting ? setting.label : 'Single'}</span>`
        : `<span class="badge-co">${setting ? setting.label : 'Co-train'}</span>`;
      const digits = digitsOf(e);
      const avg = avgMean(e);
      const avgStyle = sortKey === 'avg' ? heat(avg) : '';
      const hardStyle = sortKey === 'hard' ? heat(e.hard_mean) : '';
      const easyStyle = sortKey === 'easy' ? heat(e.easy_mean) : '';
      return `<tr>
        <td class="sticky-left"><span class="rank-num ${rank <= 3 ? 'top' : ''}">#${rank}</span></td>
        <td class="col-method"><span class="method-name">${e.name}</span></td>
        <td class="contributor">${e.contributor || defaultContributor}</td>
        <td class="score-avg" style="${avgStyle}">${fmt(avg, digits)}</td>
        <td class="score-hard" style="${hardStyle}">${fmt(e.hard_mean, digits)}</td>
        <td class="score-easy" style="${easyStyle}">${fmt(e.easy_mean, digits)}</td>
        <td class="col-track">${badge}</td>
        <td class="listed-at">${e.listed_at || '—'}</td>
      </tr>`;
    }).join('');
  };

  const renderTasks = () => {
    const rows = sortedEntries();
    const thead = document.querySelector('#taskTable thead');
    const tbody = document.querySelector('#taskTable tbody');

    thead.innerHTML = `
      <tr>
        <th class="sticky-left">Task</th>
        ${rows.map((e) => {
          const mark = e.setting === 'sft' ? ' <span style="opacity:.9">· Single</span>' : '';
          return `<th colspan="2">${e.name}${mark}</th>`;
        }).join('')}
      </tr>
      <tr class="sub">
        <th class="sticky-left"></th>
        ${rows.map(() => '<th>Easy</th><th>Hard</th>').join('')}
      </tr>`;

    const body = tasks.map((task, ti) => {
      const cells = rows.map((e) => {
        const easy = e.easy[ti], hard = e.hard[ti];
        return `<td style="${heat(easy)}">${fmt(easy)}</td><td style="${heat(hard)}">${fmt(hard)}</td>`;
      }).join('');
      return `<tr><th class="sticky-left">${task}</th>${cells}</tr>`;
    });

    const avg = rows.map((e) => {
      const d = digitsOf(e);
      return `<td class="avg" style="${heat(e.easy_mean)}">${fmt(e.easy_mean, d)}</td>
              <td class="avg" style="${heat(e.hard_mean)}">${fmt(e.hard_mean, d)}</td>`;
    }).join('');
    body.push(`<tr class="avg-row"><th class="sticky-left">Average</th>${avg}</tr>`);
    tbody.innerHTML = body.join('');
  };

  const setSort = (key) => {
    sortKey = key;
    document.querySelectorAll('.sort-btn[data-sort]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.sort === key);
    });
    document.getElementById('thAvg').classList.toggle('sort-active', key === 'avg');
    document.getElementById('thHard').classList.toggle('sort-active', key === 'hard');
    document.getElementById('thEasy').classList.toggle('sort-active', key === 'easy');
    document.getElementById('sortHint').textContent = `Ranked by ${settingNameOf(key)} mean ↓`;
    document.getElementById('rankSettingTitle').innerHTML = `<em>${settingNameOf(key)}</em>`;
    document.getElementById('rankSettingEval').innerHTML = `<b>Eval / sort</b>: ${evalLabelOf(key)}`;
    updateRankHeading();
    renderRank();
    renderTasks();
  };

  const setView = (mode) => {
    viewMode = mode;
    document.querySelectorAll('.sort-btn[data-view]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === mode);
    });
    updateRankHeading();
    renderRank();
  };

  const renderRankingButtons = () => {
    const host = document.getElementById('rankSortChips');
    if (!host) return;
    host.innerHTML = rankings.map((r) =>
      `<button class="sort-btn${r.id === sortKey ? ' active' : ''}" data-sort="${r.id}" type="button">${r.label}</button>`
    ).join('');
  };

  const renderNews = () => {
    const host = document.getElementById('newsList');
    if (!host) return;
    host.innerHTML = (data.news || []).map((n) =>
      `<li><b>${n.date.replace(/-/g, '/')}</b>: ${n.text}</li>`
    ).join('');
  };

  const fillUpdated = () => {
    const el = document.getElementById('updatedAtDetail');
    if (el) el.textContent = board.updated || '';
  };

  renderRankingButtons();
  document.querySelectorAll('.sort-btn[data-sort]').forEach((btn) => {
    btn.addEventListener('click', () => setSort(btn.dataset.sort));
  });
  document.querySelectorAll('.sort-btn[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  renderNews();
  fillUpdated();
  setSort(sortKey);
};

})(window.RoboTwinLB);
