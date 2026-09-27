const API_URL =
    "https://detwal-news-bot.dakshdetwal10.workers.dev";

const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* ================================
   ACCOUNT / AUTH
================================ */

const accountBtn =
    document.getElementById("accountBtn");


async function updateAccountButton() {

    if (!accountBtn) return;

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {
            throw error;
        }


        const session = data?.session;


        if (session && session.user) {

            /*
             * Logged in
             */

            accountBtn.href =
                "../profile/";

            accountBtn.textContent =
                "Account";

        } else {

            /*
             * Logged out
             */

            accountBtn.href =
                "../signup/";

            accountBtn.textContent =
                "Account";
        }


    } catch (error) {

        console.error(
            "Failed to check account session:",
            error
        );

        /*
         * Safe fallback
         */

        accountBtn.href =
            "../signup/";

        accountBtn.textContent =
            "Account";
    }
}


/*
 * Check session when page loads
 */

updateAccountButton();


/*
 * Keep account button updated if
 * login/logout happens while page
 * is open.
 */

supabaseClient.auth.onAuthStateChange(
    () => {
        updateAccountButton();
    }
);


/* ================================
   NEWS ELEMENTS
================================ */

const newsName =
    document.getElementById("newsName");

const timeLeft =
    document.getElementById("timeLeft");

const previousData =
    document.getElementById("previousData");


/* ================================
   FORMAT COUNTDOWN
================================ */

function formatCountdown(targetTime) {

    const now =
        new Date().getTime();

    const target =
        new Date(targetTime).getTime();

    const difference =
        target - now;


    /* NEWS ALREADY STARTED */

    if (difference <= 0) {
        return "LIVE";
    }


    const totalSeconds =
        Math.floor(difference / 1000);

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;


    /* DAYS */

    if (days > 0) {

        return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

    }


    /* HOURS */

    if (hours > 0) {

        return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

    }


    /* MINUTES */

    if (minutes > 0) {

        return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

    }


    /* SECONDS */

    return `${seconds}s`;
}


/* ================================
   LIVE COUNTDOWN
================================ */

let countdownInterval = null;


function startCountdown(newsTime) {

    /* Stop previous countdown */

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }


    function updateCountdown() {

        timeLeft.textContent =
            formatCountdown(newsTime);

    }


    /* Update immediately */

    updateCountdown();


    /* Update every second */

    countdownInterval =
        setInterval(
            updateCountdown,
            1000
        );
}


/* ================================
   DISPLAY NEWS
================================ */

function displayNextNews(news) {

    if (!news) {

        newsName.textContent =
            "No upcoming news";

        timeLeft.textContent =
            "—";

        previousData.textContent =
            "—";

        return;
    }


    newsName.textContent =
        news.name ||
        "Unnamed News";


    previousData.textContent =
        news.previous ||
        "—";


    /* Start live countdown */

    if (news.time) {

        startCountdown(
            news.time
        );

    } else {

        timeLeft.textContent =
            "—";
    }
}


/* ================================
   LOAD NEXT NEWS
================================ */

async function loadNextNews() {

    try {

        const response =
            await fetch(
                `${API_URL}/next-news`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch news."
            );

        }


        const data =
            await response.json();


        if (
            data.success &&
            data.news
        ) {

            displayNextNews(
                data.news
            );

            return;
        }


        /* No news available */

        displayNextNews(null);

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


/* ================================
   INITIALIZE
================================ */

loadNextNews();
