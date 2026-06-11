
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
