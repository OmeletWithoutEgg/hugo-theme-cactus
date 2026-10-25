---
title: "MathJax examples"
date: 2024-01-01T12:00:00Z
tags: [math, mathjax]
mathjax: true
draft: false
---

Lorem ipsum dolor sit amet. This page enables MathJax in its front matter; the other sample posts do not load it.

## Inline mathematics

The identity \(e^{i\pi} + 1 = 0\) sits inside a paragraph. Subscripts and superscripts, such as \(a_n = n^2\), should remain aligned with the surrounding text.

Dollar delimiters work too: $a^2 + b^2 = c^2$.

## Display equations

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

\[
\int_0^1 x^2\,dx = \frac{1}{3}
\]

## Aligned equations

$$
\begin{aligned}
(a+b)^2 &= (a+b)(a+b) \\
        &= a^2 + 2ab + b^2
\end{aligned}
$$

## Matrices

$$
A = \begin{pmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{pmatrix},
\qquad
\mathbf{v} = \begin{bmatrix} x \\ y \\ z \end{bmatrix}
$$

## Piecewise functions

$$
|x| = \begin{cases}
 x, & x \geq 0, \\
-x, & x < 0.
\end{cases}
$$

## Sums, limits, and Greek letters

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2},
\qquad
\lim_{n\to\infty} \left(1+\frac{1}{n}\right)^n = e
$$

Inline notation: \(\alpha + \beta = \gamma\), \(\mathbb{R}\), and \(\{x \in \mathbb{Z} \mid x > 0\}\).

## TeX source stays literal inside code

```tex
\frac{a}{b} + \sqrt{c}
```
