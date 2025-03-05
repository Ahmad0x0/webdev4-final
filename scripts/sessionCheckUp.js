document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the current user session
    const currentUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");

    if (!currentUser) {
        // No session exists, redirect to login page
        window.location.href = "login.html";
    } else {
        // Optional: Check if the session has expired (e.g., 24 hours)
        const userData = JSON.parse(currentUser);
        const now = new Date().getTime();
        const hoursSinceLogin = (now - userData.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLogin > 24) {
            localStorage.removeItem("currentUser");
            sessionStorage.removeItem("currentUser");
            window.location.href = "login.html";
        } else {
            // Session is valid; update dashboard UI if needed
            document.getElementById("usernameDisplay").textContent = userData.name;
        }
    }
});
