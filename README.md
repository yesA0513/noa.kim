### https://noa.kim

Run locally with `python3 -m http.server 8000`.

The responsive portfolio uses a wide introduction and selected-work section, a photography panel, and a combined Seoul clock / Seongnam weather display. Music and ambient controls stay in the bottom dock. Theme preferences and ambient settings are saved separately.

Photography, skill icons and the Inter font are served locally. Inter v4.1 is distributed under the SIL Open Font License; see `img/fonts/LICENSE.txt`. Music and weather use their existing live APIs and show fallback states when unavailable.

After changing local CSS or JavaScript, run:

```sh
python3 scripts/update_asset_versions.py
```

Commit the updated `index.html` with the changed assets. Each local CSS/JS URL includes a content hash so visitors load the matching version after a deployment. Use `python3 scripts/update_asset_versions.py --check` to check that the versions are current.
