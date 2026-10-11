### https://noa.kim

Run locally with `python3 -m http.server 8000`.

After changing local CSS or JavaScript, run:

```sh
python3 scripts/update_asset_versions.py
```

Commit the updated `index.html` with the changed assets. Each local CSS/JS URL includes a content hash so visitors load the matching version after a deployment. Use `python3 scripts/update_asset_versions.py --check` to check that the versions are current.
