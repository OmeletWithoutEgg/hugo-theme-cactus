// Run from the theme root with npm run test:browser (Hugo and Dart Sass required).
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const puppeteer = require('puppeteer');

const theme = path.resolve(__dirname, '..');
const prefix = '/preview/';
const selectors = {
  menu: '.mobile-menu-toggle',
  toc: '.mobile-toc-toggle',
  share: '[aria-controls="mobile-share-panel"]',
};

async function createFixture(directory) {
  const posts = path.join(directory, 'content/posts');
  await fs.mkdir(posts, { recursive: true });
  await fs.writeFile(path.join(directory, 'hugo.toml'), `
locale = "en-us"
title = "Navigation test"
[params]
  colortheme = "dark"
  showReadTime = true
[params.comments]
  enabled = false
[[menus.main]]
  name = "Home"
  url = "/preview/"
[[menus.main]]
  name = "Posts"
  url = "/preview/posts/"
[markup.tableOfContents]
  startLevel = 2
  endLevel = 4
`);
  const paragraph = '閱讀測試。 This paragraph makes the article long enough to exercise scrolling, while keeping the fixture independent of any real blog.\n\n';
  for (const [slug, day, body] of [
    ['first', 1, 'The first article has no table of contents.'],
    ['middle', 2, `## Introduction\n\n${paragraph.repeat(30)}## Details\n\n${paragraph.repeat(30)}`],
    ['last', 3, 'The last article has no table of contents.'],
  ]) {
    await fs.writeFile(path.join(posts, `${slug}.md`), `---\ntitle: ${slug}\ndate: 2024-01-0${day}\nauthor: Test Author\n---\n\n${body}\n`);
  }
}

async function serve(root) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
  const server = http.createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith(prefix)) throw new Error('Outside preview');
      if (pathname.endsWith('/')) pathname += 'index.html';
      const file = path.resolve(root, pathname.slice(prefix.length));
      if (!file.startsWith(root + path.sep)) throw new Error('Outside build');
      const body = await fs.readFile(file);
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

async function checkNavigation(page, baseURL) {
  const hidden = selector => page.$eval(selector, element => element.hidden);
  const expanded = selector => page.$eval(selector, element => element.getAttribute('aria-expanded'));
  const focused = selector => page.$eval(selector, element => document.activeElement === element);
  async function go(width, slug = 'middle') {
    await page.setViewport({ width, height: 900 });
    await page.goto(baseURL + (slug ? `posts/${slug}/` : ''), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
  }
  async function scrollTo(y) {
    await page.evaluate(target => new Promise(resolve => {
      if (scrollY === target) { resolve(); return; }
      window.addEventListener('scroll', () => requestAnimationFrame(resolve), { once: true });
      window.scrollTo(0, target);
    }), y);
  }
  async function escapePanel(button, panel) {
    await page.keyboard.press('Escape');
    assert(await hidden(panel));
    assert.equal(await expanded(button), 'false');
    assert(await focused(button));
  }

  await go(390);
  assert(await page.$eval('.mobile-top', element => element.disabled));
  for (const [name, button] of Object.entries(selectors)) {
    const panel = `#mobile-${name}-panel`;
    await page.click(button);
    assert.equal(await hidden(panel), false);
    assert.equal(await expanded(button), 'true');
    assert(await page.$eval(panel, element => element.contains(document.activeElement)));
    await escapePanel(button, panel);
    await page.click(button);
    await page.click(button);
    assert(await hidden(panel), 'Repeated click closes the panel');
  }

  await page.click(selectors.menu);
  await page.click(selectors.share);
  assert(await hidden('#mobile-menu-panel'));
  assert.equal(await hidden('#mobile-share-panel'), false);
  await page.click('.post-title');
  assert(await hidden('#mobile-share-panel'));

  await page.click(selectors.toc);
  await page.click('#mobile-toc-panel a');
  assert(await hidden('#mobile-toc-panel'));
  assert(await page.evaluate(() => /^H[1-6]$/.test(document.activeElement.tagName)));

  await scrollTo(2000);
  await page.waitForFunction(() => document.querySelector('.reading-toolbar').classList.contains('scroll-hidden'));
  await scrollTo(1990);
  await page.waitForFunction(() => !document.querySelector('.reading-toolbar').classList.contains('scroll-hidden'));
  await page.click(selectors.menu);
  await scrollTo(2100);
  await page.waitForFunction(() => scrollY === 2100);
  assert.equal(await page.$eval('.reading-toolbar', element => element.classList.contains('scroll-hidden')), false);
  await escapePanel(selectors.menu, '#mobile-menu-panel');
  await page.click('.mobile-top');
  await page.waitForFunction(() => scrollY === 0 && document.querySelector('.mobile-top').disabled);

  const toolbarPositions = () => page.$$eval('.toolbar-actions > button', buttons => buttons.map(button => {
    const { x, y, width, height } = button.getBoundingClientRect();
    return { x, y, width, height };
  }));
  const withTOC = await toolbarPositions();
  await go(390, 'first');
  assert.deepEqual(await toolbarPositions(), withTOC, 'Missing TOC must not move the toolbar buttons');
  assert.equal(await page.$('.toolbar-article-slot:first-child a'), null);
  await page.click(selectors.toc);
  assert.equal(await page.$eval('.panel-empty', element => element.textContent), 'No table of contents');
  assert(await focused('.panel-empty'));
  await escapePanel(selectors.toc, '#mobile-toc-panel');
  await Promise.all([page.waitForNavigation(), page.click('.toolbar-article-slot:last-child a')]);
  assert.equal(new URL(page.url()).pathname, prefix + 'posts/middle/');
  await go(390, 'last');
  assert.equal(await page.$('.toolbar-article-slot:last-child a'), null);
  assert.deepEqual(await toolbarPositions(), withTOC);

  await go(1000);
  assert(await hidden('.reading-toc'));
  await page.click('.medium-toc-toggle');
  assert.equal(await hidden('.reading-toc'), false);
  await escapePanel('.medium-toc-toggle', '.reading-toc');
  await page.click('.medium-toc-toggle');
  await page.click('.floating-share summary');
  assert(await hidden('.reading-toc'));
  assert(await page.$eval('.floating-share', element => element.open));
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('.floating-share', element => element.open), false);
  assert(await focused('.floating-share summary'));
  await scrollTo(2000);
  await page.waitForFunction(() => !document.querySelector('.reading-top').hidden);
  await page.click('.reading-top');
  await page.waitForFunction(() => scrollY === 0 && document.querySelector('.reading-top').hidden);

  await go(1440);
  await page.click('.floating-menu summary');
  await page.keyboard.press('Escape');
  assert.equal(await hidden('.reading-toc'), false, 'Wide TOC is permanent');
  assert.equal(await page.$eval('.floating-menu', element => element.open), false);
  assert(await focused('.floating-menu summary'));
  await page.click('.floating-share summary');
  await page.click('.post-title');
  assert.equal(await page.$eval('.floating-share', element => element.open), false);

  for (const width of [390, 799, 800, 1000, 1279, 1280, 1440, 390]) {
    await page.setViewport({ width, height: 900 });
    await page.waitForFunction(mobile => {
      const toc = document.querySelector('.reading-toc');
      return mobile ? !!toc.closest('#mobile-toc-panel') : !!toc.closest('.reading-grid');
    }, {}, width < 800);
    assert.equal(await page.$$eval('.reading-toc', elements => elements.length), 1);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }

  await go(390, '');
  await page.click('#header #nav .icon a');
  assert(await page.$eval('#header #nav ul', element => element.classList.contains('responsive')));
  assert.equal(await expanded('#header #nav .icon a'), 'true');
  await page.click('#header #nav .icon a');
  assert.equal(await expanded('#header #nav .icon a'), 'false');
}

async function main() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cactus-browser-'));
  let server, browser, page;
  try {
    await createFixture(directory);
    const output = path.join(directory, 'public');
    server = await serve(output);
    const origin = `http://127.0.0.1:${server.address().port}`;
    const baseURL = origin + prefix;
    execFileSync('hugo', ['--source', directory, '--themesDir', path.dirname(theme), '--theme', path.basename(theme),
      '--destination', output, '--baseURL', baseURL, '--minify', '--panicOnWarning'], { stdio: 'pipe' });
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.CHROME_NO_SANDBOX === '1' ? ['--no-sandbox'] : [],
    });
    page = await browser.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (new URL(request.url()).origin === origin) request.continue();
      else { errors.push(`Unexpected external request: ${request.url()}`); request.abort(); }
    });
    await page.evaluateOnNewDocument(() => localStorage.setItem('bganim-enabled', 'false'));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await checkNavigation(page, baseURL);
    assert.deepEqual(errors, []);
    for (const extension of ['png', 'html']) {
      await fs.rm(path.join(theme, 'test-results', `reading-layout-failure.${extension}`), { force: true });
    }
    console.log('PASS: mobile/desktop navigation, TOC, focus, scroll, Top, adjacent articles and resize boundaries');
  } catch (error) {
    const artifacts = path.join(theme, 'test-results');
    await fs.mkdir(artifacts, { recursive: true });
    if (page) {
      await page.screenshot({ path: path.join(artifacts, 'reading-layout-failure.png') });
      await fs.writeFile(path.join(artifacts, 'reading-layout-failure.html'), await page.content());
    }
    console.error(`Browser failure artifacts: ${artifacts}`);
    throw error;
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    await fs.rm(directory, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
