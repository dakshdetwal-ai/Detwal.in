const telegramBot = "https://t.me/detwalhelpbot";

const subscribeButton =
    document.getElementById("telegramSubscribeBtn");


if (subscribeButton) {

    subscribeButton.addEventListener("click", function (event) {

        event.preventDefault();

        window.location.href = telegramBot;

    });

}
