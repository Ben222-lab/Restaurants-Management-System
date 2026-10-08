const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const ShowPassword = document.getElementById("ShowPassword");
const StaffLogin = document.getElementById("StaffLogin");


// Show Password
ShowPassword.addEventListener("change", function () {

    if (ShowPassword.checked) {
        Password.type = "text";
    } else {
        Password.type = "password";
    }

});

// Staff Login
StaffLogin.addEventListener("click", function (event) {

    event.preventDefault();

    const username = Username.value.trim();
    const password = Password.value.trim();


    if (username === "") {
        alert("Please enter your username.");
        Username.focus();
        return;
    }


    if (password === "") {
        alert("Please enter your password.");
        Password.focus();
        return;
    }


    if (username === "Benjamin" && password === "12345") {

        window.location.href = "../StaffModule/staff.html";

    } else {

        alert("Invalid username or password.");

    }

});