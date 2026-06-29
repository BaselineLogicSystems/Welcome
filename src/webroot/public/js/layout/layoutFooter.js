// src/assets/js/layoutFooter.js

import { AuthMock } from '../config/clientAuth.js';

export async function initFooter(config, siteseo) {

  const copyrightOwner = config.app.copyright;

  const footerEl = document.getElementById('site-footer');
  if (!footerEl) return;

  footerEl.innerHTML = `
    <p>© Copyright 2026 <a class="footer-link" style=subtle href="index.html#sendEmail">${copyrightOwner.name}</a>.  All Rights Reserved.
    <!--
    | <a class="footer-link" style=subtle href="disclaimer.html#legal">Legal Disclaimer</a>
    | <a class="footer-link" style=subtle href="disclaimer.html#policy">Privacy Policy</a></p>
    -->
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "${siteseo.ld.name}",
      "telephone": "${siteseo.ld.number}",
      "email": "${copyrightOwner.email}",
      "url": "${siteseo.ld.pageUrl}",
      "jobTitle": "${siteseo.ld.title}",
      "worksFor": {
        "@type": "Organization",
        "name": "${siteseo.ld.employment}"
      },
      "description": "${siteseo.ld.description}"
    }
    </script>
  `;

  //console.log("DEBUG :: Injecting role selector");
  // Inject the role selector into the existing footer element
  if (config.app.features.authorizationFooter) {
    AuthMock.injectRoleSelector(footerEl);
  }
}

