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
        const payment = document.createElement("p");
        payment.textContent = "Payment: " + (order.paymentStatus || "Pending");
        card.appendChild(payment);

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
        renderPayments();
    }
});

renderStaffOrders();


// =============================
// MANAGE TABLES
// =============================

const managedTablesKey = "ManagedTables";
const staffTableGrid = document.getElementById("staff-table-grid");
const defaultStaffTables = [
    { id: "TABLE-1", name: "Table 1", capacity: 2, status: "Available" },
    { id: "TABLE-2", name: "Table 2", capacity: 4, status: "Occupied" },
    { id: "TABLE-3", name: "Table 3", capacity: 6, status: "Reserved" },
    { id: "TABLE-4", name: "Table 4", capacity: 2, status: "Available" }
];

function getManagedTables() {
    const savedTables = localStorage.getItem(managedTablesKey);
    if (savedTables === null) {
        localStorage.setItem(managedTablesKey, JSON.stringify(defaultStaffTables));
        return defaultStaffTables.map(function (table) {
            return Object.assign({}, table);
        });
    }

    const tables = JSON.parse(savedTables);
    if (!Array.isArray(tables)) {
        throw new Error("Saved restaurant tables must be a list.");
    }
    return tables.map(function (table) {
        const legacyCapacity = ({ "TABLE-1": 2, "TABLE-2": 4, "TABLE-3": 6, "TABLE-4": 2 })[table.id];
        return Object.assign({}, table, {
            capacity: Number(table.capacity) || legacyCapacity || 0
        });
    });
}

function renderManagedTables() {
    staffTableGrid.replaceChildren();
    try {
        getManagedTables().forEach(function (table) {
            const status = table.status;
            if (!table.id || !table.name || !["Available", "Occupied", "Reserved"].includes(status)) {
                throw new Error("A restaurant table has invalid saved details.");
            }

            const card = document.createElement("article");
            card.className = "table-card " + status.toLowerCase();
            const header = document.createElement("div");
            header.className = "table-header";
            const heading = document.createElement("h3");
            heading.textContent = table.name;
            const badge = document.createElement("span");
            badge.className = "status-badge " + status.toLowerCase();
            badge.textContent = status;
            header.append(heading, badge);

            const capacity = document.createElement("p");
            capacity.textContent = Number(table.capacity) > 0
                ? "Capacity: " + table.capacity + " Seats"
                : "Capacity not set";
            const actions = document.createElement("div");
            actions.className = "table-actions";

            const nextActions = {
                Available: [["Occupy Table", "Occupied"], ["Reserve", "Reserved"]],
                Occupied: [["Clear Table", "Available"]],
                Reserved: [["Seat Customer", "Occupied"], ["Cancel", "Available"]]
            }[status];
            nextActions.forEach(function (action, index) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "action-btn" + (index > 0 ? " outline" : "");
                button.dataset.tableId = table.id;
                button.dataset.tableStatus = action[1];
                button.textContent = action[0];
                actions.appendChild(button);
            });

            card.append(header, capacity, actions);
            staffTableGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Unable to load managed tables:", error);
        staffTableGrid.replaceChildren();
        const errorMessage = document.createElement("p");
        errorMessage.className = "empty-orders";
        errorMessage.textContent = "Unable to load restaurant tables. Please check the saved table data.";
        staffTableGrid.appendChild(errorMessage);
    }
}

staffTableGrid.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-table-id]");
    if (!button) {
        return;
    }

    try {
        const tables = getManagedTables();
        const table = tables.find(function (item) {
            return item.id === button.dataset.tableId;
        });
        if (!table) {
            renderManagedTables();
            AppFeedback.warning("This table was changed in the admin dashboard. Please try again.");
            return;
        }

        table.status = button.dataset.tableStatus;
        table.statusUpdatedAt = new Date().toISOString();
        localStorage.setItem(managedTablesKey, JSON.stringify(tables));
        renderManagedTables();
        AppFeedback.success(table.name + " is now " + table.status.toLowerCase() + ".");
    } catch (error) {
        console.error("Unable to update table status:", error);
        AppFeedback.error("The table status could not be saved. Please try again.");
    }
});

window.addEventListener("storage", function (event) {
    if (event.key === managedTablesKey || event.key === null) {
        renderManagedTables();
    }
});

renderManagedTables();


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
            showReservationApprovalNotification();
        }
    });

    renderReservations();
}


// =============================
// PAYMENTS
// =============================

const paymentTable = document.querySelector("#Payments .Tables");
const paymentRows = document.getElementById("staff-payment-rows");
const todayRevenue = document.getElementById("staff-today-revenue");
const paidOrderCount = document.getElementById("staff-paid-orders");
const pendingPaymentTotal = document.getElementById("staff-pending-payments");
const todaySales = document.getElementById("staff-today-sales");
const totalOrderCount = document.getElementById("staff-total-orders");
const totalCustomerCount = document.getElementById("staff-total-customers");

function renderPayments() {
    let orders;
    try {
        orders = OrderStorage.getAll();
    } catch (error) {
        console.error("Unable to load payments:", error);
        paymentRows.replaceChildren();
        const row = paymentRows.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.textContent = "Unable to load payment records.";
        return;
    }

    paymentRows.replaceChildren();
    const payableOrders = orders.filter(function (order) {
        return order.status !== "Declined";
    });
    let revenue = 0;
    let paidCount = 0;
    let pending = 0;

    payableOrders.forEach(function (order) {
        const paymentStatus = order.paymentStatus || "Pending";
        const amount = Number(order.total) || 0;
        if (paymentStatus === "Paid") {
            paidCount += 1;
            if (order.paymentUpdatedAt &&
                new Date(order.paymentUpdatedAt).toDateString() === new Date().toDateString()) {
                revenue += amount;
            }
        } else {
            pending += amount;
        }

        const row = paymentRows.insertRow();
        row.dataset.orderId = order.id;
        const orderCell = row.insertCell();
        orderCell.textContent = order.id;
        const customerCell = row.insertCell();
        customerCell.textContent = order.customerName || order.customerEmail || "Customer";
        const methodCell = row.insertCell();
        methodCell.textContent = order.paymentMethod || "Not recorded";
        const amountCell = row.insertCell();
        const amountStrong = document.createElement("strong");
        amountStrong.textContent = "₦" + amount.toLocaleString();
        amountCell.appendChild(amountStrong);
        const statusCell = row.insertCell();
        const badge = document.createElement("span");
        badge.className = "status " + (paymentStatus === "Paid" ? "completed" : "pending");
        badge.textContent = paymentStatus;
        statusCell.appendChild(badge);
        const actionsCell = row.insertCell();
        if (paymentStatus === "Paid") {
            const receiptButton = document.createElement("button");
            receiptButton.type = "button";
            receiptButton.className = "action-btn outline";
            receiptButton.dataset.paymentAction = "receipt";
            receiptButton.textContent = "Receipt";
            actionsCell.appendChild(receiptButton);
        } else {
            const confirmButton = document.createElement("button");
            confirmButton.type = "button";
            confirmButton.className = "action-btn";
            confirmButton.dataset.paymentAction = "confirm";
            confirmButton.textContent = "Confirm Payment";
            actionsCell.appendChild(confirmButton);
        }
    });

    if (payableOrders.length === 0) {
        const row = paymentRows.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.className = "empty-orders";
        cell.textContent = "No payments to display.";
    }

    todayRevenue.textContent = "₦" + revenue.toLocaleString();
    paidOrderCount.textContent = String(paidCount);
    pendingPaymentTotal.textContent = "₦" + pending.toLocaleString();
    todaySales.textContent = "₦" + revenue.toLocaleString();
    totalOrderCount.textContent = String(orders.length);
}

function renderStaffOverview() {
    try {
        totalCustomerCount.textContent = String(CustomerAccounts.getAll().length);
    } catch (error) {
        console.error("Unable to load customer count:", error);
        totalCustomerCount.textContent = "—";
    }
}

function showPaymentMethodDialog() {
    return new Promise(function (resolve) {
        const dialog = document.createElement("dialog");
        dialog.className = "payment-receipt-dialog";
        const form = document.createElement("form");
        const heading = document.createElement("h2");
        heading.textContent = "Confirm payment";
        const label = document.createElement("label");
        label.htmlFor = "staff-payment-method";
        label.textContent = "Payment method";
        const select = document.createElement("select");
        select.id = label.htmlFor;
        select.required = true;
        [
            ["", "Select a payment method..."],
            ["Cash", "Cash"],
            ["POS Card", "POS card"],
            ["Bank Transfer", "Bank transfer"],
            ["Online Transfer", "Online transfer"]
        ].forEach(function (option) {
            select.add(new Option(option[1], option[0]));
        });
        const actions = document.createElement("div");
        actions.className = "staff-payment-dialog-actions";
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";
        cancelButton.addEventListener("click", function () {
            dialog.close();
            dialog.remove();
            resolve(null);
        });
        const confirmButton = document.createElement("button");
        confirmButton.type = "submit";
        confirmButton.textContent = "Confirm payment";
        actions.append(cancelButton, confirmButton);
        form.append(heading, label, select, actions);
        dialog.appendChild(form);
        document.body.appendChild(dialog);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) {
                return;
            }
            const method = select.value;
            dialog.close();
            dialog.remove();
            resolve(method);
        });
        dialog.addEventListener("cancel", function (event) {
            event.preventDefault();
            dialog.close();
            dialog.remove();
            resolve(null);
        });
        dialog.showModal();
        select.focus();
    });
}

function showPaymentReceipt(order) {
    const dialog = document.createElement("dialog");
    dialog.className = "payment-receipt-dialog";
    const heading = document.createElement("h2");
    heading.textContent = "Payment receipt";
    const orderId = document.createElement("p");
    orderId.textContent = "Order: " + order.id;
    const customer = document.createElement("p");
    customer.textContent = "Customer: " + (order.customerName || order.customerEmail || "Customer");
    const date = document.createElement("p");
    date.textContent = "Paid: " + (order.paymentUpdatedAt || "Date not recorded");
    const method = document.createElement("p");
    method.textContent = "Payment method: " + (order.paymentMethod || "Not recorded");
    const items = document.createElement("p");
    items.textContent = "Items: " + (order.items || []).map(function (item) {
        return Number(item.quantity) + " × " + item.name;
    }).join(", ");
    const total = document.createElement("p");
    total.className = "payment-receipt-total";
    total.textContent = "Total paid: ₦" + (Number(order.total) || 0).toLocaleString();
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", function () {
        dialog.close();
        dialog.remove();
    });
    dialog.append(heading, orderId, customer, date, method, items, total, closeButton);
    document.body.appendChild(dialog);
    dialog.addEventListener("close", function () {
        dialog.remove();
    }, { once: true });
    dialog.showModal();
    closeButton.focus();
}

paymentTable.addEventListener("click", async function (event) {
    const button = event.target.closest("button[data-payment-action]");
    if (!button) {
        return;
    }

    const row = button.closest("tr");
    try {
        const order = OrderStorage.getAll().find(function (item) {
            return item.id === row.dataset.orderId;
        });
        if (!order) {
            renderPayments();
            AppFeedback.warning("This order is no longer available.");
            return;
        }
        if (button.dataset.paymentAction === "receipt") {
            showPaymentReceipt(order);
            return;
        }

        const method = await showPaymentMethodDialog();
        if (!method) {
            return;
        }
        OrderStorage.updatePaymentStatus(order.id, "Paid", method);
        renderPayments();
        AppFeedback.success("Payment confirmed and saved.");
    } catch (error) {
        console.error("Unable to update payment:", error);
        AppFeedback.error("The payment could not be updated. Please try again.");
    }
});

renderPayments();
renderStaffOverview();


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

window.addEventListener("storage", function (event) {
    if (event.key === "CustomerAccounts" || event.key === null) {
        renderStaffOverview();
    }
});


// =============================
// LOGOUT
// =============================
