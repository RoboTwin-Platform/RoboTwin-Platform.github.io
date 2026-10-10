#!/usr/bin/env python3
"""Refresh data/robodojo_*.json from the official RoboDojo leaderboard JSON.

The leaderboard page reads the official JSON live; these files are the published
mirror and the page's fallback. Afterwards, regenerate the inline fallbacks:

    python3 tools/sync_robodojo_data.py
    python3 tools/sync_leaderboard_data.py
"""

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OFFICIAL_URL = "https://robodojo-benchmark.com/data/leaderboard.generated.json"

# Column order and labels follow robodojo-benchmark.com/LeaderBoard; keep in sync
# with ROBODOJO_DIMENSIONS in assets/js/leaderboard/sources.js.
BOARDS = {
    "sim": {
        "path": ROOT / "data" / "robodojo_leaderboard.json",
        "dimensions": [
            ("average", "Average"),
            ("sft", "Avg. (w/o Open)"),
            ("generalization", "Generalization"),
            ("precision", "Precision"),
            ("longHorizon", "Long-Horizon"),
            ("memory", "Memory"),
            ("open", "Open"),
        ],
    },
    "realworld": {
        "path": ROOT / "data" / "robodojo_real_leaderboard.json",
        "dimensions": [
            ("average", "Average"),
            ("arxX5", "ARX X5"),
            ("piper", "Piper"),
            ("piperX", "Piper X"),
        ],
    },
}


def main() -> int:
    source = sys.argv[1] if len(sys.argv) > 1 else OFFICIAL_URL
    if source.startswith("http"):
        with urllib.request.urlopen(source, timeout=60) as response:
            official = json.load(response)
    else:
        official = json.loads(Path(source).read_text())
    updated = official["updatedAt"]["iso"][:10]

    index_path = ROOT / "data" / "index.json"
    index = json.loads(index_path.read_text())

    for section, spec in BOARDS.items():
        rows = official.get(section) or []
        if not rows:
            print(f"error: official JSON has no {section} entries", file=sys.stderr)
            return 1
        data = json.loads(spec["path"].read_text())
        board = data["board"]
        dim_ids = [d for d, _ in spec["dimensions"]]
        board["dimensions"] = [{"id": d, "label": label} for d, label in spec["dimensions"]]
        board["updated"] = updated
        board["data_source"] = OFFICIAL_URL
        if section == "sim":
            board["entry_fields"] = {
                "model": "display name of the model",
                "team": "contributor team",
                "<dimension>": "[score, success_rate] pair, indexed by metrics[].index",
            }
        entries = []
        for row in rows:
            entry = {"model": row["model"], "team": row.get("team") or ""}
            for d in dim_ids:
                cell = (row.get("dimensions") or {}).get(d)
                if cell:
                    entry[d] = [cell["score"], cell["successRate"]]
            entries.append(entry)
        data["entries"] = entries
        spec["path"].write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        for item in index["boards"]:
            if item.get("data_url", "").endswith(spec["path"].name):
                item["updated"] = updated
        print(f"wrote {spec['path'].relative_to(ROOT)}: {len(entries)} entries, updated {updated}")

    index["updated"] = max(index.get("updated", ""), updated)
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
