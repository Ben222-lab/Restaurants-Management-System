const menuButtons = document.querySelectorAll(".admin-section button");
const menuItems = document.querySelectorAll(".menu-item");

menuButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        if (button.innerText === "Add Menu Item") {

            const MenuName = prompt("Enter menu item name:");
            const MenuPrice = prompt("Enter menu item price:");

            if (MenuName === "" || MenuPrice === "") {
                alert("Please enter all information");
                return;
            }

            if (MenuName === null || MenuPrice === null) {
                return;
            }

            const managementBox = button.parentElement.parentElement.querySelector(".management-box");

            const newMenu = document.createElement("div");

            newMenu.className = "menu-item";

            newMenu.innerHTML = `
                <div>
                    <h3>${MenuName}</h3>
                    <p>₦${MenuPrice}</p>
                </div>

                <div>
                    <button>Edit</button>
                    <button>Delete</button>
                </div>
            `;

            managementBox.appendChild(newMenu);

            alert("Menu item added successfully");

        }

    });

});


document.addEventListener("click", function (event) {

    if (event.target.innerText === "Delete") {

        const menuItem = event.target.closest(".menu-item");

        if (menuItem) {

            const confirmDelete = confirm("Are you sure you want to delete this menu item?");

            if (confirmDelete) {

                menuItem.remove();

                alert("Menu item deleted successfully");

            }

        }

    }

});


document.addEventListener("click", function (event) {

    if (event.target.innerText === "Edit") {

        const menuItem = event.target.closest(".menu-item");

        if (menuItem) {

            const name = menuItem.querySelector("h3");
            const price = menuItem.querySelector("p");

            const newName = prompt("Enter new menu name:", name.innerText);
            const newPrice = prompt("Enter new price:", price.innerText.replace("₦", ""));

            if (newName === null || newPrice === null) {
                return;
            }

            if (newName === "" || newPrice === "") {
                alert("Please enter all information");
                return;
            }

            name.innerText = newName;
            price.innerText = "₦" + newPrice;

            alert("Menu item updated successfully");

        }

    }

});


const tableItems = document.querySelectorAll(".restaurant-table");

tableItems.forEach(function (table) {

    table.addEventListener("click", function () {

        const status = table.querySelector("p");

        if (status.innerText === "Available") {

            status.innerText = "Occupied";

        } else if (status.innerText === "Occupied") {

            status.innerText = "Reserved";

        } else {

            status.innerText = "Available";

        }

    });

});


const orderItems = document.querySelectorAll(".order-item");

orderItems.forEach(function (order) {

    order.addEventListener("click", function () {

        const status = order.querySelector("span");

        if (status.innerText === "Pending") {

            status.innerText = "Preparing";

        } else if (status.innerText === "Preparing") {

            status.innerText = "Completed";

        }

    });

});


const logout = document.querySelector(".logout-btn a");

logout.addEventListener("click", function (event) {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) {

        event.preventDefault();

    }

});
```
