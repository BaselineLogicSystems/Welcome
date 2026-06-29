// src/assets/js/book.js
import { loadConfig } from '../config/clientConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
  const config = await loadConfig();

  // const pageCfg = config.app?.pages?.['index'];
  const contentPath = `content/book.json`;

    fetch(contentPath)
        .then(response => response.json())
        .then(data => {
            const galleryTable = document.getElementById('headline-table');

            data.stories.forEach((item, index) => {

                // Only include stories that are "published" or enabled.
                if (item.enabled !== false) {
                    const storyRow = document.createElement('tr');

                    // CASE 1: No image provided - Use full width
                    if (!item.storyImage) {
                        storyRow.innerHTML = `
                                <td colspan="3" class="story-text">
                                    <div class="card">
                                        <h3 class="role-title" id="${item.section}">${item.title}</h3>
                                        <p>${item.message}</p>
                                        <p><a href="${item.linkAddress}">${item.linkText || "Learn More ->"}</a></p>
                                    </div>
                                </td>`;
                    } else {
                        // CASE 2: Image exists - use existing alternating layout
                        const textCell = `
                                <td colspan="2" class="story-text">
                                    <div class="card">
                                        <h3 class="role-title" id="${item.section}">${item.title}</h3>
                                        <p>${item.message}</p>
                                        <p><a href="${item.linkAddress}">${item.linkText || "Learn More ->"}</a></p>
                                    </div>
                                </td>`;

                        const imageCell = `
                                <td class="story-image-cell">
                                    <div class="image-container">
                                        <img src="images/${item.storyImage}" alt="">
                                    </div>
                                </td>`;

                        storyRow.innerHTML = (index % 2 === 0)
                            ? textCell + imageCell
                            : imageCell + textCell;
                    }

                    galleryTable.appendChild(storyRow);
                }
            });
        })
        .catch(error => console.error('ERROR :: Error fetching data:', error));
});
