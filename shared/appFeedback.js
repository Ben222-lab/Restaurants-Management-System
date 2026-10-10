(function () {
    let toastRegion;

    function getToastRegion() {
        if (toastRegion && toastRegion.isConnected) {
            return toastRegion;
        }

        toastRegion = document.createElement("div");
        toastRegion.className = "app-toast-region";
        toastRegion.setAttribute("aria-live", "polite");
        toastRegion.setAttribute("aria-atomic", "false");
        document.body.appendChild(toastRegion);

        return toastRegion;
    }

    function notify(message, type) {
        const toast = document.createElement("div");
        const notificationType = type || "info";
        toast.className = "app-toast app-toast-" + notificationType;
        toast.setAttribute("role", notificationType === "error" ? "alert" : "status");

        const icon = document.createElement("span");
        icon.className = "app-toast-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = {
            success: "✓",
            error: "!",
            warning: "!",
            info: "i"
        }[notificationType] || "i";

        const text = document.createElement("p");
        text.className = "app-toast-message";
        text.textContent = String(message);

        const dismiss = document.createElement("button");
        dismiss.className = "app-toast-dismiss";
        dismiss.type = "button";
        dismiss.setAttribute("aria-label", "Dismiss notification");
        dismiss.textContent = "×";

        toast.append(icon, text, dismiss);
        getToastRegion().appendChild(toast);

        let timeoutId = window.setTimeout(removeToast, 5500);
        dismiss.addEventListener("click", removeToast);

        function removeToast() {
            window.clearTimeout(timeoutId);
            toast.classList.add("app-toast-leaving");
            toast.addEventListener("transitionend", function () {
                toast.remove();
            }, { once: true });
            window.setTimeout(function () {
                toast.remove();
            }, 250);
        }
    }

    window.AppFeedback = Object.freeze({
        notify: notify,
        success: function (message) {
            notify(message, "success");
        },
        error: function (message) {
            notify(message, "error");
        },
        warning: function (message) {
            notify(message, "warning");
        }
    });
})();
