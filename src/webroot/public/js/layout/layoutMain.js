// src/assets/js/layoutMain.js

/*
 * Important:  This must be set in html pages before calling layoutMain.js:
 *   <script>
 *    // Make the current environment available to the client
 *    window.__NODE_ENV__ = '<%= process.env.NODE_ENV %>'; // will be rendered by Express
 *  </script>
 *
 */

import { loadConfig, loadSiteData } from '../config/clientConfig.js';
import { initHeader } from './layoutHeader.js';
import { initNav } from './layoutNav.js';
import { initFooter } from './layoutFooter.js';

// Initialize the common page components
async function initPage() {
  // console.debug ('Initializing page in layoutMain');
  const config = await loadConfig();
  const siteseo = await loadSiteData();

  const pageAddress = document.body.dataset.page || 'index';
  const pageName = pageAddress.replace(/\.html$/, '');
  const page = config.app.pages[pageName] ?? {};

  // console.debug (`Loading layout for page: ${pageName}`);

  // Pass the parsed config to each part
  await Promise.all([
    initHeader(config, page, siteseo),
    initNav(config),
    initFooter(config, siteseo)
  ]);
}

// Initialize and hook everything up on DOMContentLoaded
initPage().catch(err => console.error(err));

document.addEventListener('DOMContentLoaded', () => {

});
