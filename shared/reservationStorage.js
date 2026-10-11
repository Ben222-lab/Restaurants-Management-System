(function () {
    const STORAGE_KEY = "Reservations";

    function getAll() {
        const storedReservations = localStorage.getItem(STORAGE_KEY);

        if (storedReservations === null) {
            return [];
        }

        const reservations = JSON.parse(storedReservations);

        if (!Array.isArray(reservations)) {
            throw new Error("Saved reservations must be a list.");
        }

        return reservations;
    }

    function saveAll(reservations) {
        if (!Array.isArray(reservations)) {
            throw new TypeError("Reservations must be saved as a list.");
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    }

    function updateStatus(id, status) {
        const reservations = getAll();
        const reservation = reservations.find(function (item) {
            return item.id === id;
        });

        if (!reservation) {
            throw new Error("The reservation could not be found.");
        }

        reservation.status = status;
        reservation.statusUpdatedAt = new Date().toISOString();
        saveAll(reservations);

        return reservation;
    }

    function updateDetails(id, details) {
        const reservations = getAll();
        const reservation = reservations.find(function (item) {
            return item.id === id;
        });

        if (!reservation) {
            throw new Error("The reservation could not be found.");
        }

        Object.assign(reservation, details, {
            statusUpdatedAt: new Date().toISOString()
        });
        saveAll(reservations);

        return reservation;
    }

    function remove(id) {
        const reservations = getAll();
        const remainingReservations = reservations.filter(function (item) {
            return item.id !== id;
        });

        if (remainingReservations.length === reservations.length) {
            throw new Error("The reservation could not be found.");
        }

        saveAll(remainingReservations);
    }

    window.ReservationStorage = Object.freeze({
        getAll: getAll,
        saveAll: saveAll,
        updateStatus: updateStatus,
        updateDetails: updateDetails,
        remove: remove
    });
})();
