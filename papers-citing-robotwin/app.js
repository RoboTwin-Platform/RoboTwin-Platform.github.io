document.addEventListener('DOMContentLoaded', () => {
  const panel20 = document.getElementById('panel20');
  const paperCountEl = document.getElementById('paper-count');
  const lastUpdatedEl = document.getElementById('last-updated');

  // 1️⃣ 加载引用论文卡片（来自 generate_cards/card.html）
  fetch('./generate_cards/card.html', { cache: 'no-cache' })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      return res.text();
    })
    .then(html => {
      panel20.innerHTML = html;
      const count = panel20.querySelectorAll('.cite-card').length;
      paperCountEl.textContent = count.toString();
    })
    .catch(err => {
      panel20.innerHTML = `<p class="load-error">❌ 无法加载 card.html<br>${err.message}</p>`;
    });

  // 2️⃣ 读取统计文件 stats.json（更新时间）
  fetch('./generate_cards/stats.json', { cache: 'no-cache' })
    .then(res => res.json())
    .then(data => {
      if (data.last_updated) {
        lastUpdatedEl.textContent = data.last_updated;
      } else {
        lastUpdatedEl.textContent = new Date().toISOString().split('T')[0];
      }
    })
    .catch(() => {
      lastUpdatedEl.textContent = new Date().toISOString().split('T')[0];
    });
});
