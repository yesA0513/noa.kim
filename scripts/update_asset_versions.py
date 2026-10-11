"""Version local CSS/JS URLs so cached assets match the published HTML."""

import argparse
import hashlib
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
ASSET_URL = re.compile(
    r'(?P<attribute>\b(?:src|href)=")(?P<path>[^"?]+\.(?:css|js))(?:\?[^" ]*)?"'
)


def version_url(match):
    path = match["path"]
    if path.startswith(("https://", "http://", "//")):
        return match[0]
    digest = hashlib.sha256((ROOT / path.lstrip("/")).read_bytes()).hexdigest()[:12]
    return f'{match["attribute"]}{path}?v={digest}"'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if local asset URLs are outdated.")
    args = parser.parse_args()
    original = HTML.read_text(encoding="utf-8")
    updated = ASSET_URL.sub(version_url, original)
    if original == updated:
        return
    if args.check:
        parser.exit(1, "Asset versions are outdated. Run python3 scripts/update_asset_versions.py.\n")
    HTML.write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    main()
