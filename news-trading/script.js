const API_URL =
    "https://detwal-news-bot.dakshdetwal10.workers.dev";

const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";


const supabaseClient =
    window.supabase.createClient(
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


        const session =
            data?.session;


        if (
            session &&
            session.user
        ) {

            accountBtn.href =
                "../profile/";

            accountBtn.textContent =
                "Account";

        } else {

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


        accountBtn.href =
            "../signup/";

        accountBtn.textContent =
            "Account";
    }
}


updateAccountButton();


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

const dynamicNewsName =
    document.getElementById(
        "dynamicNewsName"
    );

const timeLeft =
    document.getElementById("timeLeft");

const previousData =
    document.getElementById(
        "previousData"
    );



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


    if (difference <= 0) {

        return "LIVE";

    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


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



    if (days > 0) {

        return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

    }


    if (hours > 0) {

        return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

    }


    if (minutes > 0) {

        return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

    }


    return `${seconds}s`;
}



/* ================================
   LIVE COUNTDOWN
================================ */

let countdownInterval = null;


function startCountdown(newsTime) {

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }


    function updateCountdown() {

        if (!timeLeft) return;

        timeLeft.textContent =
            formatCountdown(
                newsTime
            );
    }


    updateCountdown();


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

        if (newsName) {

            newsName.textContent =
                "No upcoming news";

        }


        if (dynamicNewsName) {

            dynamicNewsName.textContent =
                "No upcoming news";

        }


        if (timeLeft) {

            timeLeft.textContent =
                "—";

        }


        if (previousData) {

            previousData.textContent =
                "—";

        }

        return;
    }


    const currentNewsName =
        news.name ||
        "Unnamed News";


    /*
     * Main dashboard heading
     */

    if (newsName) {

        newsName.textContent =
            currentNewsName;

    }


    /*
     * Event card heading
     */

    if (dynamicNewsName) {

        dynamicNewsName.textContent =
            currentNewsName;

    }


    /*
     * Previous data
     */

    if (previousData) {

        previousData.textContent =
            news.previous ||
            "—";

    }


    /*
     * Start live countdown
     */

    if (news.time) {

        startCountdown(
            news.time
        );

    } else {

        if (timeLeft) {

            timeLeft.textContent =
                "—";

        }
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


        displayNextNews(
            null
        );


    } catch (error) {

        console.error(
            "Failed to load upcoming news:",
            error
        );


        if (newsName) {

            newsName.textContent =
                "Unable to load news";

        }


        if (dynamicNewsName) {

            dynamicNewsName.textContent =
                "Unable to load news";

        }


        if (timeLeft) {

            timeLeft.textContent =
                "—";

        }


        if (previousData) {

            previousData.textContent =
                "—";

        }
    }
}



/* ================================
   INITIALIZE
================================ */

loadNextNews();
