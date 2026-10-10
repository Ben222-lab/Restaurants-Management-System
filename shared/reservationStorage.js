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

    window.ReservationStorage = Object.freeze({
        getAll: getAll,
        saveAll: saveAll,
        updateStatus: updateStatus
    });
})();
