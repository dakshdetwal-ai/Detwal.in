const whatsappLink =
    "https://chat.whatsapp.com/J1zCNyN068J7lMidiixMVU";

const joinButtons = [
    document.getElementById("joinCommunity"),
    document.getElementById("joinCommunityBottom")
];

joinButtons.forEach(button => {
    if (!button) return;

    button.addEventListener("click", function (event) {
        event.preventDefault();

        window.open(
            whatsappLink,
            "_blank",
            "noopener,noreferrer"
        );
    });
});
