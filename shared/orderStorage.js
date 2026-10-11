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

    function renameMenuItem(menuItemId, previousName, newName, renameLegacyItems) {
        if (!menuItemId || !previousName || !newName) {
            throw new TypeError("A menu item ID and both names are required.");
        }

        const orders = getAll();
        let changed = false;
        orders.forEach(function (order) {
            (order.items || []).forEach(function (item) {
                const matchesMenuItem = item.menuItemId === menuItemId;
                const matchesLegacyName = renameLegacyItems && !item.menuItemId &&
                    item.name === previousName;
                if (matchesMenuItem || matchesLegacyName) {
                    item.name = newName;
                    if (matchesLegacyName) {
                        item.menuItemId = menuItemId;
                    }
                    changed = true;
                }
            });
        });

        if (changed) {
            saveAll(orders);
        }
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

    function updatePaymentStatus(id, status, method) {
        const orders = getAll();
        const order = orders.find(function (item) {
            return item.id === id;
        });

        if (!order) {
            throw new Error("The order could not be found.");
        }

        order.paymentStatus = status;
        order.paymentMethod = method || order.paymentMethod || "";
        order.paymentUpdatedAt = new Date().toISOString();
        saveAll(orders);

        return order;
    }

    window.OrderStorage = Object.freeze({
        getAll: getAll,
        saveAll: saveAll,
        renameMenuItem: renameMenuItem,
        updateStatus: updateStatus,
        updatePaymentStatus: updatePaymentStatus
    });
})();
