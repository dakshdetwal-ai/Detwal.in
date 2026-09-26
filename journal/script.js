/* =========================================================
   DETWAL TRADING JOURNAL
   Auth: Supabase
   Trade Storage: IndexedDB
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   INDEXEDDB
========================================================= */

const DB_NAME = "DETwalJournalDB";
const DB_VERSION = 1;
const STORE_NAME = "trades";

let currentUser = null;
let currentTrades = [];


/* Open database */

function openDatabase() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = function (event) {

            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {

                const store = db.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id"
                    }
                );

                store.createIndex(
                    "user_id",
                    "user_id",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "date",
                    "date",
                    {
                        unique: false
                    }
                );
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


/* Get all trades for current user */

async function getTrades() {

    if (!currentUser) {
        return [];
    }

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.getAll();

        request.onsuccess = function () {

            const trades =
                request.result.filter(
                    trade =>
                        trade.user_id === currentUser.id
                );

            resolve(trades);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


/* Save a trade */

async function saveTrade(trade) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.put(trade);

        request.onsuccess = function () {
            resolve();
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const journalContent =
    document.getElementById("journalContent");

const journalLock =
    document.getElementById("journalLock");

const addTradeBtn =
    document.getElementById("addTradeBtn");

const loginNavBtn =
    document.getElementById("loginNavBtn");

const accountMenu =
    document.getElementById("accountMenu");

const accountButton =
    document.getElementById("accountButton");

const accountDropdown =
    document.getElementById("accountDropdown");

const logoutBtn =
    document.getElementById("logoutBtn");

const accountInitial =
    document.getElementById("accountInitial");

const accountAvatar =
    document.getElementById("accountAvatar");

const accountName =
    document.getElementById("accountName");

const dropdownName =
    document.getElementById("dropdownName");

const dropdownEmail =
    document.getElementById("dropdownEmail");

const navProfit =
    document.getElementById("navProfit");

const tradeModal =
    document.getElementById("tradeModal");

const loginModal =
    document.getElementById("loginModal");

const closeModal =
    document.getElementById("closeModal");

const closeLoginModal =
    document.getElementById("closeLoginModal");

const tradeForm =
    document.getElementById("tradeForm");

const riskReward =
    document.getElementById("riskReward");

const customRRGroup =
    document.getElementById("customRRGroup");

const customRR =
    document.getElementById("customRR");

const tradesTableBody =
    document.getElementById("tradesTableBody");

const emptyTrades =
    document.getElementById("emptyTrades");

const equityLine =
    document.getElementById("equityLine");

const equityArea =
    document.getElementById("equityArea");

const chartEmpty =
    document.getElementById("chartEmpty");


/* =========================================================
   ACCOUNT / AUTH UI
========================================================= */

function showJournal() {

    if (journalLock) {
        journalLock.style.display = "none";
    }

    if (journalContent) {
        journalContent.style.display = "block";
    }

    if (loginNavBtn) {
        loginNavBtn.style.display = "none";
    }

    if (accountMenu) {
        accountMenu.style.display = "block";
    }
}


function showJournalLock() {

    if (journalContent) {
        journalContent.style.display = "none";
    }

    if (journalLock) {
        journalLock.style.display = "flex";
    }

    if (loginNavBtn) {
        loginNavBtn.style.display = "inline-flex";
    }

    if (accountMenu) {
        accountMenu.style.display = "none";
    }
}


/* Get user's first letter */

function getInitial(name, email) {

    const value =
        name ||
        email ||
        "U";

    return value
        .trim()
        .charAt(0)
        .toUpperCase();
}


/* Format journal profit */

function formatPnL(value) {

    const number =
        Number(value) || 0;

    if (number > 0) {
        return `+₹${number.toFixed(2)}`;
    }

    if (number < 0) {
        return `-₹${Math.abs(number).toFixed(2)}`;
    }

    return "₹0.00";
}


/* Load account information */

async function loadAccount(user) {

    if (!user) {
        currentUser = null;
        currentTrades = [];

        showJournalLock();

        return;
    }

    currentUser = user;

    const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "User";

    const email =
        user.email ||
        "No email";

    const initial =
        getInitial(fullName, email);

    if (accountInitial) {
        accountInitial.textContent = initial;
    }

    if (accountAvatar) {
        accountAvatar.textContent = initial;
    }

    if (accountName) {
        accountName.textContent = fullName;
    }

    if (dropdownName) {
        dropdownName.textContent = fullName;
    }

    if (dropdownEmail) {
        dropdownEmail.textContent = email;
    }

    showJournal();

    await refreshJournal();
}


/* =========================================================
   ACCOUNT DROPDOWN
========================================================= */

if (accountButton) {

    accountButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            accountDropdown.classList.toggle(
                "active"
            );

            accountButton.classList.toggle(
                "active"
            );
        }
    );
}


document.addEventListener(
    "click",
    function (event) {

        if (
            accountMenu &&
            !accountMenu.contains(event.target)
        ) {

            accountDropdown.classList.remove(
                "active"
            );

            accountButton?.classList.remove(
                "active"
            );
        }
    }
);


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            logoutBtn.disabled = true;
            logoutBtn.textContent = "Logging out...";

            const { error } =
                await supabaseClient.auth.signOut();

            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Unable to log out right now."
                );

                logoutBtn.disabled = false;
                logoutBtn.innerHTML =
                    "<span>↪</span> Log Out";

                return;
            }

            window.location.href =
                "../home/";
        }
    );
}


/* =========================================================
   ADD TRADE BUTTON
========================================================= */

if (addTradeBtn) {

    addTradeBtn.addEventListener(
        "click",
        async function () {

            const {
                data,
                error
            } =
                await supabaseClient.auth.getSession();

            if (
                error ||
                !data.session ||
                !currentUser
            ) {

                if (loginModal) {
                    loginModal.classList.remove(
                        "hidden"
                    );
                }

                return;
            }

            if (tradeModal) {
                tradeModal.classList.remove(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   CLOSE MODALS
========================================================= */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function () {

            tradeModal.classList.add(
                "hidden"
            );
        }
    );
}


if (closeLoginModal) {

    closeLoginModal.addEventListener(
        "click",
        function () {

            loginModal.classList.add(
                "hidden"
            );
        }
    );
}


if (tradeModal) {

    tradeModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === tradeModal ||
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {

                tradeModal.classList.add(
                    "hidden"
                );
            }
        }
    );
}


if (loginModal) {

    loginModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === loginModal ||
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {

                loginModal.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   R:R SELECT
========================================================= */

if (riskReward) {

    riskReward.addEventListener(
        "change",
        function () {

            if (
                riskReward.value === "custom"
            ) {

                customRRGroup.classList.remove(
                    "hidden"
                );

                customRR.focus();

            } else {

                customRRGroup.classList.add(
                    "hidden"
                );

                customRR.value = "";
            }
        }
    );
}


/* =========================================================
   ADD TRADE
========================================================= */

if (tradeForm) {

    tradeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            /* Double-check authentication */

            const {
                data,
                error
            } =
                await supabaseClient.auth.getSession();

            if (
                error ||
                !data.session ||
                !currentUser
            ) {

                tradeModal.classList.add(
                    "hidden"
                );

                loginModal.classList.remove(
                    "hidden"
                );

                return;
            }


            /* Fields */

            const symbol =
                document
                    .getElementById("symbol")
                    .value
                    .trim()
                    .toUpperCase();

            const direction =
                document
                    .getElementById("direction")
                    .value;

            const entry =
                Number(
                    document
                        .getElementById("entry")
                        .value
                );

            const exit =
                Number(
                    document
                        .getElementById("exit")
                        .value
                );

            const stopLoss =
                Number(
                    document
                        .getElementById("stopLoss")
                        .value
                );

            const takeProfit =
                Number(
                    document
                        .getElementById("takeProfit")
                        .value
                );

            const pnl =
                Number(
                    document
                        .getElementById("pnl")
                        .value
                );

            const risk =
                Number(
                    document
                        .getElementById("risk")
                        .value
                ) || 0;

            const strategy =
                document
                    .getElementById("strategy")
                    .value
                    .trim();

            const notes =
                document
                    .getElementById("notes")
                    .value
                    .trim();


            /* R:R */

            let rr =
                riskReward.value;

            if (rr === "custom") {

                const customValue =
                    Number(
                        customRR.value
                    );

                if (
                    !customValue ||
                    customValue <= 0
                ) {

                    alert(
                        "Please enter a valid custom R:R."
                    );

                    return;
                }

                rr =
                    `1:${customValue}`;
            }


            /* Create trade */

            const trade = {

                id:
                    `${currentUser.id}_${Date.now()}_${Math.random()
                        .toString(36)
                        .slice(2, 8)}`,

                user_id:
                    currentUser.id,

                date:
                    new Date().toISOString(),

                symbol,
                direction,

                entry,
                exit,

                stopLoss:
                    Number.isFinite(stopLoss)
                        ? stopLoss
                        : 0,

                takeProfit:
                    Number.isFinite(takeProfit)
                        ? takeProfit
                        : 0,

                pnl,

                risk,

                rr,

                strategy,

                notes
            };


            /* Save to IndexedDB */

            try {

                await saveTrade(trade);

            } catch (storageError) {

                console.error(
                    "IndexedDB error:",
                    storageError
                );

                alert(
                    "Could not save this trade on your device."
                );

                return;
            }


            /* Reset */

            tradeForm.reset();

            customRRGroup.classList.add(
                "hidden"
            );

            tradeModal.classList.add(
                "hidden"
            );


            /* Refresh */

            await refreshJournal();
        }
    );
}


/* =========================================================
   R:R NUMBER
========================================================= */

function getRRValue(rr) {

    if (
        !rr ||
        typeof rr !== "string"
    ) {
        return null;
    }

    const parts =
        rr.split(":");

    if (parts.length !== 2) {
        return null;
    }

    const value =
        Number(parts[1]);

    return Number.isFinite(value) &&
        value > 0
        ? value
        : null;
}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTradesTable(trades) {

    tradesTableBody.innerHTML = "";


    if (trades.length === 0) {

        emptyTrades.classList.remove(
            "hidden"
        );

        return;
    }


    emptyTrades.classList.add(
        "hidden"
    );


    const sortedTrades =
        [...trades].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    sortedTrades.forEach(
        trade => {

            const row =
                document.createElement(
                    "tr"
                );


            const date =
                new Date(trade.date);


            const formattedDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            const pnlClass =
                Number(trade.pnl) > 0
                    ? "positive"
                    : Number(trade.pnl) < 0
                        ? "negative"
                        : "";


            row.innerHTML = `

                <td>
                    ${formattedDate}
                </td>

                <td>
                    ${escapeHTML(
                        trade.symbol
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        trade.direction
                    )}
                </td>

                <td>
                    ${Number(
                        trade.entry
                    ).toFixed(2)}
                </td>

                <td>
                    ${Number(
                        trade.exit
                    ).toFixed(2)}
                </td>

                <td class="${pnlClass}">
                    ${formatPnL(
                        trade.pnl
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        trade.rr || "—"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        trade.strategy || "—"
                    )}
                </td>

            `;


            tradesTableBody.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   STATS
========================================================= */

function renderStats(trades) {

    const totalTrades =
        trades.length;


    const totalPnL =
        trades.reduce(
            (total, trade) =>
                total +
                (Number(trade.pnl) || 0),
            0
        );


    const winningTrades =
        trades.filter(
            trade =>
                Number(trade.pnl) > 0
        );


    const losingTrades =
        trades.filter(
            trade =>
                Number(trade.pnl) < 0
        );


    const winRate =
        totalTrades > 0
            ? (
                winningTrades.length /
                totalTrades
            ) * 100
            : 0;


    const rrValues =
        trades
            .map(
                trade =>
                    getRRValue(
                        trade.rr
                    )
            )
            .filter(
                value =>
                    value !== null
            );


    const averageRR =
        rrValues.length > 0
            ? rrValues.reduce(
                (a, b) =>
                    a + b,
                0
            ) / rrValues.length
            : null;


    const grossProfit =
        winningTrades.reduce(
            (total, trade) =>
                total +
                Number(trade.pnl),
            0
        );


    const grossLoss =
        losingTrades.reduce(
            (total, trade) =>
                total +
                Math.abs(
                    Number(trade.pnl)
                ),
            0
        );


    let profitFactor =
        "—";


    if (grossLoss > 0) {

        profitFactor =
            (
                grossProfit /
                grossLoss
            ).toFixed(2);

    } else if (
        grossProfit > 0
    ) {

        profitFactor =
            "∞";
    }


    const bestTrade =
        trades.length > 0
            ? Math.max(
                ...trades.map(
                    trade =>
                        Number(
                            trade.pnl
                        ) || 0
                )
            )
            : null;


    document.getElementById(
        "totalPnl"
    ).textContent =
        formatPnL(totalPnL);


    document.getElementById(
        "winRate"
    ).textContent =
        `${winRate.toFixed(1)}%`;


    document.getElementById(
        "totalTrades"
    ).textContent =
        totalTrades;


    document.getElementById(
        "averageRR"
    ).textContent =
        averageRR !== null
            ? `1:${averageRR.toFixed(2)}`
            : "—";


    document.getElementById(
        "winningTrades"
    ).textContent =
        winningTrades.length;


    document.getElementById(
        "losingTrades"
    ).textContent =
        losingTrades.length;


    document.getElementById(
        "profitFactor"
    ).textContent =
        profitFactor;


    document.getElementById(
        "bestTrade"
    ).textContent =
        bestTrade !== null
            ? formatPnL(bestTrade)
            : "—";


    /* Update navbar profit */

    if (navProfit) {

        navProfit.textContent =
            formatPnL(totalPnL);
    }
}


/* =========================================================
   EQUITY CURVE
========================================================= */

function renderEquityCurve(trades) {

    if (trades.length === 0) {

        equityLine.setAttribute(
            "points",
            ""
        );

        equityArea.setAttribute(
            "points",
            ""
        );

        chartEmpty.classList.remove(
            "hidden"
        );

        return;
    }


    chartEmpty.classList.add(
        "hidden"
    );


    const sortedTrades =
        [...trades].sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    let equity = 0;

    const equityValues = [0];


    sortedTrades.forEach(
        trade => {

            equity +=
                Number(trade.pnl) || 0;

            equityValues.push(
                equity
            );
        }
    );


    const width = 900;
    const height = 250;

    const paddingX = 10;
    const paddingY = 20;


    const minValue =
        Math.min(
            ...equityValues
        );


    const maxValue =
        Math.max(
            ...equityValues
        );


    let range =
        maxValue -
        minValue;


    if (range === 0) {
        range = 1;
    }


    const extraPadding =
        range * 0.15;


    const minY =
        minValue -
        extraPadding;


    const maxY =
        maxValue +
        extraPadding;


    const points =
        equityValues.map(
            (value, index) => {

                let x;


                if (
                    equityValues.length === 1
                ) {

                    x =
                        width / 2;

                } else {

                    x =
                        paddingX +
                        (
                            index /
                            (
                                equityValues.length -
                                1
                            )
                        ) *
                        (
                            width -
                            paddingX * 2
                        );
                }


                const y =
                    height -
                    paddingY -
                    (
                        (
                            value -
                            minY
                        ) /
                        (
                            maxY -
                            minY
                        )
                    ) *
                    (
                        height -
                        paddingY * 2
                    );


                return `${x.toFixed(2)},${y.toFixed(2)}`;
            }
        );


    const linePoints =
        points.join(" ");


    equityLine.setAttribute(
        "points",
        linePoints
    );


    const areaPoints =
        `${paddingX},${height} ` +
        `${linePoints} ` +
        `${width - paddingX},${height}`;


    equityArea.setAttribute(
        "points",
        areaPoints
    );
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   REFRESH JOURNAL
========================================================= */

async function refreshJournal() {

    if (!currentUser) {
        return;
    }


    try {

        currentTrades =
            await getTrades();

        renderTradesTable(
            currentTrades
        );

        renderStats(
            currentTrades
        );

        renderEquityCurve(
            currentTrades
        );

    } catch (error) {

        console.error(
            "Could not load journal:",
            error
        );

        currentTrades = [];

        renderTradesTable([]);

        renderStats([]);

        renderEquityCurve([]);
    }
}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        if (session?.user) {

            await loadAccount(
                session.user
            );

        } else {

            currentUser = null;
            currentTrades = [];

            showJournalLock();
        }
    }
);


/* =========================================================
   INITIAL AUTH CHECK
========================================================= */

async function initializeJournal() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            showJournalLock();

            return;
        }


        if (data?.session?.user) {

            await loadAccount(
                data.session.user
            );

        } else {

            showJournalLock();
        }

    } catch (error) {

        console.error(
            "Journal initialization error:",
            error
        );

        showJournalLock();
    }
}


/* =========================================================
   START
========================================================= */

initializeJournal();
