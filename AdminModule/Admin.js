const MANAGEMENT_KEYS = {
    menu: "ManagedMenuItems",
    staff: "ManagedStaff",
    tables: "ManagedTables",
    settings: "RestaurantSettings"
};
const menuCategories = [
    "Nigerian Dishes",
    "Intercontinental Dishes",
    "Desserts",
    "Local Drinks",
    "Fruit Drinks",
    "Soft Drinks"
];
const defaultMenuItems = [
    ["Nigerian Dishes", "Jollof Rice", 10000],
    ["Nigerian Dishes", "Fried Rice", 15000],
    ["Nigerian Dishes", "Moi-Moi", 5000],
    ["Nigerian Dishes", "Vegetable Soup", 20000],
    ["Intercontinental Dishes", "Caviar", 100000],
    ["Intercontinental Dishes", "Grilled Salmon", 15000],
    ["Intercontinental Dishes", "Beef Lasanga", 15000],
    ["Intercontinental Dishes", "Chicken Alfredo", 20000],
    ["Desserts", "Caramel Custard", 10000],
    ["Desserts", "BlueBerryPie", 10000],
    ["Desserts", "Cheese cake", 20000],
    ["Desserts", "Fruit Parfait", 50000],
    ["Local Drinks", "Fura Da Nono", 5000],
    ["Local Drinks", "Kunu Aya", 2000],
    ["Local Drinks", "Millet Drink", 7000],
    ["Local Drinks", "Zobo Drink", 3000],
    ["Fruit Drinks", "Guava Juice", 5000],
    ["Fruit Drinks", "Orange Juice", 7000],
    ["Fruit Drinks", "Pineapple Juice", 8000],
    ["Fruit Drinks", "Watermelon Juice", 4000],
    ["Soft Drinks", "Pepsi", 5000],
    ["Soft Drinks", "Coca-Cola", 5000],
    ["Soft Drinks", "Fanta", 4000],
    ["Soft Drinks", "Sprite", 4000]
].map(function (item, index) {
    return {
        id: "MENU-" + (index + 1),
        category: item[0],
        name: item[1],
        price: item[2]
    };
});

function loadManagedList(key, defaults) {
    const saved = localStorage.getItem(key);
    if (saved === null) {
        localStorage.setItem(key, JSON.stringify(defaults));
        return defaults.slice();
    }

    const values = JSON.parse(saved);
    if (!Array.isArray(values)) {
        throw new Error("Saved management data is invalid for " + key + ".");
    }
    return values;
}

function saveManagedList(key, values) {
    localStorage.setItem(key, JSON.stringify(values));
}

function makeButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className || "management-action";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function showAdminForm(title, fields, initialValues) {
    return new Promise(function (resolve) {
        const dialog = document.createElement("dialog");
        dialog.className = "admin-management-dialog";
        const form = document.createElement("form");
        form.method = "dialog";

        const heading = document.createElement("h2");
        heading.textContent = title;
        form.appendChild(heading);

        fields.forEach(function (field) {
            const label = document.createElement("label");
            label.textContent = field.label;
            label.htmlFor = "admin-field-" + field.name;
            let input;

            if (field.type === "select") {
                input = document.createElement("select");
                field.options.forEach(function (option) {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    input.appendChild(optionElement);
                });
            } else {
                input = document.createElement("input");
                input.type = field.type || "text";
                if (field.type === "number") {
                    input.min = field.min || "0";
                    input.step = field.step || "1";
                }
            }

            input.id = label.htmlFor;
            input.name = field.name;
            input.required = field.required !== false;
            input.value = initialValues && initialValues[field.name] !== undefined
                ? initialValues[field.name]
                : (field.value || "");
            form.append(label, input);
        });

        const actions = document.createElement("div");
        actions.className = "admin-dialog-actions";
        const cancelButton = makeButton("Cancel", "admin-dialog-cancel", function () {
            dialog.close();
            dialog.remove();
            resolve(null);
        });
        cancelButton.formNoValidate = true;
        const saveButton = document.createElement("button");
        saveButton.type = "submit";
        saveButton.className = "admin-dialog-save";
        saveButton.textContent = "Save";
        actions.append(cancelButton, saveButton);
        form.appendChild(actions);
        dialog.appendChild(form);
        document.body.appendChild(dialog);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) {
                return;
            }
            const result = {};
            fields.forEach(function (field) {
                result[field.name] = form.elements[field.name].value.trim();
            });
            dialog.close();
            dialog.remove();
            resolve(result);
        });

        dialog.addEventListener("cancel", function (event) {
            event.preventDefault();
            dialog.close();
            dialog.remove();
            resolve(null);
        });
        dialog.showModal();
        form.elements[fields[0].name].focus();
    });
}

function confirmAdminAction(title, message) {
    return new Promise(function (resolve) {
        const dialog = document.createElement("dialog");
        dialog.className = "admin-management-dialog admin-confirm-dialog";
        const heading = document.createElement("h2");
        heading.textContent = title;
        const description = document.createElement("p");
        description.textContent = message;
        const actions = document.createElement("div");
        actions.className = "admin-dialog-actions";
        const cancelButton = makeButton("Cancel", "admin-dialog-cancel", function () {
            dialog.close();
            dialog.remove();
            resolve(false);
        });
        const confirmButton = makeButton("Yes, continue", "admin-dialog-delete", function () {
            dialog.close();
            dialog.remove();
            resolve(true);
        });
        actions.append(cancelButton, confirmButton);
        dialog.append(heading, description, actions);
        document.body.appendChild(dialog);
        dialog.addEventListener("cancel", function (event) {
            event.preventDefault();
            dialog.close();
            dialog.remove();
            resolve(false);
        });
        dialog.showModal();
        cancelButton.focus();
    });
}

let managedMenuItems = loadManagedList(MANAGEMENT_KEYS.menu, defaultMenuItems);
let managedStaff = loadManagedList(MANAGEMENT_KEYS.staff, [
    { id: "STAFF-1", name: "Benjamin", role: "Manager", email: "" },
    { id: "STAFF-2", name: "John", role: "Waiter", email: "" },
    { id: "STAFF-3", name: "Mary", role: "Cashier", email: "" }
]);
let managedTables = loadManagedList(MANAGEMENT_KEYS.tables, [
    { id: "TABLE-1", name: "Table 1", status: "Available" },
    { id: "TABLE-2", name: "Table 2", status: "Occupied" },
    { id: "TABLE-3", name: "Table 3", status: "Reserved" },
    { id: "TABLE-4", name: "Table 4", status: "Available" }
]);
let restaurantSettings = JSON.parse(localStorage.getItem(MANAGEMENT_KEYS.settings) ||
    '{"name":"Taste Haven","status":"Open","phone":"","address":"","openingHours":""}');

function persistAndRender(key, items, render) {
    try {
        saveManagedList(key, items);
        render();
        return true;
    } catch (error) {
        console.error("Unable to save management changes:", error);
        AppFeedback.error("Changes could not be saved. Please check browser storage.");
        return false;
    }
}

function renderMenuItems() {
    const box = document.querySelector("#MenuManagement .management-box");
    box.replaceChildren();
    managedMenuItems.forEach(function (menu) {
        const card = document.createElement("div");
        card.className = "menu-item";
        const details = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = menu.name;
        const category = document.createElement("p");
        category.textContent = menu.category;
        const price = document.createElement("p");
        price.textContent = "₦" + Number(menu.price).toLocaleString();
        details.append(name, category, price);

        const actions = document.createElement("div");
        actions.className = "management-actions";
        actions.append(
            makeButton("Edit", "management-action", function () {
                editMenuItem(menu.id);
            }),
            makeButton("Delete", "management-action danger", function () {
                deleteMenuItem(menu.id);
            })
        );
        card.append(details, actions);
        box.appendChild(card);
    });
}

async function addMenuItem() {
    const values = await showAdminForm("Add menu item", [
        { name: "name", label: "Food or menu item name" },
        { name: "category", label: "Category", type: "select", options: menuCategories },
        { name: "price", label: "Price (₦)", type: "number", min: "1", step: "1" }
    ]);
    if (!values) {
        return;
    }

    const item = {
        id: "MENU-" + Date.now(),
        name: values.name,
        category: values.category,
        price: Number(values.price)
    };
    managedMenuItems.push(item);
    if (persistAndRender(MANAGEMENT_KEYS.menu, managedMenuItems, renderMenuItems)) {
        AppFeedback.success("Menu item added.");
    }
}

async function editMenuItem(id) {
    const item = managedMenuItems.find(function (menu) {
        return menu.id === id;
    });
    if (!item) {
        return;
    }

    const values = await showAdminForm("Edit menu item", [
        { name: "name", label: "Food or menu item name" },
        { name: "category", label: "Category", type: "select", options: menuCategories },
        { name: "price", label: "Price (₦)", type: "number", min: "1", step: "1" }
    ], item);
    if (!values) {
        return;
    }

    Object.assign(item, {
        name: values.name,
        category: values.category,
        price: Number(values.price)
    });
    if (persistAndRender(MANAGEMENT_KEYS.menu, managedMenuItems, renderMenuItems)) {
        AppFeedback.success("Menu item updated.");
    }
}

async function deleteMenuItem(id) {
    if (!await confirmAdminAction("Delete menu item?", "This will remove the item from customer ordering.")) {
        return;
    }
    managedMenuItems = managedMenuItems.filter(function (item) {
        return item.id !== id;
    });
    if (persistAndRender(MANAGEMENT_KEYS.menu, managedMenuItems, renderMenuItems)) {
        AppFeedback.success("Menu item deleted.");
    }
}

document.getElementById("add-menu-item-button").addEventListener("click", addMenuItem);
renderMenuItems();

function renderStaff() {
    const box = document.getElementById("staff-management-box");
    box.replaceChildren();
    if (managedStaff.length === 0) {
        box.appendChild(createEmptyMessage("No staff have been added yet."));
    }

    managedStaff.forEach(function (staff) {
        const card = document.createElement("div");
        card.className = "staff-item";
        const details = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = staff.name;
        const role = document.createElement("p");
        role.textContent = staff.role + (staff.email ? " · " + staff.email : "");
        details.append(name, role);
        const actions = document.createElement("div");
        actions.className = "management-actions";
        actions.append(
            makeButton("Edit", "management-action", function () {
                editStaff(staff.id);
            }),
            makeButton("Delete", "management-action danger", function () {
                deleteStaff(staff.id);
            })
        );
        card.append(details, actions);
        box.appendChild(card);
    });
}

function createEmptyMessage(text) {
    const message = document.createElement("p");
    message.className = "management-empty";
    message.textContent = text;
    return message;
}

async function addStaff() {
    const values = await showAdminForm("Add staff member", [
        { name: "name", label: "Full name" },
        { name: "role", label: "Role" },
        { name: "email", label: "Email address", type: "email", required: false }
    ]);
    if (!values) {
        return;
    }
    managedStaff.push({
        id: "STAFF-" + Date.now(),
        name: values.name,
        role: values.role,
        email: values.email
    });
    if (persistAndRender(MANAGEMENT_KEYS.staff, managedStaff, renderStaff)) {
        AppFeedback.success("Staff member added.");
    }
}

async function editStaff(id) {
    const staff = managedStaff.find(function (member) {
        return member.id === id;
    });
    if (!staff) {
        return;
    }
    const values = await showAdminForm("Edit staff member", [
        { name: "name", label: "Full name" },
        { name: "role", label: "Role" },
        { name: "email", label: "Email address", type: "email", required: false }
    ], staff);
    if (!values) {
        return;
    }
    Object.assign(staff, values);
    if (persistAndRender(MANAGEMENT_KEYS.staff, managedStaff, renderStaff)) {
        AppFeedback.success("Staff member updated.");
    }
}

async function deleteStaff(id) {
    if (!await confirmAdminAction("Delete staff member?", "This removes the staff member from the roster.")) {
        return;
    }
    managedStaff = managedStaff.filter(function (staff) {
        return staff.id !== id;
    });
    if (persistAndRender(MANAGEMENT_KEYS.staff, managedStaff, renderStaff)) {
        AppFeedback.success("Staff member deleted.");
    }
}

document.getElementById("add-staff-button").addEventListener("click", addStaff);
renderStaff();

function renderCustomers() {
    const box = document.getElementById("customer-management-box");
    box.replaceChildren();
    const customers = CustomerAccounts.getAll();
    const customerCount = document.getElementById("total-customers-count");
    if (customerCount) {
        customerCount.textContent = String(customers.length);
    }
    if (customers.length === 0) {
        box.appendChild(createEmptyMessage("No customer accounts have been registered yet."));
        return;
    }

    customers.forEach(function (customer) {
        const card = document.createElement("div");
        card.className = "customer-item";
        const name = document.createElement("h3");
        name.textContent = customer.name;
        const email = document.createElement("p");
        email.textContent = customer.email;
        const username = document.createElement("p");
        username.textContent = "Username: " + customer.username;
        const actions = document.createElement("div");
        actions.className = "management-actions";
        actions.append(
            makeButton("Edit", "management-action", function () {
                editCustomer(customer.email);
            }),
            makeButton("Remove", "management-action danger", function () {
                removeCustomer(customer.email);
            })
        );
        card.append(name, email, username, actions);
        box.appendChild(card);
    });
}

async function addCustomer() {
    const values = await showAdminForm("Add customer", [
        { name: "name", label: "Full name" },
        { name: "username", label: "Username" },
        { name: "email", label: "Email address", type: "email" },
        { name: "password", label: "Temporary password (at least 8 characters)", type: "password" }
    ]);
    if (!values) {
        return;
    }
    if (values.password.length < 8) {
        AppFeedback.warning("Customer passwords must be at least 8 characters.");
        return;
    }
    try {
        await CustomerAccounts.create(values);
        renderCustomers();
        AppFeedback.success("Customer account added.");
    } catch (error) {
        console.error("Unable to add customer:", error);
        AppFeedback.error(error.message || "The customer could not be added.");
    }
}

async function editCustomer(email) {
    const customer = CustomerAccounts.getAll().find(function (item) {
        return item.email === email;
    });
    if (!customer) {
        return;
    }
    const values = await showAdminForm("Edit customer", [
        { name: "name", label: "Full name" },
        { name: "username", label: "Username" },
        { name: "email", label: "Email address", type: "email" }
    ], customer);
    if (!values) {
        return;
    }
    try {
        CustomerAccounts.updateProfile(email, values);
        renderCustomers();
        AppFeedback.success("Customer account updated.");
    } catch (error) {
        console.error("Unable to edit customer:", error);
        AppFeedback.error(error.message || "The customer could not be updated.");
    }
}

async function removeCustomer(email) {
    if (!await confirmAdminAction("Remove customer?", "The customer account will no longer be able to sign in.")) {
        return;
    }
    try {
        CustomerAccounts.remove(email);
        renderCustomers();
        AppFeedback.success("Customer account removed.");
    } catch (error) {
        console.error("Unable to remove customer:", error);
        AppFeedback.error(error.message || "The customer could not be removed.");
    }
}

document.getElementById("add-customer-button").addEventListener("click", addCustomer);
renderCustomers();

function renderTables() {
    const box = document.getElementById("table-management-grid");
    box.replaceChildren();
    managedTables.forEach(function (table) {
        const card = document.createElement("article");
        card.className = "restaurant-table";
        const name = document.createElement("h3");
        name.textContent = table.name;
        const status = document.createElement("p");
        status.textContent = table.status;
        const actions = document.createElement("div");
        actions.className = "management-actions table-management-actions";
        actions.append(
            makeButton("Status", "management-action", function () {
                const statuses = ["Available", "Occupied", "Reserved"];
                table.status = statuses[(statuses.indexOf(table.status) + 1) % statuses.length];
                persistAndRender(MANAGEMENT_KEYS.tables, managedTables, function () {
                    renderTables();
                    renderSettings();
                });
            }),
            makeButton("Edit", "management-action", function () {
                editTable(table.id);
            }),
            makeButton("Delete", "management-action danger", function () {
                deleteTable(table.id);
            })
        );
        card.append(name, status, actions);
        box.appendChild(card);
    });
}

async function addTable() {
    const values = await showAdminForm("Add table", [
        { name: "name", label: "Table name" },
        { name: "status", label: "Status", type: "select", options: ["Available", "Occupied", "Reserved"] }
    ]);
    if (!values) {
        return;
    }
    managedTables.push({
        id: "TABLE-" + Date.now(),
        name: values.name,
        status: values.status
    });
    if (persistAndRender(MANAGEMENT_KEYS.tables, managedTables, function () {
        renderTables();
        renderSettings();
    })) {
        AppFeedback.success("Table added.");
    }
}

async function editTable(id) {
    const table = managedTables.find(function (item) {
        return item.id === id;
    });
    if (!table) {
        return;
    }
    const values = await showAdminForm("Edit table", [
        { name: "name", label: "Table name" },
        { name: "status", label: "Status", type: "select", options: ["Available", "Occupied", "Reserved"] }
    ], table);
    if (!values) {
        return;
    }
    Object.assign(table, values);
    if (persistAndRender(MANAGEMENT_KEYS.tables, managedTables, function () {
        renderTables();
        renderSettings();
    })) {
        AppFeedback.success("Table updated.");
    }
}

async function deleteTable(id) {
    if (!await confirmAdminAction("Delete table?", "This table will be removed from restaurant management.")) {
        return;
    }
    managedTables = managedTables.filter(function (table) {
        return table.id !== id;
    });
    if (persistAndRender(MANAGEMENT_KEYS.tables, managedTables, function () {
        renderTables();
        renderSettings();
    })) {
        AppFeedback.success("Table deleted.");
    }
}

document.getElementById("add-table-button").addEventListener("click", addTable);
renderTables();

function renderSettings() {
    const box = document.getElementById("restaurant-settings-box");
    box.replaceChildren();
    [
        ["Restaurant Name", restaurantSettings.name],
        ["Number of Tables", managedTables.length + (managedTables.length === 1 ? " Table" : " Tables")],
        ["Restaurant Status", restaurantSettings.status],
        ["Phone", restaurantSettings.phone || "Not set"],
        ["Address", restaurantSettings.address || "Not set"],
        ["Opening Hours", restaurantSettings.openingHours || "Not set"]
    ].forEach(function (setting) {
        const row = document.createElement("div");
        row.className = "setting-item";
        const heading = document.createElement("h3");
        heading.textContent = setting[0];
        const value = document.createElement("p");
        value.textContent = setting[1];
        row.append(heading, value);
        box.appendChild(row);
    });
    document.querySelector("#Settings .section-heading h2").textContent =
        restaurantSettings.name + " Settings";
}

document.getElementById("edit-restaurant-settings").addEventListener("click", async function () {
    const values = await showAdminForm("Edit restaurant settings", [
        { name: "name", label: "Restaurant name" },
        { name: "status", label: "Restaurant status", type: "select", options: ["Open", "Temporarily Closed", "Closed"] },
        { name: "phone", label: "Contact phone", required: false },
        { name: "address", label: "Restaurant address", required: false },
        { name: "openingHours", label: "Opening hours", required: false }
    ], restaurantSettings);
    if (!values) {
        return;
    }
    try {
        restaurantSettings = values;
        localStorage.setItem(MANAGEMENT_KEYS.settings, JSON.stringify(restaurantSettings));
        renderSettings();
        AppFeedback.success("Restaurant settings updated.");
    } catch (error) {
        console.error("Unable to save restaurant settings:", error);
        AppFeedback.error("Restaurant settings could not be saved.");
    }
});
renderSettings();


const reservationsBox = document.querySelector("#Reservations .management-box");
const activeReservationsCount = document.getElementById("active-reservations-count");

function renderReservations() {
    let reservations;

    try {
        reservations = ReservationStorage.getAll();
    } catch (error) {
        console.error("Unable to load reservations:", error);
        reservationsBox.replaceChildren();
        const errorMessage = document.createElement("p");
        errorMessage.className = "empty-reservations";
        errorMessage.textContent = "Unable to load reservations. Please check the saved reservation data.";
        reservationsBox.appendChild(errorMessage);
        activeReservationsCount.textContent = "—";
        return;
    }

    activeReservationsCount.textContent = String(reservations.filter(function (reservation) {
        return reservation.status !== "Cancelled" &&
            reservation.status !== "Seated" &&
            reservation.status !== "Declined";
    }).length);
    reservationsBox.replaceChildren();

    if (reservations.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-reservations";
        emptyMessage.textContent = "No reservations have been submitted yet.";
        reservationsBox.appendChild(emptyMessage);
        return;
    }

    reservations.forEach(function (reservation) {
        const item = document.createElement("div");
        item.className = "reservation-item";

        const heading = document.createElement("h3");
        heading.textContent = [reservation.firstName, reservation.lastName].filter(Boolean).join(" ") || "Customer";
        item.appendChild(heading);

        const details = document.createElement("div");
        details.className = "reservation-details";

        [
            ["Phone", reservation.contactNumber],
            ["WhatsApp", reservation.whatsappNumber],
            ["Email", reservation.email],
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
            details.appendChild(paragraph);
        });
        item.appendChild(details);

        const status = document.createElement("span");
        status.textContent = reservation.status || "Pending";
        item.appendChild(status);

        if (reservation.status === "Pending") {
            const actions = document.createElement("div");
            actions.className = "reservation-actions";

            [
                ["Approve", "Approved", "approve-reservation"],
                ["Decline", "Declined", "decline-reservation"]
            ].forEach(function (action) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = action[2];
                button.dataset.reservationId = reservation.id;
                button.dataset.reservationStatus = action[1];
                button.textContent = action[0];
                actions.appendChild(button);
            });

            item.appendChild(actions);
        }

        reservationsBox.appendChild(item);
    });
}

reservationsBox.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-reservation-status]");
    if (!button) {
        return;
    }

    const status = button.dataset.reservationStatus;
    const action = status === "Approved" ? "approve" : "decline";
    if (!confirm("Are you sure you want to " + action + " this reservation?")) {
        return;
    }

    try {
        ReservationStorage.updateStatus(button.dataset.reservationId, status);
        renderReservations();
    } catch (error) {
        console.error("Unable to update reservation:", error);
        AppFeedback.notify("The reservation could not be updated. Please try again.");
    }
});

window.addEventListener("storage", function (event) {
    if (event.key === "Reservations" || event.key === null) {
        renderReservations();
    }
});

renderReservations();

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

const ordersBox = document.querySelector("#Orders .management-box");
function renderOrders() {
    let orders;

    try {
        orders = OrderStorage.getAll();
    } catch (error) {
        console.error("Unable to load orders:", error);
        ordersBox.replaceChildren();
        const errorMessage = document.createElement("p");
        errorMessage.className = "empty-orders";
        errorMessage.textContent = "Unable to load customer orders.";
        ordersBox.appendChild(errorMessage);
        return;
    }

    ordersBox.replaceChildren();

    if (orders.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-orders";
        emptyMessage.textContent = "No customer orders have been submitted yet.";
        ordersBox.appendChild(emptyMessage);
        return;
    }

    orders.slice().reverse().forEach(function (order) {
        const card = document.createElement("article");
        card.className = "order-item";

        const heading = document.createElement("h3");
        heading.textContent = "Order " + order.id;
        card.appendChild(heading);

        const customer = document.createElement("p");
        customer.textContent = "Customer: " + (order.customerName || order.customerEmail || "Customer");
        card.appendChild(customer);

        const orderType = document.createElement("p");
        orderType.textContent = "Type: " + (order.orderType || "—");
        card.appendChild(orderType);

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

        const items = document.createElement("p");
        items.textContent = "Items: " + (order.items || []).map(function (item) {
            return item.quantity + " × " + item.name;
        }).join(", ");
        card.appendChild(items);

        const total = document.createElement("p");
        total.textContent = "Total: ₦" + Number(order.total || 0).toLocaleString();
        card.appendChild(total);

        const status = document.createElement("span");
        status.className = "order-status order-status-" + (order.status || "Pending").toLowerCase();
        status.textContent = order.status || "Pending";
        card.appendChild(status);

        if (order.status === "Pending") {
            const actions = document.createElement("div");
            actions.className = "order-actions";
            [
                ["Approve", "Approved"],
                ["Decline", "Declined"]
            ].forEach(function (action) {
                const button = document.createElement("button");
                button.type = "button";
                button.dataset.orderId = order.id;
                button.dataset.orderStatus = action[1];
                button.className = action[1] === "Approved" ? "approve-order" : "decline-order";
                button.textContent = action[0];
                actions.appendChild(button);
            });
            card.appendChild(actions);
        }

        ordersBox.appendChild(card);
    });
}

ordersBox.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-order-status]");
    if (!button) {
        return;
    }

    const status = button.dataset.orderStatus;
    if (!confirm("Are you sure you want to " + status.toLowerCase() + " this order?")) {
        return;
    }

    try {
        OrderStorage.updateStatus(button.dataset.orderId, status);
        renderOrders();
        AppFeedback.notify(
            status === "Approved"
                ? "Order approved and sent to the staff dashboard."
                : "Order declined. The customer will be notified.",
            status === "Approved" ? "success" : "info"
        );
    } catch (error) {
        console.error("Unable to update customer order:", error);
        AppFeedback.notify("The order could not be updated. Please try again.", "error");
    }
});

window.addEventListener("storage", function (event) {
    if (event.key === "Orders" || event.key === null) {
        renderOrders();
    }
});

renderOrders();
