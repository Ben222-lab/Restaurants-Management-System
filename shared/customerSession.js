(function () {
    const CUSTOMER_KEY = "CurrentCustomer";
    const LOGIN_NOTIFICATION_KEY = "LatestCustomerLogin";

    function getCurrentCustomer() {
        const savedCustomer = localStorage.getItem(CUSTOMER_KEY);

        if (savedCustomer === null) {
            return null;
        }

        const customer = JSON.parse(savedCustomer);
        if (!customer || typeof customer.name !== "string" || typeof customer.email !== "string") {
            throw new Error("Saved customer session is invalid.");
        }

        return customer;
    }

    function recordLogin(customer) {
        const notification = {
            id: "LOGIN-" + Date.now(),
            name: customer.name,
            email: customer.email,
            loggedInAt: new Date().toLocaleString()
        };

        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
        localStorage.setItem(LOGIN_NOTIFICATION_KEY, JSON.stringify(notification));

        return notification;
    }

    function getLatestLoginNotification() {
        const savedNotification = localStorage.getItem(LOGIN_NOTIFICATION_KEY);

        if (savedNotification === null) {
            return null;
        }

        const notification = JSON.parse(savedNotification);
        if (!notification || typeof notification.id !== "string" || typeof notification.name !== "string") {
            throw new Error("Saved customer login notification is invalid.");
        }

        return notification;
    }

    function logout() {
        localStorage.removeItem(CUSTOMER_KEY);
    }

    window.CustomerSession = Object.freeze({
        getCurrentCustomer: getCurrentCustomer,
        recordLogin: recordLogin,
        getLatestLoginNotification: getLatestLoginNotification,
        logout: logout,
        notificationKey: LOGIN_NOTIFICATION_KEY
    });
})();
