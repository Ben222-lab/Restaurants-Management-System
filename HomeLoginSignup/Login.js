const Email = document.getElementById("Email");
const Password = document.getElementById("Password");
const LoginButton = document.getElementById("LoginButton");


// Customer Login
LoginButton.addEventListener("click", function (event) {

    event.preventDefault();

    const email = Email.value.trim();
    const password = Password.value.trim();


    if (email === "") {
        alert("Please enter your email.");
        Email.focus();
        return;
    }


    if (password === "") {
        alert("Please enter your password.");
        Password.focus();
        return;
    }


    if (email === "benjaminajao02@gmail.com" && password === "12345") {

        window.open("../CustomerModule/RestaurantsMenu.html", "_blank");

    } else {

        alert("Invalid email or password.");

    }

});