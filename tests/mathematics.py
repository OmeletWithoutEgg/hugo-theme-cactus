"""Build fixtures to verify static math, TOC markup, and failure diagnostics."""
from pathlib import Path
import os
import subprocess
import tempfile

THEME = Path(__file__).resolve().parents[1]

with tempfile.TemporaryDirectory(prefix="cactus-math-") as directory:
    site = Path(directory)
    (site / "hugo.toml").write_text(r'''
baseURL = "https://example.org/demo/"
theme = "cactus"
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)'], ['$', '$']]
[markup.goldmark.parser.attribute]
  block = true
[markup.tableOfContents]
  startLevel = 2
  endLevel = 4
''')
    posts = site / "content/posts"
    posts.mkdir(parents=True)
    (posts / "math.md").write_text(r'''---
title: Math
---
## Linked [$x^2$](https://example.org/) {#formula .custom-heading}

Inline $a_1 + b_2$ and \(c^2\).

$$
\begin{aligned}
a &= b + c \\
  &= d
\end{aligned}
$$
''')
    (posts / "literal.md").write_text('''---
title: Literal
---
`$a_1$` stays literal.

```tex
$$x^2$$
```
''')

    def build():
        return subprocess.run(
            ["hugo", "--source", str(site), "--themesDir", str(THEME.parent), "--minify"],
            capture_output=True, text=True, env=os.environ,
        )

    result = build()
    assert result.returncode == 0, result.stdout + result.stderr
    math = (site / "public/posts/math/index.html").read_text()
    literal = (site / "public/posts/literal/index.html").read_text()
    assert "katex" in math and "<math" in math
    assert "/demo/lib/katex/katex" in math
    assert "custom-heading" in math and "id=formula" in math
    assert "MathJax" not in math
    toc = math.split('<nav id=TableOfContents>', 1)[1].split('</nav>', 1)[0]
    assert "katex" in toc and "href=#formula" in toc
    assert "https://example.org/" not in toc, "TOC must not contain nested heading links"
    assert "/lib/katex/" not in literal
    assert "$a_1$" in literal and "$$x^2$$" in literal

    (posts / "invalid.md").write_text('---\ntitle: Invalid\n---\n$\\notARealCommand{x}$\n')
    result = build()
    assert result.returncode != 0
    assert "invalid.md" in result.stdout + result.stderr
    print("PASS: static HTML/MathML, TOC links and attributes, conditional CSS, literal code, invalid math diagnostics")
