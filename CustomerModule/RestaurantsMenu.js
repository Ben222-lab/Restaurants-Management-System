const FirstName = document.getElementById("FirstName");
const LastName = document.getElementById("LastName");
const WhatsappNumber = document.getElementById("WhatsappNumber");
const ContactNumber = document.getElementById("ContactNumber");
const Email = document.getElementById("Email");
const Date = document.getElementById("Date");
const Time = document.getElementById("Time");
const PartySize = document.getElementById("PartySize");
const Occasion = document.getElementById("Occasion");
const SubmitReservation = document.getElementById("SubmitReservation");

if (SubmitReservation) {
    SubmitReservation.addEventListener("click", function (event) {
        event.preventDefault();

        const firstName = FirstName.value.trim();
        const lastName = LastName.value.trim();
        const whatsappNumber = WhatsappNumber.value.trim();
        const contactNumber = ContactNumber.value.trim();
        const email = Email.value.trim();
        const date = Date.value;
        const time = Time.value;
        const partySize = PartySize.value;
        const occasion = Occasion.value;

        if (firstName === "") {
            alert("Please enter your first name.");
            FirstName.focus();
            return;
        }

        if (lastName === "") {
            alert("Please enter your last name.");
            LastName.focus();
            return;
        }

        if (whatsappNumber === "") {
            alert("Please enter your WhatsApp number.");
            WhatsappNumber.focus();
            return;
        }

        if (contactNumber === "") {
            alert("Please enter your contact number.");
            ContactNumber.focus();
            return;
        }

        if (email === "") {
            alert("Please enter your email address.");
            Email.focus();
            return;
        }

        if (date === "") {
            alert("Please select a date.");
            Date.focus();
            return;
        }

        if (time === "") {
            alert("Please select a time.");
            Time.focus();
            return;
        }

        if (partySize === "") {
            alert("Please enter the party size.");
            PartySize.focus();
            return;
        }

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
            status: "Pending",
            createdAt: new Date().toLocaleString()
        };

        let reservations = JSON.parse(localStorage.getItem("Reservations")) || [];

        reservations.push(reservation);

        localStorage.setItem("Reservations", JSON.stringify(reservations));

        alert("Your table reservation was submitted successfully!");

        FirstName.value = "";
        LastName.value = "";
        WhatsappNumber.value = "";
        ContactNumber.value = "";
        Email.value = "";
        Date.value = "";
        Time.value = "";
        PartySize.value = "";
        Occasion.value = "";
    });
}


const toggleOptions = document.querySelectorAll(".toggle-option");

let selectedOrderType = "Dine-in";

toggleOptions.forEach(function (option) {

    option.addEventListener("click", function () {

        toggleOptions.forEach(function (item) {
            item.classList.remove("active");
        });

        option.classList.add("active");

        const radio = option.querySelector("input[type='radio']");

        if (radio) {
            radio.checked = true;
            selectedOrderType = radio.value;
        } else {
            selectedOrderType = option.textContent.trim();
        }

        const optionText = option.textContent.trim().toLowerCase();

        const allForms = document.querySelectorAll(".order-type-form");

        allForms.forEach(function (form) {
            form.classList.add("hidden");
        });

        if (
            optionText.includes("takeaway") ||
            optionText.includes("take away") ||
            optionText.includes("pick up") ||
            optionText.includes("pickup")
        ) {

            const takeawayForm =
                document.getElementById("takeawayForm") ||
                document.getElementById("TakeawayForm") ||
                document.querySelector(".takeaway-form") ||
                document.querySelector(".Takeaway_form");

            if (takeawayForm) {
                takeawayForm.classList.remove("hidden");
            }

        } else {

            const dineInForm =
                document.getElementById("dineInForm") ||
                document.getElementById("DineInForm") ||
                document.querySelector(".dine-in-form") ||
                document.querySelector(".Dine_in_form");

            if (dineInForm) {
                dineInForm.classList.remove("hidden");
            }
        }
    });
});


const cart = [
    {
        id: 1,
        name: "Jollof Rice",
        price: 10000,
        quantity: 1
    },
    {
        id: 2,
        name: "Fried Rice",
        price: 15000,
        quantity: 1
    }
];


const cartList = document.querySelector(".cart-list");

const subtotalElement =
    document.getElementById("Subtotal") ||
    document.querySelector(".subtotal");

const totalElement =
    document.getElementById("Total") ||
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


    const decreaseButtons =
        document.querySelectorAll(".decrease-btn");

    const increaseButtons =
        document.querySelectorAll(".increase-btn");


    decreaseButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const id = Number(button.dataset.id);

            const item = cart.find(function (product) {
                return product.id === id;
            });

            if (!item) {
                return;
            }

            item.quantity--;

            if (item.quantity <= 0) {

                const index = cart.findIndex(function (product) {
                    return product.id === id;
                });

                cart.splice(index, 1);
            }

            displayCart();
        });
    });


    increaseButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const id = Number(button.dataset.id);

            const item = cart.find(function (product) {
                return product.id === id;
            });

            if (!item) {
                return;
            }

            item.quantity++;

            displayCart();
        });
    });


    updateTotal();
}


function updateTotal() {

    let subtotal = 0;

    cart.forEach(function (item) {

        subtotal += item.price * item.quantity;
    });


    if (subtotalElement) {

        subtotalElement.textContent =
            "₦" + subtotal.toLocaleString();
    }


    if (totalElement) {

        totalElement.textContent =
            "₦" + subtotal.toLocaleString();
    }
}


const placeOrderButton =
    document.querySelector(".btn-primary");


if (placeOrderButton) {

    placeOrderButton.addEventListener("click", function (event) {

        event.preventDefault();


        if (cart.length === 0) {

            alert("Please add at least one item to your order.");

            return;
        }


        const selectedRadio =
            document.querySelector(
                ".toggle-option input[type='radio']:checked"
            );


        if (selectedRadio) {
            selectedOrderType = selectedRadio.value;
        }


        const order = {

            id: "ORD-" + Date.now(),

            orderType: selectedOrderType,

            items: JSON.parse(JSON.stringify(cart)),

            total: cart.reduce(function (total, item) {

                return total +
                    item.price * item.quantity;

            }, 0),

            status: "Pending",

            createdAt: new Date().toLocaleString()
        };


        const takeawayForm =
            document.getElementById("takeawayForm") ||
            document.getElementById("TakeawayForm") ||
            document.querySelector(".takeaway-form") ||
            document.querySelector(".Takeaway_form");


        const isTakeaway =
            selectedOrderType.toLowerCase().includes("takeaway") ||
            selectedOrderType.toLowerCase().includes("take away") ||
            selectedOrderType.toLowerCase().includes("pickup") ||
            selectedOrderType.toLowerCase().includes("pick up");


        if (isTakeaway && takeawayForm) {

            const inputs =
                takeawayForm.querySelectorAll(
                    "input, textarea, select"
                );


            const takeawayDetails = {};


            inputs.forEach(function (input) {

                if (
                    input.type !== "radio" &&
                    input.type !== "checkbox"
                ) {

                    if (input.value.trim() !== "") {

                        const key =
                            input.name ||
                            input.id ||
                            "field";

                        takeawayDetails[key] =
                            input.value.trim();
                    }
                }
            });


            order.customerDetails =
                takeawayDetails;
        }


        let orders =
            JSON.parse(
                localStorage.getItem("Orders")
            ) || [];


        orders.push(order);


        localStorage.setItem(
            "Orders",
            JSON.stringify(orders)
        );


        if (feedbackMsg) {

            feedbackMsg.textContent =
                "Your order has been placed successfully!";

            feedbackMsg.style.color =
                "#28a745";
        }


        alert("Your order has been placed successfully!");


        cart.length = 0;

        displayCart();
    });
}


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