// Where the interface keeps an access token, and how it sends one.
//
// Its own module so the login page and the interface cannot disagree about
// the key, and so there is exactly one place that decides a token goes in a
// header and never in a URL (PRD §16.1: never logged, never in a URL).
/** Key the token is stored under, for this tab only. */
export const TOKEN_KEY = "assemblash.token";
/** The token this browser has, if any. */
export function storedToken() {
    try {
        return sessionStorage.getItem(TOKEN_KEY);
    }
    catch {
        // Storage can be disabled. A server that needs a token will then 401 and
        // the login page will ask again, which is annoying but not broken.
        return null;
    }
}
/** Forgets the token, after the server rejects it. */
export function forgetToken() {
    try {
        sessionStorage.removeItem(TOKEN_KEY);
    }
    catch {
        // Nothing to forget if storage is unavailable.
    }
}
/** Adds the token to a request's headers, when there is one. */
export function withToken(headers = {}) {
    const token = storedToken();
    if (!token)
        return headers;
    return { ...headers, authorization: `Bearer ${token}` };
}
/** Sends the browser to the login page, remembering nothing. */
export function goToLogin() {
    forgetToken();
    if (window.location.pathname !== "/login.html") {
        window.location.replace("/login.html");
    }
}
