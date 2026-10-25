---
title: "lorem ipsum"
date: 2024-01-03T12:00:00Z
tags: [markdown, typography]
draft: false
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Sed posuere consectetur est at lobortis.

## 中文、English、日本語

### 中文段落

午後的陽光穿過窗邊，落在攤開的筆記本上。我們把想法寫成文字，再用段落、標題與清單整理成一篇文章。這段範文用來觀察繁體中文的字型、行距與自動換行；縮小畫面時，也可以留意句號、逗號和括號的位置。

這是一段中英混排：使用 Hugo 建立網站，以 Markdown 撰寫內容，再透過 CSS 調整 typography。版本 v0.168.0、數字 1,024，以及「中文引號」、（全形括號）與 English punctuation，都應該清楚易讀。

### English paragraph

A quiet afternoon is a good time to write. Open a notebook, collect a few ideas, and turn them into a short article. This paragraph provides ordinary English words alongside the Latin placeholder text, so you can compare letter spacing, punctuation, and line wrapping on different screens.

### 日本語の段落

窓を開けると、やわらかな風が部屋に入ってきました。机の上には読みかけの本と、小さなノートが置いてあります。今日は散歩で見つけた景色を、短い文章にまとめてみます。漢字、ひらがな、カタカナが続くときの読みやすさや、句読点の位置を確認してください。

Hugo でブログを作り、Markdown で記事を書きます。「日本語と English の混在」、全角の数字１２３と半角の数字123、そして長音符を含む「コーヒー」「ユーザーインターフェース」も表示テストに使えます。

## Text and emphasis／文字強調

**Lorem ipsum** dolor sit amet, *consectetur adipiscing elit*, with ***bold italic text*** and ~~strikethrough~~. Inline code looks like `const message = "Lorem ipsum";`.

**粗體中文**、*斜體中文*、***粗斜體***與~~刪除線~~，也可以搭配 `行內程式碼`。日本語でも **太字**、*斜体*、~~取り消し線~~ を確認できます。

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.

A deliberate line break follows this sentence.\
This text starts on the next line in the same paragraph.

### Heading level three

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

#### Heading level four

Donec ullamcorper nulla non metus auctor fringilla.

##### Heading level five

Nullam quis risus eget urna mollis ornare vel eu leo.

###### Heading level six

Cras mattis consectetur purus sit amet fermentum.

## Links and references

Visit [Hugo](https://gohugo.io/), follow a [reference link][example], or jump to [the table](#tables).

Autolink: <https://example.com/>. Escaped punctuation: \*not italic\* and \# not a heading.

[example]: https://example.com/ "Example reference link"

## Lists／清單

- Lorem ipsum dolor sit amet.
- Consectetur adipiscing elit.
  - A nested item with **emphasis**.
  - Another nested item with `inline code`.
- 中文項目：觀察文字換行後的縮排。
  - 中英混排：檢查 Markdown list 的間距。
- 日本語の項目：改行後の位置も確認します。
- Integer posuere erat a ante.

1. Read the introduction.
2. Inspect the examples.
   1. Check spacing and indentation.
   2. Resize the viewport.
3. Follow the footnote.[^note]

- [x] Paragraphs and headings
- [x] Ordered and unordered lists
- [ ] Add your own content

## Blockquotes

> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
>
> A second paragraph inside the same quotation.
>
> 引用中的中文段落，也應該保持清楚的層次。
>
> > Nested quotation: integer posuere erat a ante.
> > 日本語の引用文も、ここで表示を確認できます。

## Tables／表格 {#tables}

| Element | Alignment | Example |
| :--- | :---: | ---: |
| Paragraph | Left | 12 |
| **Emphasis** | Center | 128 |
| `Inline code` | Right | 1,024 |
| 中文排版 | 置中 | 256 |
| 日本語の表示 | 中央 | 512 |

## Definition lists

Lorem
: A placeholder term with a short definition.

Ipsum
: A second definition containing **bold text** and a [link](https://example.com/).

## Image and caption／圖片與說明

![綠色山丘與淺色天空 — a simple landscape](landscape.svg "山丘與日光／Hills and sunlight／丘と日差し")

## Video

影片嵌入測試：Rick Astley — [Never Gonna Give You Up](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

{{< youtube id="dQw4w9WgXcQ" title="Rick Astley — Never Gonna Give You Up" >}}

## Horizontal rule

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

---

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Footnotes

A final paragraph with a footnote reference.[^note]

[^note]: Lorem ipsum dolor sit amet. This footnote includes *emphasis* and a return link. 註腳也能混合中文與 English。日本語の注釈も追加できます。
