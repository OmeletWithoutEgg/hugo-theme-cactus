"""Run with python3 tests/draft-label.py (requires Hugo and Dart Sass)."""
import os
from pathlib import Path
import subprocess
import tempfile

theme = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix="cactus-draft-") as directory:
    root = Path(directory)
    (root / "hugo.toml").write_text(f'''baseURL = "https://example.org/"
title = "Draft label test"
theme = "{theme.name}"
[params]
mainSections = ["posts"]
mainSection = "posts"
colortheme = "dark"
showAllPostsArchive = false
''')
    for name, draft in [("posts/draft", True), ("posts/published", False), ("about", True)]:
        page = root / "content" / f"{name}.md"
        page.parent.mkdir(parents=True, exist_ok=True)
        page.write_text(f'''---
title: {name}
date: 2020-01-01
draft: {str(draft).lower()}
tags: [example]
---
Test content.
''')
    marker = 'class="draft-label">DRAFT</span>'
    for include_drafts in [False, True]:
        output = root / ("preview" if include_drafts else "production")
        command = ["hugo", "--source", str(root), "--themesDir", str(theme.parent),
                   "--destination", str(output), "--cacheDir", str(root / "cache")]
        if include_drafts:
            command.append("--buildDrafts")
        env = dict(os.environ, HUGO_RESOURCEDIR=str(root / "resources"))
        subprocess.run(command, check=True, env=env, capture_output=True, text=True)
        assert marker not in (output / "posts/published/index.html").read_text()
        if include_drafts:
            for path in ["index.html", "posts/index.html", "tags/example/index.html",
                         "posts/draft/index.html", "about/index.html"]:
                assert marker in (output / path).read_text(), path
        else:
            assert not (output / "posts/draft/index.html").exists()
            assert not (output / "about/index.html").exists()
            assert all(marker not in page.read_text() for page in output.rglob("*.html"))
print("PASS: draft labels on home, archives, term lists, posts and pages; none on published pages.")
