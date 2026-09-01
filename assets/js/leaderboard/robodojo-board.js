window.RoboTwinLB = window.RoboTwinLB || {};

(function (LB) {

const MEDALS = { 1: '\u{1F947}', 2: '\u{1F948}', 3: '\u{1F949}' };

const fmtCell = (pair) => (pair ? `${pair[0].toFixed(2)}/${pair[1].toFixed(2)}%` : '\u2014');

const renderChips = (elId, options, isActive, onPick) => {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '';
  options.forEach((o) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dojo-board__chip' + (isActive(o) ? ' is-active' : '');
    btn.textContent = o.label;
    btn.setAttribute('aria-pressed', isActive(o) ? 'true' : 'false');
    btn.addEventListener('click', () => onPick(o));
    el.appendChild(btn);
  });
};

LB.initRoboDojoBoard = function (data) {
  const board = data.board || {};
  const entries = data.entries || [];
  const dims = board.dimensions || [];
  const metrics = board.metrics || [];
  const topN = board.preview_top_n || 10;

  let dim = board.default_dimension || (dims[0] && dims[0].id);
  let metric = metrics.find((m) => m.id === board.default_metric) || metrics[0];

  const sorted = () => [...entries].sort((a, b) =>
    (b[dim][metric.index] - a[dim][metric.index]) ||
    (b[dim][1 - metric.index] - a[dim][1 - metric.index]) ||
    a.model.localeCompare(b.model));

  const render = () => {
    renderChips('dojoDimChips', dims, (o) => o.id === dim, (o) => { dim = o.id; render(); });
    renderChips('dojoMetricChips', metrics, (o) => o.id === metric.id, (o) => { metric = o; render(); });

    const dimLabel = (dims.find((d) => d.id === dim) || {}).label || dim;
    const meta = document.getElementById('dojoSortMeta');
    if (meta) meta.textContent = `Top ${topN} · Ranked by ${dimLabel} \u00b7 ${metric.label} \u2193`;

    const stamp = document.getElementById('dojoUpdatedAt');
    if (stamp && board.updated) {
      stamp.textContent = board.updated;
      stamp.setAttribute('datetime', board.updated);
    }

    const thead = document.querySelector('#dojoTable thead');
    thead.innerHTML = `<tr>
      <th scope="col">Rank</th>
      <th scope="col">Model</th>
      <th scope="col">Contributor</th>
      ${dims.map((d) => `<th scope="col" class="${d.id === dim ? 'is-sorted' : ''}" aria-sort="${d.id === dim ? 'descending' : 'none'}"><button type="button" class="dojo-board__th-sort" data-dim="${d.id}">${d.label}${d.id === dim ? ' \u2193' : ''}</button></th>`).join('')}
    </tr>`;
    thead.querySelectorAll('.dojo-board__th-sort').forEach((btn) => {
      btn.addEventListener('click', () => { dim = btn.dataset.dim; render(); });
    });

    const shown = sorted().slice(0, topN);
    const tbody = document.querySelector('#dojoTable tbody');
    tbody.innerHTML = shown.map((e, i) => {
      const rank = i + 1;
      const medal = MEDALS[rank];
      return `<tr class="dojo-board__row" data-rank="${rank}">
        <td class="dojo-board__rank">${medal ? `<span class="dojo-board__medal" aria-label="Rank ${rank}">${medal}</span>` : rank}</td>
        <td class="dojo-board__model">${e.model}</td>
        <td class="dojo-board__contributor">${e.team}</td>
        ${dims.map((d) => `<td class="dojo-board__metric${d.id === dim ? ' is-sort-col' : ''}${d.id === dim && rank === 1 ? ' is-leader' : ''}">${fmtCell(e[d.id])}</td>`).join('')}
      </tr>`;
    }).join('');
  };

  render();
};

})(window.RoboTwinLB);
