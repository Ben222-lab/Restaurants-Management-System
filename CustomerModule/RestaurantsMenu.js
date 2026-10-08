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


// Table Reservation
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


    alert("Your table reservation was submitted successfully!");

});