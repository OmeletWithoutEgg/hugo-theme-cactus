---
title: "Code block test"
date: 2024-01-02T12:00:00Z
tags: [code, markdown]
draft: false
---

Lorem ipsum dolor sit amet. These examples exercise syntax highlighting, indentation, line numbers, highlighted lines, and horizontal scrolling.

## Python

```python
def fibonacci(count: int) -> list[int]:
    """Return the first count Fibonacci numbers."""
    values = []
    a, b = 0, 1
    for _ in range(count):
        values.append(a)
        a, b = b, a + b
    return values


print(fibonacci(10))
```

## JavaScript with highlighted lines

```javascript {linenos=true,hl_lines=[3,4],linenostart=10}
const words = ["lorem", "ipsum", "dolor"];

const result = words
  .map((word) => word.toUpperCase())
  .join(" ");

console.log(result);
```

## HTML and escaping

```html
<article class="example">
  <h2>Lorem &amp; ipsum</h2>
  <p>Display &lt;tags&gt; as text.</p>
  <!-- This comment belongs inside the code block. -->
</article>
```

## CSS

```css
.example {
  display: grid;
  gap: 1rem;
  color: #2bbc8a;
}

@media (max-width: 600px) {
  .example { grid-template-columns: 1fr; }
}
```

## Shell without line numbers

```sh {linenos=false}
printf '%s\n' 'Lorem ipsum'
hugo server --buildDrafts
```

## JSON and Unicode

```json
{
  "title": "Lorem ipsum",
  "languages": ["English", "繁體中文", "日本語"],
  "enabled": true,
  "count": 42
}
```

## Long line

```text
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua; this deliberately long line should scroll horizontally instead of widening the page on a small screen.
```

## Unlabelled fenced block

```
Lorem ipsum
    Four spaces of indentation.
        Eight spaces of indentation.

A blank line separates these paragraphs.
```

## Indented code block

    lorem --input ipsum.txt
    output: dolor sit amet

## Nested Markdown fences

````markdown
## Example heading

```python
print("Lorem ipsum")
```
````
