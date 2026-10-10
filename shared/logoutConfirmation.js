(function () {
    const logoutLinks = document.querySelectorAll("[data-confirm-logout]");
    if (logoutLinks.length === 0) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.className = "logout-confirmation-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <section class="logout-confirmation" role="alertdialog" aria-modal="true"
            aria-labelledby="logout-confirmation-title"
            aria-describedby="logout-confirmation-message">
            <h2 id="logout-confirmation-title">Log out?</h2>
            <p id="logout-confirmation-message">Are you sure you want to log out?</p>
            <div class="logout-confirmation-actions">
                <button type="button" data-logout-cancel>No, stay logged in</button>
                <button type="button" data-logout-confirm>Yes, log out</button>
            </div>
        </section>
    `;
    document.body.appendChild(overlay);

    let pendingLogoutUrl = "";
    const cancelButton = overlay.querySelector("[data-logout-cancel]");
    const confirmButton = overlay.querySelector("[data-logout-confirm]");

    function closeDialog() {
        overlay.hidden = true;
        pendingLogoutUrl = "";
    }

    logoutLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            pendingLogoutUrl = link.href;
            overlay.hidden = false;
            cancelButton.focus();
        });
    });

    cancelButton.addEventListener("click", closeDialog);

    confirmButton.addEventListener("click", function () {
        if (!pendingLogoutUrl) {
            return;
        }

        if (window.CustomerSession) {
            CustomerSession.logout();
        }

        window.location.href = pendingLogoutUrl;
    });

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            closeDialog();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !overlay.hidden) {
            closeDialog();
        }
    });
})();
