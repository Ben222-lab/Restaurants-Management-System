const FirstName = document.getElementById("FirstName");
const LastName = document.getElementById("LastName");
const WhatsappNumber = document.getElementById("WhatsappNumber");
const ContactNumber = document.getElementById("ContactNumber");
const Email = document.getElementById("Email");
const ReservationDate = document.getElementById("Date");
const Time = document.getElementById("Time");
const PartySize = document.getElementById("PartySize");
const Occasion = document.getElementById("Occasion");
const SubmitReservation = document.getElementById("SubmitReservation");
const customerWelcome = document.getElementById("customer-welcome");
const customerLogout = document.getElementById("customer-logout");
const customerReservationsContainer = document.getElementById("customer-reservations");
const customerOrdersContainer = document.getElementById("customer-orders");
const customerOrderHistoryContainer = document.getElementById("customer-order-history");
let currentCustomer = null;

try {
    currentCustomer = CustomerSession.getCurrentCustomer();
    if (currentCustomer) {
        customerWelcome.textContent = "Hi, " + currentCustomer.name;
    }
} catch (error) {
    console.error("Unable to load customer session:", error);
    customerWelcome.textContent = "Hi";
}

function renderCustomerReservations() {
    try {
        const reservations = ReservationStorage.getAll().filter(function (reservation) {
            const ownerEmail = reservation.customerEmail || reservation.email;
            return currentCustomer && ownerEmail &&
                ownerEmail.toLowerCase() === currentCustomer.email.toLowerCase();
        });

        customerReservationsContainer.replaceChildren();

        if (reservations.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-reservations";
            emptyMessage.textContent = currentCustomer
                ? "No reservations found for your account."
                : "Log in to view your reservations.";
            customerReservationsContainer.appendChild(emptyMessage);
            return;
        }

        reservations.slice().reverse().forEach(function (reservation) {
            const card = document.createElement("article");
            card.className = "customer-reservation-item";

            const heading = document.createElement("h3");
            heading.textContent = "Reservation " + reservation.id;
            card.appendChild(heading);

            [
                ["Date", reservation.date],
                ["Time", reservation.time],
                ["Guests", reservation.partySize],
                ["Occasion", reservation.occasion],
                ["Seating preference", reservation.seatingPreference]
            ].forEach(function (detail) {
                if (!detail[1]) {
                    return;
                }
                const paragraph = document.createElement("p");
                paragraph.textContent = detail[0] + ": " + detail[1];
                card.appendChild(paragraph);
            });

            const status = reservation.status || "Pending";
            const statusBadge = document.createElement("span");
            statusBadge.className = "customer-reservation-status status-" + status.toLowerCase();
            statusBadge.textContent = status;
            card.appendChild(statusBadge);

            const message = document.createElement("p");
            message.className = "reservation-status-message " + status.toLowerCase();
            if (status === "Approved") {
                message.textContent = "Your reservation has been approved. Our staff have been notified.";
                card.appendChild(message);
            } else if (status === "Declined") {
                message.textContent = "Your reservation was declined. Please contact the restaurant if you need help.";
                card.appendChild(message);
            } else if (status === "Pending") {
                message.textContent = "Your reservation is pending admin approval.";
                card.appendChild(message);
            }

            customerReservationsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Unable to load customer reservations:", error);
        customerReservationsContainer.replaceChildren();
        const errorMessage = document.createElement("p");
        errorMessage.className = "empty-reservations";
        errorMessage.textContent = "Unable to load your reservations. Please refresh the page.";
        customerReservationsContainer.appendChild(errorMessage);
    }
}

function renderCustomerOrders() {
    try {
        const orders = getCustomerOrders();

        customerOrdersContainer.replaceChildren();
        customerOrderHistoryContainer.replaceChildren();

        if (orders.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-reservations";
            emptyMessage.textContent = currentCustomer
                ? "No orders found for your account."
                : "Log in to view your orders.";
            customerOrdersContainer.appendChild(emptyMessage);
            customerOrderHistoryContainer.appendChild(emptyMessage.cloneNode(true));
            return;
        }

        orders.slice().reverse().forEach(function (order) {
            const card = document.createElement("article");
            card.className = "customer-order-item";

            const heading = document.createElement("h3");
            heading.textContent = "Order " + order.id;
            card.appendChild(heading);

            const type = document.createElement("p");
            type.textContent = "Order type: " + (order.orderType || "—");
            card.appendChild(type);

            const customerDetails = order.customerDetails || {};
            const orderLocation = customerDetails.tableNumber
                ? "Table: " + customerDetails.tableNumber
                : customerDetails.address
                    ? "Address / pickup location: " + customerDetails.address
                    : "";
            if (orderLocation) {
                const location = document.createElement("p");
                location.textContent = orderLocation;
                card.appendChild(location);
            }
            [
                ["Pickup name", customerDetails.pickupName],
                ["Pickup time", customerDetails.pickupTime],
                ["Contact", customerDetails.phone],
                ["Instructions", customerDetails.instructions]
            ].forEach(function (detail) {
                if (!detail[1]) {
                    return;
                }
                const paragraph = document.createElement("p");
                paragraph.textContent = detail[0] + ": " + detail[1];
                card.appendChild(paragraph);
            });

            const items = document.createElement("p");
            items.textContent = "Items: " + (order.items || []).map(function (item) {
                return item.quantity + " × " + item.name;
            }).join(", ");
            card.appendChild(items);

            const total = document.createElement("p");
            total.textContent = "Total: ₦" + Number(order.total || 0).toLocaleString();
            card.appendChild(total);

            const status = order.status || "Pending";
            const badge = document.createElement("span");
            badge.className = "customer-reservation-status status-" + status.toLowerCase();
            badge.textContent = status;
            card.appendChild(badge);

            const messageText = {
                Pending: "Your order is waiting for admin approval.",
                Approved: "Your order was approved by admin and is waiting for staff acceptance.",
                Accepted: "Your order was approved and accepted by staff. It is being prepared.",
                Declined: "Your order was declined. Please contact the restaurant if you need help."
            }[status];

            if (messageText) {
                const message = document.createElement("p");
                message.className = "reservation-status-message " + status.toLowerCase();
                message.textContent = messageText;
                card.appendChild(message);
            }

            customerOrdersContainer.appendChild(card);

            const historyEntry = document.createElement("article");
            historyEntry.className = "history-item";

            const historyHeader = document.createElement("div");
            historyHeader.className = "history-main-info";
            const titleAndDate = document.createElement("div");
            const historyTitle = document.createElement("h4");
            historyTitle.textContent = "Order " + order.id;
            const date = document.createElement("span");
            date.className = "history-date";
            date.textContent = order.createdAt || "";
            titleAndDate.append(historyTitle, date);

            const historyStatus = document.createElement("span");
            historyStatus.className = "status-badge " +
                (status === "Declined" ? "badge-danger" : "badge-success");
            historyStatus.textContent = status;
            historyHeader.append(titleAndDate, historyStatus);

            const details = document.createElement("div");
            details.className = "history-details";
            const summary = document.createElement("p");
            const itemCount = (order.items || []).reduce(function (count, item) {
                return count + Number(item.quantity || 0);
            }, 0);
            summary.textContent = (order.orderType || "Order") + " · " +
                itemCount + (itemCount === 1 ? " item" : " items");
            const amount = document.createElement("span");
            amount.className = "history-price";
            amount.textContent = "₦" + Number(order.total || 0).toLocaleString();
            details.append(summary, amount);

            const requestedItems = document.createElement("p");
            requestedItems.className = "history-requested-items";
            requestedItems.textContent = "Requested: " + (order.items || []).map(function (item) {
                return item.quantity + " × " + item.name;
            }).join(", ");
            historyEntry.append(historyHeader, details, requestedItems);
            customerOrderHistoryContainer.appendChild(historyEntry);
        });
    } catch (error) {
        console.error("Unable to load customer orders:", error);
        customerOrdersContainer.replaceChildren();
        customerOrderHistoryContainer.replaceChildren();
        const errorMessage = document.createElement("p");
        errorMessage.className = "empty-reservations";
        errorMessage.textContent = "Unable to load your orders. Please refresh the page.";
        customerOrdersContainer.appendChild(errorMessage);
        customerOrderHistoryContainer.appendChild(errorMessage.cloneNode(true));
    }
}

function getCustomerOrders() {
    return OrderStorage.getAll().filter(function (order) {
            const ownerEmail = order.customerEmail || (order.customerDetails && order.customerDetails.Email);
            return currentCustomer && ownerEmail &&
                ownerEmail.toLowerCase() === currentCustomer.email.toLowerCase();
        });
}

window.addEventListener("storage", function (event) {
    if (event.key === "Reservations" || event.key === null) {
        renderCustomerReservations();
    }
    if (event.key === "Orders" || event.key === null) {
        renderCustomerOrders();
    }
});

renderCustomerReservations();
renderCustomerOrders();

if (SubmitReservation) {
    SubmitReservation.addEventListener("click", function (event) {
        event.preventDefault();

        const firstName = FirstName.value.trim();
        const lastName = LastName.value.trim();
        const whatsappNumber = WhatsappNumber.value.trim();
        const contactNumber = ContactNumber.value.trim();
        const email = Email.value.trim();
        const date = ReservationDate.value;
        const time = Time.value;
        const partySize = PartySize.value;
        const occasion = Occasion.value;

        if (firstName === "") {
            AppFeedback.notify("Please enter your first name.");
            FirstName.focus();
            return;
        }

        if (lastName === "") {
            AppFeedback.notify("Please enter your last name.");
            LastName.focus();
            return;
        }

        if (whatsappNumber === "") {
            AppFeedback.notify("Please enter your WhatsApp number.");
            WhatsappNumber.focus();
            return;
        }

        if (contactNumber === "") {
            AppFeedback.notify("Please enter your contact number.");
            ContactNumber.focus();
            return;
        }

        if (email === "") {
            AppFeedback.notify("Please enter your email address.");
            Email.focus();
            return;
        }

        if (date === "") {
            AppFeedback.notify("Please select a date.");
            ReservationDate.focus();
            return;
        }

        if (time === "") {
            AppFeedback.notify("Please select a time.");
            Time.focus();
            return;
        }

        if (partySize === "") {
            AppFeedback.notify("Please enter the party size.");
            PartySize.focus();
            return;
        }

        const seatingPreference = document.querySelector('input[name="tableType"]:checked');
        const reservation = {
            id: "RES-" + Date.now(),
            firstName: firstName,
            lastName: lastName,
            whatsappNumber: whatsappNumber,
            contactNumber: contactNumber,
            email: email,
            date: date,
            time: time,
            partySize: partySize,
            occasion: occasion,
            seatingPreference: seatingPreference ? seatingPreference.value : "",
            customerEmail: currentCustomer ? currentCustomer.email : email,
            status: "Pending",
            createdAt: new Date().toLocaleString()
        };

        try {
            const reservations = ReservationStorage.getAll();
            reservations.push(reservation);
            ReservationStorage.saveAll(reservations);
        } catch (error) {
            console.error("Unable to save reservation:", error);
            AppFeedback.notify("Your reservation could not be saved. Please try again.");
            return;
        }

        AppFeedback.notify("Your table reservation was submitted successfully!");

        FirstName.value = "";
        LastName.value = "";
        WhatsappNumber.value = "";
        ContactNumber.value = "";
        Email.value = "";
        ReservationDate.value = "";
        Time.value = "";
        PartySize.value = "";
        Occasion.value = "";
        renderCustomerReservations();
    });
}


const toggleOptions = document.querySelectorAll(".toggle-option");
const orderForm = document.getElementById("place-order-form");
const dineInFields = document.getElementById("dine-in-fields");
const takeawayFields = document.getElementById("takeaway-fields");
const orderMenuCategories = document.getElementById("order-menu-categories");
const orderMenuItems = document.getElementById("order-menu-items");

let selectedOrderType = "Dine-in";

function setOrderType(orderType) {
    selectedOrderType = orderType;
    const isTakeaway = orderType === "takeaway";
    dineInFields.classList.toggle("hidden", isTakeaway);
    takeawayFields.classList.toggle("hidden", !isTakeaway);
    document.getElementById("table-number").required = !isTakeaway;
    document.getElementById("pickup-name").required = isTakeaway;
    document.getElementById("pickup-address").required = isTakeaway;
    document.getElementById("pickup-time").required = isTakeaway;
}

toggleOptions.forEach(function (option) {
    option.addEventListener("click", function () {
        toggleOptions.forEach(function (item) {
            item.classList.remove("active");
        });
        option.classList.add("active");
        const radio = option.querySelector("input[type='radio']");
        const mode = radio.value;
        radio.checked = true;
        setOrderType(mode);
    });
});

setOrderType("dine-in");
const cart = [];
let activeMenuCategory = "";

function readMenuItems() {
    const savedMenu = localStorage.getItem("ManagedMenuItems");
    if (savedMenu !== null) {
        const items = JSON.parse(savedMenu);
        if (!Array.isArray(items)) {
            throw new Error("Saved restaurant menu is invalid.");
        }
        const groupedItems = new Map();
        items.forEach(function (item) {
            if (!item.category || !item.name || !Number.isFinite(Number(item.price)) ||
                Number(item.price) <= 0) {
                return;
            }
            if (!groupedItems.has(item.category)) {
                groupedItems.set(item.category, []);
            }
            groupedItems.get(item.category).push({
                name: item.name,
                price: Number(item.price)
            });
        });
        return Array.from(groupedItems, function (entry) {
            return { category: entry[0], items: entry[1] };
        });
    }

    return Array.from(document.querySelectorAll(".First_section .Nigeria_Head")).map(function (section) {
        const categoryHeading = section.previousElementSibling &&
            section.previousElementSibling.querySelector("h2");
        const category = categoryHeading ? categoryHeading.textContent.trim() : "Menu";

        return {
            category: category,
            items: Array.from(section.querySelectorAll(".card")).map(function (card) {
                const title = card.querySelector(".card-title");
                const match = title && title.textContent.trim().match(/^(.+?)\s*-\s*₦([\d,]+)$/);
                if (!match) {
                    return null;
                }

                return {
                    name: match[1].trim(),
                    price: Number(match[2].replace(/,/g, ""))
                };
            }).filter(function (item) {
                return item && Number.isFinite(item.price) && item.price > 0;
            })
        };
    }).filter(function (category) {
        return category.items.length > 0;
    });
}

const menuCategories = readMenuItems();

const savedRestaurantSettings = localStorage.getItem("RestaurantSettings");
const acceptingOrders = !savedRestaurantSettings ||
    JSON.parse(savedRestaurantSettings).status === "Open";
if (savedRestaurantSettings) {
    const settings = JSON.parse(savedRestaurantSettings);
    if (settings.name) {
        document.querySelector(".Main > h2").textContent = settings.name;
        document.title = settings.name + " - Menu";
    }
    if (settings.status && settings.status !== "Open") {
        const statusNotice = document.createElement("p");
        statusNotice.className = "restaurant-status-notice";
        statusNotice.textContent = settings.status === "Closed"
            ? "The restaurant is currently closed and cannot accept orders."
            : "The restaurant is temporarily closed.";
        document.querySelector(".Main").prepend(statusNotice);
    }
}

const savedTables = localStorage.getItem("ManagedTables");
if (savedTables !== null) {
    const tableList = JSON.parse(savedTables);
    if (!Array.isArray(tableList)) {
        throw new Error("Saved restaurant tables are invalid.");
    }
    const tableSelect = document.getElementById("table-number");
    tableSelect.replaceChildren(new Option("Select your table...", ""));
    tableList.filter(function (table) {
        return table.status === "Available";
    }).forEach(function (table) {
        tableSelect.add(new Option(table.name, table.name));
    });
}
if (!acceptingOrders) {
    document.querySelectorAll("#place-order-form input, #place-order-form select, " +
        "#place-order-form textarea, #place-order-form button").forEach(function (control) {
        control.disabled = true;
    });
}

function renderMenuCategoryButtons() {
    orderMenuCategories.replaceChildren();

    menuCategories.forEach(function (category) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "order-category-button";
        button.textContent = category.category;
        button.setAttribute("aria-pressed", String(activeMenuCategory === category.category));
        button.addEventListener("click", function () {
            activeMenuCategory = category.category;
            renderMenuCategoryButtons();
            renderMenuItems();
        });
        orderMenuCategories.appendChild(button);
    });
}

function renderMenuItems() {
    orderMenuItems.replaceChildren();
    const category = menuCategories.find(function (item) {
        return item.category === activeMenuCategory;
    });

    if (!category) {
        const hint = document.createElement("p");
        hint.className = "menu-selection-hint";
        hint.textContent = "Choose a category to browse the menu.";
        orderMenuItems.appendChild(hint);
        return;
    }

    category.items.forEach(function (menuItem) {
        const row = document.createElement("div");
        row.className = "order-menu-item";
        const details = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = menuItem.name;
        const price = document.createElement("span");
        price.textContent = "₦" + menuItem.price.toLocaleString();
        details.append(name, price);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "add-order-item";
        button.disabled = !acceptingOrders;
        button.textContent = cart.some(function (item) {
            return item.name === menuItem.name;
        }) ? "Add another" : "Add";
        button.addEventListener("click", function () {
            const existing = cart.find(function (item) {
                return item.name === menuItem.name;
            });
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    id: cart.length ? Math.max.apply(null, cart.map(function (item) {
                        return item.id;
                    })) + 1 : 1,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: 1
                });
            }
            displayCart();
            renderMenuItems();
        });

        row.append(details, button);
        orderMenuItems.appendChild(row);
    });
}

activeMenuCategory = menuCategories.length ? menuCategories[0].category : "";
renderMenuCategoryButtons();
renderMenuItems();


const cartList = document.querySelector(".cart-list");

const subtotalElement =
    document.getElementById("subtotal-amount") ||
    document.querySelector(".subtotal");

const serviceFeeElement = document.getElementById("service-fee-amount");
const totalElement =
    document.getElementById("grand-total-amount") ||
    document.querySelector(".total-amount");

const feedbackMsg = document.querySelector(".feedback-msg");


function displayCart() {

    if (!cartList) {
        return;
    }

    cartList.innerHTML = "";

    if (cart.length === 0) {

        cartList.innerHTML = `
            <div class="empty-cart">
                <p>Your order is empty.</p>
            </div>
        `;

        updateTotal();

        return;
    }


    cart.forEach(function (item) {

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <span class="item-price">
                    ₦${item.price.toLocaleString()}
                </span>
            </div>

            <div class="item-qty">

                <button 
                    type="button"
                    class="qty-btn decrease-btn"
                    data-id="${item.id}">
                    −
                </button>

                <span>${item.quantity}</span>

                <button 
                    type="button"
                    class="qty-btn increase-btn"
                    data-id="${item.id}">
                    +
                </button>

            </div>
        `;

        cartList.appendChild(cartItem);
    });


    updateTotal();
}

cartList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-id]");
    if (!button) {
        return;
    }

    const item = cart.find(function (product) {
        return product.id === Number(button.dataset.id);
    });
    if (!item) {
        return;
    }

    if (button.classList.contains("increase-btn")) {
        item.quantity += 1;
    } else if (button.classList.contains("decrease-btn")) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart.splice(cart.indexOf(item), 1);
        }
    } else {
        return;
    }

    displayCart();
    renderMenuItems();
});

function updateTotal() {

    let subtotal = 0;

    cart.forEach(function (item) {

        subtotal += item.price * item.quantity;
    });

    const serviceFee = Math.round(subtotal * 0.05);

    if (subtotalElement) {

        subtotalElement.textContent =
            "₦" + subtotal.toLocaleString();
    }


    if (totalElement) {
        totalElement.textContent =
            "₦" + (subtotal + serviceFee).toLocaleString();
    }

    if (serviceFeeElement) {
        serviceFeeElement.textContent = "₦" + serviceFee.toLocaleString();
    }
}


orderForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!acceptingOrders) {
        AppFeedback.warning("The restaurant is not currently accepting orders.");
        return;
    }
    if (!currentCustomer) {
        AppFeedback.warning("Please log in before placing an order.");
        return;
    }
    if (cart.length === 0) {
        AppFeedback.warning("Choose at least one menu item before placing your order.");
        return;
    }
    if (!orderForm.reportValidity()) {
        return;
    }

    const formData = new FormData(orderForm);
    const subtotal = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);
    const serviceFee = Math.round(subtotal * 0.05);
    const customerDetails = {};
    formData.forEach(function (value, key) {
        if (String(value).trim()) {
            customerDetails[key] = String(value).trim();
        }
    });

    const order = {
        id: "ORD-" + Date.now(),
        orderType: selectedOrderType === "takeaway" ? "Takeaway / Pick Up" : "Dine-in",
        items: JSON.parse(JSON.stringify(cart)),
        subtotal: subtotal,
        serviceFee: serviceFee,
        total: subtotal + serviceFee,
        customerDetails: customerDetails,
        customerEmail: currentCustomer.email,
        customerName: currentCustomer.name,
        status: "Pending",
        createdAt: new Date().toLocaleString()
    };

    try {
        const orders = OrderStorage.getAll();
        orders.push(order);
        OrderStorage.saveAll(orders);
    } catch (error) {
        console.error("Unable to save customer order:", error);
        AppFeedback.error("Your order could not be submitted. Please try again.");
        return;
    }

    if (feedbackMsg) {
        feedbackMsg.textContent = "Your order has been placed successfully!";
        feedbackMsg.style.color = "#28a745";
    }
    AppFeedback.success("Your order has been placed successfully.");
    cart.length = 0;
    displayCart();
    renderMenuItems();
    renderCustomerOrders();
    orderForm.reset();
    const dineInOption = document.getElementById("dine-in-option");
    const takeawayOption = document.getElementById("takeaway-option");
    dineInOption.classList.add("active");
    takeawayOption.classList.remove("active");
    setOrderType("dine-in");
});

const savedReservations =
    JSON.parse(
        localStorage.getItem("Reservations")
    ) || [];

const savedOrders =
    JSON.parse(
        localStorage.getItem("Orders")
    ) || [];

console.log("Reservations:", savedReservations);
console.log("Orders:", savedOrders);


displayCart();