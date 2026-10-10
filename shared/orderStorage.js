(function () {
    const STORAGE_KEY = "Orders";

    function getAll() {
        const storedOrders = localStorage.getItem(STORAGE_KEY);
        if (storedOrders === null) {
            return [];
        }

        const orders = JSON.parse(storedOrders);
        if (!Array.isArray(orders)) {
            throw new Error("Saved orders must be a list.");
        }

        return orders;
    }

    function saveAll(orders) {
        if (!Array.isArray(orders)) {
            throw new TypeError("Orders must be saved as a list.");
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }

    function updateStatus(id, status) {
        const orders = getAll();
        const order = orders.find(function (item) {
            return item.id === id;
        });

        if (!order) {
            throw new Error("The order could not be found.");
        }

        order.status = status;
        order.statusUpdatedAt = new Date().toISOString();
        saveAll(orders);

        return order;
    }

    window.OrderStorage = Object.freeze({
        getAll: getAll,
        saveAll: saveAll,
        updateStatus: updateStatus
    });
})();
