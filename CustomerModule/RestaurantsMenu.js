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

SubmitReservation.addEventListener("click", function () {

    if (
        FirstName.value === "" ||
        LastName.value === "" ||
        WhatsappNumber.value === "" ||
        ContactNumber.value === "" ||
        Email.value === "" ||
        Date.value === "" ||
        Time.value === "" ||
        PartySize.value === ""
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    alert("Your table reservation was submitted successfully!");

});