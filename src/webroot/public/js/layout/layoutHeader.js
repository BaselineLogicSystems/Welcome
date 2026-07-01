// src/assets/js/layoutHeader.js

export async function initHeader(config, page, siteseo) {

  const headerEl = document.getElementById('site-header');
  // console.log (`DEBUG :: Header received page ${page}`);

  if (!headerEl) return;
  // console.log (`DEBUG :: Header image: ${config.app.image?.imageFile || ""}`);
  // console.log (`DEBUG :: Siteseo specific stylesheet: ${siteseo.stylesheet}`);

  headerEl.innerHTML = `
    <link rel="icon" href="${siteseo.favicon}" type="image/png">
    <link rel="stylesheet" href="../css/main.css" />

    <!-- SEO Optimization -->
    <meta name="description" content="${siteseo.ld.description}">
    <meta name="keywords" content="${siteseo.ld.keywords}">

    <!-- Open Graph -->
    <meta property="og:type" content="${siteseo.og.type}">
    <meta property="og:title" content="${siteseo.og.title}">
    <meta property="og:description" content="${siteseo.og.description}">
    <meta property="og:url" content="${siteseo.ld.pageUrl}">
    <meta property="og:image" content="${siteseo.og.image}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="${siteseo.twitter.card}">
    <meta name="twitter:title" content="${siteseo.twitter.title}">
    <meta name="twitter:description" content="${siteseo.twitter.description}">
    <meta name="twitter:image" content="${siteseo.twitter.image}">

    <!-- Canonical URL -->
    <link rel="canonical" href="${siteseo.ld.pageUrl}">

    <!-- Viewport for mobile friendliness -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
  `;
}
