// Browser authentication uses a host-only, HttpOnly session cookie.
// A rejected request returns to the login page.
export function goToLogin() {
    if (window.location.pathname !== "/login.html") {
        window.location.replace("/login.html");
    }
}
