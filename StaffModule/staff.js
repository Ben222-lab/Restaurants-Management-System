const incomingOrders = document.getElementById("staff-incoming-orders");
const orderStatusBody = document.querySelector("#OrderStatus tbody");

function renderStaffOrders() {
    let orders;

    try {
        orders = OrderStorage.getAll();
    } catch (error) {
        console.error("Unable to load orders for staff:", error);
        incomingOrders.replaceChildren();
        const errorMessage = document.createElement("p");
        errorMessage.className = "empty-orders";
        errorMessage.textContent = "Unable to load incoming orders.";
        incomingOrders.appendChild(errorMessage);
        orderStatusBody.replaceChildren();
        const statusError = orderStatusBody.insertRow().insertCell();
        statusError.colSpan = 4;
        statusError.textContent = "Unable to load order statuses.";
        return;
    }

    incomingOrders.replaceChildren();
    const awaitingStaff = orders.filter(function (order) {
        return order.status === "Approved";
    });

    if (awaitingStaff.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-orders";
        emptyMessage.textContent = "No orders are awaiting staff acceptance.";
        incomingOrders.appendChild(emptyMessage);
    }

    awaitingStaff.slice().reverse().forEach(function (order) {
        const card = document.createElement("article");
        card.className = "incoming-order-card";

        const heading = document.createElement("h3");
        heading.textContent = "Order " + order.id;
        card.appendChild(heading);

        const customer = document.createElement("p");
        customer.textContent = "Customer: " + (order.customerName || order.customerEmail || "Customer");
        card.appendChild(customer);

        const summary = document.createElement("p");
        summary.textContent = (order.items || []).map(function (item) {
            return item.quantity + " × " + item.name;
        }).join(", ");
        card.appendChild(summary);

        const orderDetails = order.customerDetails || {};
        [
            ["Table", orderDetails.tableNumber],
            ["Pickup name", orderDetails.pickupName],
            ["Address / pickup location", orderDetails.address],
            ["Pickup time", orderDetails.pickupTime],
            ["Contact", orderDetails.phone],
            ["Instructions", orderDetails.instructions]
        ].forEach(function (detail) {
            if (!detail[1]) {
                return;
            }
            const paragraph = document.createElement("p");
            paragraph.textContent = detail[0] + ": " + detail[1];
            card.appendChild(paragraph);
        });

        const total = document.createElement("p");
        total.textContent = "Total: ₦" + Number(order.total || 0).toLocaleString();
        card.appendChild(total);

        const message = document.createElement("p");
        message.className = "staff-order-approved-message";
        message.textContent = "Approved by admin — accept this order to begin preparation.";
        card.appendChild(message);

        const actions = document.createElement("div");
        actions.className = "staff-order-actions";
        [
            ["Accept order", "Accepted", "accept-order"],
            ["Decline", "Declined", "decline-order"]
        ].forEach(function (action) {
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.orderId = order.id;
            button.dataset.orderStatus = action[1];
            button.className = action[2];
            button.textContent = action[0];
            actions.appendChild(button);
        });
        card.appendChild(actions);
        incomingOrders.appendChild(card);
    });

    orderStatusBody.replaceChildren();
    const trackedOrders = orders.filter(function (order) {
        return order.status !== "Declined";
    }).slice().reverse();

    if (trackedOrders.length === 0) {
        const emptyRow = orderStatusBody.insertRow();
        const emptyCell = emptyRow.insertCell();
        emptyCell.colSpan = 4;
        emptyCell.className = "empty-orders";
        emptyCell.textContent = "No customer orders yet.";
        return;
    }

    trackedOrders.forEach(function (order) {
        const row = orderStatusBody.insertRow();
        const orderCell = row.insertCell();
        orderCell.textContent = order.id;
        const locationCell = row.insertCell();
        locationCell.textContent = order.orderType || "—";
        const itemsCell = row.insertCell();
        itemsCell.textContent = (order.items || []).reduce(function (count, item) {
            return count + Number(item.quantity || 0);
        }, 0) + " items";
        const statusCell = row.insertCell();
        const badge = document.createElement("span");
        badge.className = "status " + ({
            Pending: "pending",
            Approved: "accepted",
            Accepted: "preparing",
            Preparing: "preparing",
            Completed: "completed"
        }[order.status] || "pending");
        badge.textContent = order.status || "Pending";
        statusCell.appendChild(badge);
    });
}

incomingOrders.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-order-status]");
    if (!button) {
        return;
    }

    const status = button.dataset.orderStatus;
    if (status === "Declined" && !confirm("Decline this order? The customer will be notified.")) {
        return;
    }

    try {
        OrderStorage.updateStatus(button.dataset.orderId, status);
        renderStaffOrders();
        AppFeedback.notify(
            status === "Accepted" ? "Order accepted. The customer has been updated." : "Order declined.",
            status === "Accepted" ? "success" : "info"
        );
    } catch (error) {
        console.error("Unable to update order status:", error);
        AppFeedback.notify("The order status could not be updated.", "error");
    }
});

window.addEventListener("storage", function (event) {
    if (event.key === "Orders" || event.key === null) {
        renderStaffOrders();
    }
});

renderStaffOrders();


// =============================
// MANAGE TABLES
// =============================

const tableCards = document.querySelectorAll(".table-card");

tableCards.forEach(function (table) {

    const statusBadge = table.querySelector(".status-badge");
    const buttons = table.querySelectorAll(".action-btn");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const buttonText = button.innerText;

            // Occupy Table
            if (buttonText === "Occupy Table") {

                table.classList.remove("available", "reserved");
                table.classList.add("occupied");

                statusBadge.innerText = "Occupied";

                statusBadge.classList.remove("available", "reserved");
                statusBadge.classList.add("occupied");

                button.innerText = "Clear Table";

                AppFeedback.notify("Table is now occupied.");
            }


            // Clear Table
            else if (buttonText === "Clear Table") {

                table.classList.remove("occupied", "reserved");
                table.classList.add("available");

                statusBadge.innerText = "Available";

                statusBadge.classList.remove("occupied", "reserved");
                statusBadge.classList.add("available");

                button.innerText = "Occupy Table";

                AppFeedback.notify("Table is now available.");
            }


            // Reserve
            else if (buttonText === "Reserve") {

                table.classList.remove("available", "occupied");
                table.classList.add("reserved");

                statusBadge.innerText = "Reserved";

                statusBadge.classList.remove("available", "occupied");
                statusBadge.classList.add("reserved");

                AppFeedback.notify("Table has been reserved.");
            }


            // Seat Customer
            else if (buttonText === "Seat Customer") {

                table.classList.remove("reserved", "available");
                table.classList.add("occupied");

                statusBadge.innerText = "Occupied";

                statusBadge.classList.remove("reserved", "available");
                statusBadge.classList.add("occupied");

                AppFeedback.notify("Customer has been seated.");
            }


            // Cancel Reservation
            else if (buttonText === "Cancel") {

                table.classList.remove("reserved", "occupied");
                table.classList.add("available");

                statusBadge.innerText = "Available";

                statusBadge.classList.remove("reserved", "occupied");
                statusBadge.classList.add("available");

                AppFeedback.notify("Reservation has been cancelled.");
            }

        });

    });

});


// =============================
// CUSTOMER & BOOKINGS
// =============================

const bookingTable = document.querySelector("#CustomerBooking .Tables");

if (bookingTable) {
    const bookingBody = bookingTable.querySelector("tbody");
    const reservationsCount = document.getElementById("active-reservations-count");

    function createCell(value, strong) {
        const cell = document.createElement("td");
        const text = document.createElement(strong ? "strong" : "span");
        text.textContent = value || "—";
        cell.appendChild(text);
        return cell;
    }

    function renderReservations() {
        let reservations;

        try {
            reservations = ReservationStorage.getAll();
        } catch (error) {
            console.error("Unable to load reservations:", error);
            bookingBody.replaceChildren();
            const row = bookingBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 8;
            cell.className = "empty-reservations";
            cell.textContent = "Unable to load reservations. Please check the saved reservation data.";
            reservationsCount.textContent = "—";
            return;
        }

        bookingBody.replaceChildren();
        reservationsCount.textContent = String(reservations.filter(function (reservation) {
            return reservation.status !== "Cancelled" &&
                reservation.status !== "Seated" &&
                reservation.status !== "Declined";
        }).length);

        const staffReservations = reservations.filter(function (reservation) {
            return reservation.status !== "Declined";
        });

        if (staffReservations.length === 0) {
            const row = bookingBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 8;
            cell.className = "empty-reservations";
            cell.textContent = reservations.length === 0
                ? "No reservations have been submitted yet."
                : "No active reservations.";
            return;
        }

        staffReservations.forEach(function (reservation) {
            const row = bookingBody.insertRow();
            row.dataset.reservationId = reservation.id || "";
            const customerName = [reservation.firstName, reservation.lastName].filter(Boolean).join(" ");
            const phone = [
                reservation.contactNumber && "Contact: " + reservation.contactNumber,
                reservation.whatsappNumber && "WhatsApp: " + reservation.whatsappNumber
            ].filter(Boolean).join(" | ");
            const occasionAndSeating = [
                reservation.occasion,
                reservation.seatingPreference
            ].filter(Boolean).join(" / ");

            row.appendChild(createCell(customerName, true));
            row.appendChild(createCell(phone));
            row.appendChild(createCell(reservation.email));
            row.appendChild(createCell([reservation.date, reservation.time].filter(Boolean).join(", ")));
            row.appendChild(createCell(reservation.partySize));
            row.appendChild(createCell(occasionAndSeating));

            const statusCell = row.insertCell();
            const statusBadge = document.createElement("span");
            statusBadge.className = "status " + ({
                Pending: "pending",
                Approved: "accepted",
                Confirmed: "accepted",
                Seated: "completed",
                Cancelled: "preparing"
            }[reservation.status] || "pending");
            statusBadge.textContent = reservation.status || "Pending";
            statusCell.appendChild(statusBadge);

            const actionsCell = row.insertCell();
            if (reservation.status === "Pending") {
                actionsCell.textContent = "Awaiting admin approval";
            } else if (reservation.status === "Approved" || reservation.status === "Confirmed") {
                actionsCell.appendChild(createActionButton("Seat Customer", "Seated"));
                actionsCell.appendChild(createActionButton("Cancel", "Cancelled", true));
            }
        });
    }

    function createActionButton(label, status, outline) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "action-btn" + (outline ? " outline" : "");
        button.dataset.reservationStatus = status;
        button.textContent = label;
        return button;
    }

    bookingTable.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-reservation-status]");
        if (!button) {
            return;
        }

        const row = button.closest("tr");
        const newStatus = button.dataset.reservationStatus;
        const nextStatus = newStatus;
        if (nextStatus === "Cancelled" && !confirm("Are you sure you want to cancel this reservation?")) {
            return;
        }

        try {
            ReservationStorage.updateStatus(row.dataset.reservationId, nextStatus);
            renderReservations();
        } catch (error) {
            console.error("Unable to update reservation:", error);
            AppFeedback.notify("The reservation status could not be updated. Please try again.");
        }
    });

    window.addEventListener("storage", function (event) {
        if (event.key === "Reservations" || event.key === null) {
            renderReservations();
        }
    });

    renderReservations();
}


// =============================
// PAYMENTS
// =============================

const paymentTable = document.querySelector("#Payments .Tables");

if (paymentTable) {

    const paymentRows = paymentTable.querySelectorAll("tbody tr");

    paymentRows.forEach(function (row) {

        const buttons = row.querySelectorAll(".action-btn");

        buttons.forEach(function (button) {

            button.addEventListener("click", function () {

                const buttonText = button.innerText;

                const status = row.querySelector(".status");


                // Confirm Payment
                if (buttonText === "Confirm Payment") {

                    status.innerText = "Paid";

                    status.classList.remove("pending");
                    status.classList.add("completed");

                    button.innerText = "Paid";

                    button.disabled = true;

                    AppFeedback.notify("Payment has been confirmed.");
                }


                // Receipt
                else if (buttonText === "Receipt") {

                    const orderNumber = row.querySelector("td").innerText;

                    AppFeedback.notify(
                        "Receipt for " + orderNumber + "\n\n" +
                        "Payment has already been completed."
                    );
                }

            });

        });

    });

}


// =============================
// SMOOTH NAVIGATION
// =============================

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.forEach(function (item) {
            item.style.backgroundColor = "";
            item.style.color = "";
        });

        link.style.backgroundColor = "#E57500";
        link.style.color = "white";

    });

});

const customerLoginNotification = document.getElementById("customer-login-notification");

function showCustomerLoginNotification() {
    try {
        const notification = CustomerSession.getLatestLoginNotification();
        if (!notification) {
            customerLoginNotification.hidden = true;
            return;
        }

        customerLoginNotification.textContent =
            notification.name + " logged in as a customer at " + notification.loggedInAt + ".";
        customerLoginNotification.hidden = false;
    } catch (error) {
        console.error("Unable to load customer login notification:", error);
        customerLoginNotification.textContent = "Unable to load the latest customer login notification.";
        customerLoginNotification.hidden = false;
    }
}

window.addEventListener("storage", function (event) {
    if (event.key === CustomerSession.notificationKey || event.key === null) {
        showCustomerLoginNotification();
    }
});

showCustomerLoginNotification();

const reservationApprovalNotification = document.getElementById("reservation-approval-notification");

function showReservationApprovalNotification() {
    try {
        const latestApproval = ReservationStorage.getAll()
            .filter(function (reservation) {
                return reservation.status === "Approved" || reservation.status === "Confirmed";
            })
            .sort(function (first, second) {
                return (second.statusUpdatedAt || "").localeCompare(first.statusUpdatedAt || "");
            })[0];

        if (!latestApproval) {
            reservationApprovalNotification.hidden = true;
            return;
        }

        const customerName = [latestApproval.firstName, latestApproval.lastName].filter(Boolean).join(" ");
        reservationApprovalNotification.textContent =
            "Reservation approved for " + (customerName || latestApproval.email) +
            (latestApproval.date ? " on " + latestApproval.date : "") +
            (latestApproval.time ? " at " + latestApproval.time : "") + ".";
        reservationApprovalNotification.hidden = false;
    } catch (error) {
        console.error("Unable to load reservation approval notice:", error);
        reservationApprovalNotification.textContent = "Unable to load reservation approval notices.";
        reservationApprovalNotification.hidden = false;
    }
}

window.addEventListener("storage", function (event) {
    if (event.key === "Reservations" || event.key === null) {
        showReservationApprovalNotification();
    }
});

showReservationApprovalNotification();


// =============================
// LOGOUT
// =============================
