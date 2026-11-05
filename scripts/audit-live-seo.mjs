import { writeFile } from 'node:fs/promises';

const origin = 'https://burakugurozturk.av.tr';
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'");
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1].toLowerCase(), decode(match[2])]));
const fetchPage = (url, options = {}) => fetch(url, { signal: AbortSignal.timeout(30000), ...options });

async function main() {
  const sitemapResponse = await fetchPage(`${origin}/sitemap.xml`);
  const xml = await sitemapResponse.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]));
  const articleUrls = urls.filter((url) => /\/makaleler\/[^/]+$/.test(url));
  const sample = [...new Set([
    ...['tr', 'en', 'ar'].flatMap((locale) => [`${origin}/${locale}`, `${origin}/${locale}/sss`]),
    `${origin}/tr/bolgeler/esenyurt`, `${origin}/ar/bolgeler/mimaroba`, ...articleUrls,
  ])];
  const pages = [];
  for (const url of sample) {
    const response = await fetchPage(url);
    const html = await response.text();
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => attributes(match[0]));
    const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => attributes(match[0]));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
      .map((match) => JSON.parse(match[1]));
    const article = schemas.find((schema) => schema['@type'] === 'Article');
    const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
    const ogTitle = meta.find((tag) => tag.property === 'og:title')?.content;
    const image = meta.find((tag) => tag.property === 'og:image')?.content;
    let imageResult;
    if (image && article) {
      const imageResponse = await fetchPage(image);
      const bytes = Buffer.from(await imageResponse.arrayBuffer());
      imageResult = { status: imageResponse.status, type: imageResponse.headers.get('content-type'), bytes: bytes.length,
        ...(bytes.subarray(1, 4).toString() === 'PNG' ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) } : {}) };
    }
    pages.push({ url, status: response.status, canonical: links.find((tag) => tag.rel === 'canonical')?.href,
      title, titleMatchesOg: title === ogTitle, xDefault: links.find((tag) => tag.hreflang === 'x-default')?.href,
      hsts: response.headers.get('strict-transport-security'), schemaTypes: schemas.map((schema) => schema['@type']),
      ...(article ? { datePublished: article.datePublished, dateModified: article.dateModified,
        datesConsistent: !article.datePublished || article.dateModified >= article.datePublished, image, imageResult } : {}) });
  }
  const redirects = [];
  for (const url of ['http://burakugurozturk.av.tr', `${origin}/`, 'https://www.burakugurozturk.av.tr', `${origin}/tr/`]) {
    const response = await fetchPage(url, { redirect: 'manual' });
    redirects.push({ url, status: response.status, location: response.headers.get('location') });
  }
  const result = { checkedAt: new Date().toISOString(), sitemap: { status: sitemapResponse.status, urlCount: urls.length,
    hasXhtmlAlternates: xml.includes('xhtml:link'), hasXDefault: xml.includes('hreflang="x-default"') }, pages, redirects };
  await writeFile('docs/canli-seo-kontrol.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ sitemap: result.sitemap, checkedPages: pages.length, checkedArticles: articleUrls.length,
    failedPages: pages.filter((page) => page.status !== 200 || !page.titleMatchesOg || !page.xDefault || page.datesConsistent === false || (page.imageResult && page.imageResult.status !== 200)), redirects }, null, 2));
  if (pages.some((page) => page.status !== 200 || !page.titleMatchesOg || !page.xDefault || page.datesConsistent === false ||
    (page.imageResult && page.imageResult.status !== 200))) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
