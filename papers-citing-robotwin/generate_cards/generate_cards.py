import pandas as pd
import os
import json
from datetime import datetime
import re

# === 路径配置 ===
EXCEL_PATH = "generate_cards/papers.xlsx"
OUTPUT_HTML = "generate_cards/card.html"
OUTPUT_STATS = "generate_cards/stats.json"

# === 读取 Excel 文件 ===
df = pd.read_excel(EXCEL_PATH)

# 要求包含 'title', 'link', 'date' 三列
required_cols = ["title", "link", "date"]
missing = [c for c in required_cols if c not in df.columns]
if missing:
    raise ValueError(f"❌ Excel 缺少列: {missing}")

# 过滤无效行
valid_df = df.dropna(subset=["title", "link"])[["title", "link", "date"]]

# === 日期解析函数 ===
def parse_flexible_date(date_str: str) -> str:
    if pd.isna(date_str):
        return "[----.--.--]"
    date_str = str(date_str).strip()

    # 统一分隔符为 "."
    date_str = re.sub(r"[／/\\\-]", ".", date_str)

    # 处理纯年份（例如 2025）
    if re.fullmatch(r"\d{4}", date_str):
        return f"[{date_str}]"

    # 处理 年.月 形式（例如 2025.06）
    if re.fullmatch(r"\d{4}\.\d{1,2}", date_str):
        year, month = date_str.split(".")
        return f"[{int(year):04d}.{int(month):02d}]"

    # 处理 年.月.日 形式（例如 2025.06.02）
    if re.fullmatch(r"\d{4}\.\d{1,2}\.\d{1,2}", date_str):
        try:
            dt = datetime.strptime(date_str, "%Y.%m.%d")
            return f"[{dt.strftime('%Y.%m.%d')}]"
        except ValueError:
            pass

    # 尝试用 pandas 自动解析
    try:
        dt = pd.to_datetime(date_str, errors="coerce")
        if pd.notna(dt):
            return f"[{dt.strftime('%Y.%m.%d')}]"
    except Exception:
        pass

    return "[----.--.--]"

# === 生成 HTML 卡片 ===
html_cards = []
for _, row in valid_df.iterrows():
    pub_date = parse_flexible_date(row["date"])
    title = row["title"]
    link = row["link"]

    card = f"""
    <article class="cite-card">
      <h4 class="cite-title">
        <span class="pub-date">{pub_date}</span>
        <a href="{link}" target="_blank" rel="noopener">{title}</a>
      </h4>
    </article>
    """
    html_cards.append(card)

# === 组合完整 HTML ===
html_page = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Paper List</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <section class="card-list">
    {"".join(html_cards)}
  </section>
</body>
</html>
"""

# === 写出 HTML 文件 ===
os.makedirs(os.path.dirname(OUTPUT_HTML), exist_ok=True)
with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_page)
print(f"✅ Done: {OUTPUT_HTML}")

# === 导出统计信息 ===
stats = {
    "num_papers": len(valid_df),
    "source": EXCEL_PATH,
    "last_updated": datetime.now().strftime("%Y-%m-%d")
}
with open(OUTPUT_STATS, "w", encoding="utf-8") as f:
    json.dump(stats, f, ensure_ascii=False, indent=2)
print(f"✅ Stats written: {OUTPUT_STATS}")
