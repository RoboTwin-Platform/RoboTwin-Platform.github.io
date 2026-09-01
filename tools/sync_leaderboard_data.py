#!/usr/bin/env python3
"""Copy data/*.json into the inline fallback blocks of leaderboard.html.

data/*.json is the canonical, crawlable copy. The inline blocks only exist so the
page still renders when opened from file://, where fetch() is blocked. Run this
after editing any board data:

    python3 tools/sync_leaderboard_data.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "leaderboard.html"

BLOCKS = {
    "robotwin-data-fallback": ROOT / "data" / "robotwin_leaderboard.json",
    "robodojo-data-fallback": ROOT / "data" / "robodojo_leaderboard.json",
}


def main() -> int:
    html = PAGE.read_text()

    for element_id, source in BLOCKS.items():
        payload = json.dumps(json.loads(source.read_text()), ensure_ascii=False,
                             separators=(",", ":"))
        # Keep a literal </script> inside the data from closing the host element.
        payload = payload.replace("</", "<\\/")
        pattern = re.compile(
            r'(<script id="%s" type="application/json">\n).*?(\n  </script>)' % element_id,
            re.S,
        )
        html, count = pattern.subn(lambda m: m.group(1) + payload + m.group(2), html)
        if count != 1:
            print(f"error: expected 1 block for #{element_id}, found {count}", file=sys.stderr)
            return 1
        print(f"synced #{element_id} from {source.relative_to(ROOT)} ({len(payload)} bytes)")

    PAGE.write_text(html)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
