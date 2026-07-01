/**
 * results.js - Handles the display of survey results with pagination
 */

const CONFIG = {
    API_ENDPOINT: '/api/survey',
    ITEMS_PER_PAGE: 10,
};

let state = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
};

/**
 * Fetches survey data from the API based on current page and limit.
 */
async function fetchSurveyResults() {
    try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}?page=${state.currentPage}&limit=${CONFIG.ITEMS_PER_PAGE}`);
        if (!response.ok) throw new Error('Failed to fetch survey results');

        const result = await response.json();

        state.totalItems = result.total;
        state.totalPages = Math.ceil(result.total / CONFIG.ITEMS_PER_PAGE);

        return result.data;
    } catch (error) {
        console.error('Error fetching survey results:', error);
        alert('An error occurred while loading the survey results.');
        return [];
    }
}

/**
 * Renders the list of survey entries into a table.
 */
function renderResults(data) {
    const container = document.getElementById('survey-results');
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = '<p class="no-results">No survey results found.</p>';
        return;
    }

    // Create table headers based on the first item's keys (excluding MongoDB internals)
    const keys = Object.keys(data[0]).filter(k => k !== '_id' && k !== '__v');

    let html = `
        <div class="results-table-wrapper">
            <table class="survey-results-table">
                <thead>
                    <tr>
                        ${keys.map(key => `<th>${key.toUpperCase()}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            ${keys.map(key => `<td>${escapeHtml(String(item[key] || ''))}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Renders the pagination controls with arrow icons.
 */
function renderPagination() {
    const container = document.getElementById('pagination-controls');
    if (!container) return;

    const isFirstPage = state.currentPage === 1;
    const isLastPage = state.currentPage === state.totalPages || state.totalPages === 0;

    container.innerHTML = `
        <div class="pagination">
            <button ${isFirstPage ? 'disabled' : ''} id="btn-first" title="First Page">«</button>
            <button ${isFirstPage ? 'disabled' : ''} id="btn-prev" title="Previous Page">‹</button>
            <span class="page-info">Page ${state.currentPage} of ${state.totalPages || 1}</span>
            <button ${isLastPage ? 'disabled' : ''} id="btn-next" title="Next Page">›</button>
            <button ${isLastPage ? 'disabled' : ''} id="btn-last" title="Last Page">»</button>
        </div>
    `;

    // Attach event listeners to buttons
    document.getElementById('btn-first')?.addEventListener('click', () => goToPage(1));
    document.getElementById('btn-prev')?.addEventListener('click', () => goToPage(state.currentPage - 1));
    document.getElementById('btn-next')?.addEventListener('click', () => goToPage(state.currentPage + 1));
    document.getElementById('btn-last')?.addEventListener('click', () => goToPage(state.totalPages));
}

/**
 * Updates the current page and refreshes the display.
 */
async function goToPage(page) {
    if (page < 1 || page > state.totalPages) return;

    state.currentPage = page;
    const data = await fetchSurveyResults();
    renderResults(data);
    renderPagination();
}

/**
 * Simple helper to escape HTML and prevent XSS.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initializes the results page.
 */
async function init() {
    // Ensure we have a container for pagination if not in HTML
    if (!document.getElementById('pagination-controls')) {
        const pagDiv = document.createElement('div');
        pagDiv.id = 'pagination-controls';
        const resultsContainer = document.getElementById('survey-results');
        if (resultsContainer) {
            resultsContainer.parentNode.insertBefore(pagDiv, resultsContainer.nextSibling);
        }
    }

    const data = await fetchSurveyResults();
    renderResults(data);
    renderPagination();
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
