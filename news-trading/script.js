const API_URL =
    "https://detwal-help-bot.dakshdetwal10.workers.dev";

const newsName = document.getElementById("newsName");
const timeLeft = document.getElementById("timeLeft");
const previousData = document.getElementById("previousData");


/*
    TEMPORARY NEWS DATA

    This will later be replaced by data
    added through the DETwal Telegram bot
    using /addnextnews.
*/

const nextNews = {
    name: "Non-Farm Payrolls",
    timeLeft: "02h 34m",
    previous: "—"
};


/* DISPLAY NEXT NEWS */

function displayNextNews() {

    newsName.textContent =
        nextNews.name || "No upcoming news";

    timeLeft.textContent =
        nextNews.timeLeft || "—";

    previousData.textContent =
        nextNews.previous || "—";
}


/*
    FUTURE API FUNCTION

    The Telegram bot will save the upcoming
    news on the Cloudflare Worker.

    We will connect this function after
    the Telegram /addnextnews system is built.
*/

async function loadNextNews() {

    try {

        /*
        const response = await fetch(
            `${API_URL}/next-news`
        );

        const data = await response.json();

        if (data.success && data.news) {

            newsName.textContent =
                data.news.name;

            timeLeft.textContent =
                data.news.timeLeft;

            previousData.textContent =
                data.news.previous;

            return;
        }
        */

        displayNextNews();

    } catch (error) {

        console.error(
            "Failed to load upcoming news:",
            error
        );

        newsName.textContent =
            "Unable to load news";

        timeLeft.textContent =
            "—";

        previousData.textContent =
            "—";
    }
}


/* INITIALIZE */

loadNextNews();
