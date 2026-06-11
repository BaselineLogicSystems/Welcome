// src/assets/js/layoutNav.js
export async function initNav(config, page) {

  const navEl = document.getElementById('site-nav');
  if (!navEl) return;

  const imageFile = `images/${config.app.image?.imageFile}` || '';
  const imageAlt = `${config.app.image?.caption}` || '';
  const imgDiv = document.createElement('div');
  imgDiv.innerHTML = `<img class="center" src="${imageFile}" alt="${imageAlt}" />`;
  navEl.appendChild(imgDiv);

  const pages = Object.entries(config.app.pages)
    .filter(([, cfg]) => cfg.enabled !== false && cfg.indexed !== false) // skip disabled
    .map(([name, cfg]) => ({ name, title: cfg.title, link: cfg.link }));

  const ul = document.createElement('ul');
  pages.forEach(p => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = p.link;
    a.textContent = p.title;
    li.appendChild(a);
    ul.appendChild(li);
  });

  navEl.appendChild(ul);
}
