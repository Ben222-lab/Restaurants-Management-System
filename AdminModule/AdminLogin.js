const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const ShowPassword = document.getElementById("ShowPassword");
const AdminLogin = document.getElementById("StaffLogin");


// Show Password
ShowPassword.addEventListener("change", function () {

    if (ShowPassword.checked) {
        Password.type = "text";
    } else {
        Password.type = "password";
    }

});


AdminLogin.addEventListener("click", function (event) {

    event.preventDefault();

    const username = Username.value.trim();
    const password = Password.value.trim();


    if (username === "") {
        AppFeedback.notify("Please enter your username.");
        Username.focus();
        return;
    }


    if (password === "") {
        AppFeedback.notify("Please enter your password.");
        Password.focus();
        return;
    }


    if (username === "Benjamin" && password === "12345") {

        window.location.href = "./Admin.html";

    } else {

        AppFeedback.notify("Invalid username or password.");

    }

});