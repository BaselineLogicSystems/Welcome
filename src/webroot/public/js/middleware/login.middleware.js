
import { createClient } from 'redis';
import { logger } from "./logger.js";
import { SERVER_CONFIG } from '../config/serverEnv.js';
import { ROLES, ROLE_HIERARCHY, getRoleFromCookie } from "../components/authServer.js";

// Initialize Redis client lazily
let redisClient = null;
async function getRedis() {
    if (!SERVER_CONFIG.FEATURES.ENABLE_DB_REDIS) return null;
    if (!redisClient) {
        redisClient = createClient({ url: SERVER_CONFIG.URLS.DB_REDIS_SERVER });
        await redisClient.connect();
    }
    return redisClient;
}

/**
 * Enhanced helper to resolve roles based on environment flags
 */
export async function getUserRole(req) {
    // 1. Production Path: Check Redis cache first
    if (SERVER_CONFIG.FEATURES.ENABLE_DB_REDIS) {
        const client = await getRedis();
        const userId = req.session?.userId || req.headers['x-user-id']; // Assume ID is passed via session/header
        if (userId) {
            const role = await client.get(`user:role:${userId}`);
            if (role) return role;
        }
    }  else {

        // 2. Local/Mock Path: Fallback to cookie-based roles
        return getRoleFromCookie(req);
    }
}

/**
 * Middleware to verify if the user has at least the required role
 */
export function authorize(requiredRole) {
    return async (req, res, next) => {
        try {
            const userRole = await getUserRole(req);
            const userLevel = ROLE_HIERARCHY[userRole] || ROLE_HIERARCHY[ROLES.PUBLIC];
            const requiredLevel = ROLE_HIERARCHY[requiredRole];

            if (userLevel >= requiredLevel) {
                next();
            } else {
                res.status(403).json({
                    error: 'Forbidden',
                    message: `This action requires ${requiredRole} permissions or higher.`
                });
            }
        } catch (err) {
            // TODO - improve error handling
            logger.error({ err }, 'Critical error in authorization.');
            throw err;
        }
    };
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
