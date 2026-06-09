
export const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    CONTRIBUTOR: 'Contributor',
    PUBLIC: 'Public'
};

export const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: 4,
    [ROLES.MANAGER]: 3,
    [ROLES.CONTRIBUTOR]: 2,
    [ROLES.PUBLIC]: 1
};

/**
 * Simple helper to parse cookies from the request header
 */
export function getRoleFromCookie(req) {
    const cookies = req.headers.cookie || '';
    const roleCookie = cookies.split('; ')
        .find(row => row.startsWith('user_role='));

    if (roleCookie) {
        return roleCookie.split('=')[1];
    }
    return ROLES.PUBLIC;
}

/**
 * Mock Auth Component for development
 */
export const AuthMock = {
    setRole(role) {
        document.cookie = `user_role=${role}; path=/; max-age=86400`;
        console.debug(`Current role set to: ${role}`);
        location.reload(); // Reload to update UI state
    },
    getRole() {
        const cookies = document.cookie.split('; ');
        const roleCookie = cookies.find(row => row.startsWith('user_role='));
        return roleCookie ? roleCookie.split('=')[1] : 'Public';
    },

    injectRoleSelector(container) {
        console.debug (`Injecting AuthMock in footer: ${container}`)
        if (!container) return;
        const selectorDiv = document.createElement('div');
        selectorDiv.style.cssText = 'margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 0.8rem; color: #666;';

        const roles = ['Public', 'Contributor', 'Manager', 'Admin'];
        let selectHtml = `<span style="margin-right: 5px;">Mock User Role: </span><select id="roleSelector">`;
        roles.forEach(r => {
            const selected = this.getRole() === r ? 'selected' : '';
            selectHtml += `<option value="${r}" ${selected}>${r}</option>`;
        });
        selectHtml += `</select>`;

        selectorDiv.innerHTML = selectHtml;
        container.appendChild(selectorDiv);
        document.getElementById('roleSelector').addEventListener('change', (e) => {
            this.setRole(e.target.value);
        });
    }
};
