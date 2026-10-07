const orderBoxes = document.querySelectorAll(".Box, .Boxx");

orderBoxes.forEach(function (order) {

    const acceptButton = order.querySelector("button:first-of-type");
    const rejectButton = order.querySelector("button:last-of-type");
    const status = order.querySelector(".Box1 p, .Box2 p");

    acceptButton.addEventListener("click", function () {

        status.innerText = "Accepted";

        status.style.color = "#28a745";

        acceptButton.innerText = "Accepted";

        acceptButton.style.backgroundColor = "#28a745";

        acceptButton.disabled = true;

        rejectButton.disabled = true;

        alert("Order has been accepted.");
    });


    rejectButton.addEventListener("click", function () {

        const confirmReject = confirm("Are you sure you want to reject this order?");

        if (confirmReject) {

            order.style.display = "none";

            alert("Order has been rejected.");
        }
    });

});


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

                alert("Table is now occupied.");
            }


            // Clear Table
            else if (buttonText === "Clear Table") {

                table.classList.remove("occupied", "reserved");
                table.classList.add("available");

                statusBadge.innerText = "Available";

                statusBadge.classList.remove("occupied", "reserved");
                statusBadge.classList.add("available");

                button.innerText = "Occupy Table";

                alert("Table is now available.");
            }


            // Reserve
            else if (buttonText === "Reserve") {

                table.classList.remove("available", "occupied");
                table.classList.add("reserved");

                statusBadge.innerText = "Reserved";

                statusBadge.classList.remove("available", "occupied");
                statusBadge.classList.add("reserved");

                alert("Table has been reserved.");
            }


            // Seat Customer
            else if (buttonText === "Seat Customer") {

                table.classList.remove("reserved", "available");
                table.classList.add("occupied");

                statusBadge.innerText = "Occupied";

                statusBadge.classList.remove("reserved", "available");
                statusBadge.classList.add("occupied");

                alert("Customer has been seated.");
            }


            // Cancel Reservation
            else if (buttonText === "Cancel") {

                table.classList.remove("reserved", "occupied");
                table.classList.add("available");

                statusBadge.innerText = "Available";

                statusBadge.classList.remove("reserved", "occupied");
                statusBadge.classList.add("available");

                alert("Reservation has been cancelled.");
            }

        });

    });

});


// =============================
// CUSTOMER & BOOKINGS
// =============================

const bookingTable = document.querySelector("#CustomerBooking .Tables");

if (bookingTable) {

    const bookingRows = bookingTable.querySelectorAll("tbody tr");

    bookingRows.forEach(function (row) {

        const buttons = row.querySelectorAll(".action-btn");

        buttons.forEach(function (button) {

            button.addEventListener("click", function () {

                const buttonText = button.innerText;

                const status = row.querySelector(".status");


                // Confirm Booking
                if (buttonText === "Confirm") {

                    status.innerText = "Confirmed";

                    status.classList.remove("pending");
                    status.classList.add("completed");

                    button.innerText = "Confirmed";

                    button.disabled = true;

                    alert("Booking has been confirmed.");
                }


                // Cancel Booking
                else if (buttonText === "Cancel") {

                    const confirmCancel = confirm(
                        "Are you sure you want to cancel this booking?"
                    );

                    if (confirmCancel) {

                        status.innerText = "Cancelled";

                        status.classList.remove("pending", "completed", "reserved");
                        status.classList.add("preparing");

                        button.disabled = true;

                        alert("Booking has been cancelled.");
                    }
                }


                // Seat Customer
                else if (buttonText === "Seat Customer") {

                    status.innerText = "Seated";

                    status.classList.remove("reserved", "pending");
                    status.classList.add("completed");

                    button.innerText = "Seated";

                    button.disabled = true;

                    alert("Customer has been seated.");
                }


                // Edit Booking
                else if (buttonText === "Edit") {

                    alert("Edit booking feature will be added next.");
                }

            });

        });

    });

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

                    alert("Payment has been confirmed.");
                }


                // Receipt
                else if (buttonText === "Receipt") {

                    const orderNumber = row.querySelector("td").innerText;

                    alert(
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


// =============================
// LOGOUT
// =============================

const logoutButton = document.querySelector(".logout-btn");

if (logoutButton) {

    logoutButton.addEventListener("click", function (event) {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) {
            event.preventDefault();
        }

    });

}