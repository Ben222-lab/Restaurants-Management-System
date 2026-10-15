(function () {
    let toastRegion;

    function getToastRegion() {
        if (!toastRegion || !toastRegion.isConnected) {
            toastRegion = document.createElement("div");
            toastRegion.className = "app-toast-region";
            toastRegion.setAttribute("aria-live", "polite");
            toastRegion.setAttribute("aria-atomic", "false");
            document.body.appendChild(toastRegion);
        }

        return toastRegion;
    }

    function showMessage(message, type) {
        const icons = {
            success: "✓",
            error: "!",
            warning: "!",
            info: "i"
        };

        const toast = document.createElement("div");
        toast.className = "app-toast app-toast-" + type;
        toast.setAttribute("role", type === "error" ? "alert" : "status");

        const icon = document.createElement("span");
        icon.className = "app-toast-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = icons[type] || icons.info;

        const text = document.createElement("p");
        text.className = "app-toast-message";
        text.textContent = String(message);

        const closeButton = document.createElement("button");
        closeButton.className = "app-toast-dismiss";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Dismiss notification");
        closeButton.textContent = "×";

        toast.append(icon, text, closeButton);
        getToastRegion().appendChild(toast);

        function removeMessage() {
            if (toast.classList.contains("app-toast-leaving")) {
                return;
            }

            toast.classList.add("app-toast-leaving");
            window.setTimeout(function () {
                toast.remove();
            }, 200);
        }

        closeButton.addEventListener("click", removeMessage);
        window.setTimeout(removeMessage, 5500);
    }

    window.AppFeedback = {
        notify: function (message, type) {
            showMessage(message, type || "info");
        },
        success: function (message) {
            showMessage(message, "success");
        },
        error: function (message) {
            showMessage(message, "error");
        },
        warning: function (message) {
            showMessage(message, "warning");
        }
    };
})();
