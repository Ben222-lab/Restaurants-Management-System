(function () {
    const toggles = document.querySelectorAll("[data-navigation-toggle]");

    function setExpanded(toggle, expanded) {
        const navigation = document.getElementById(toggle.getAttribute("aria-controls"));
        const container = toggle.closest("[data-responsive-navigation]");
        if (!navigation || !container) {
            throw new Error("Responsive navigation is missing its controlled menu or container.");
        }

        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.setAttribute("aria-label", expanded ? "Close navigation menu" : "Open navigation menu");
        const icon = toggle.querySelector("[aria-hidden='true']");
        if (icon) {
            icon.textContent = icon.classList.contains("material-symbols-outlined")
                ? (expanded ? "close" : "menu")
                : (expanded ? "×" : "☰");
        }
        container.classList.toggle("navigation-open", expanded);
    }

    toggles.forEach(function (toggle) {
        const navigation = document.getElementById(toggle.getAttribute("aria-controls"));
        if (!navigation) {
            throw new Error("Responsive navigation target was not found.");
        }

        toggle.addEventListener("click", function () {
            setExpanded(toggle, toggle.getAttribute("aria-expanded") !== "true");
        });

        navigation.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                setExpanded(toggle, false);
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }

        toggles.forEach(function (toggle) {
            if (toggle.getAttribute("aria-expanded") === "true") {
                setExpanded(toggle, false);
                toggle.focus();
            }
        });
    });
})();
