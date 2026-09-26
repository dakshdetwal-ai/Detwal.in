const tradesKey = "detwal_trades";
const userKey = "detwal_user";

const addTradeBtn = document.getElementById("addTradeBtn");

const tradeModal = document.getElementById("tradeModal");
const loginModal = document.getElementById("loginModal");

const closeModal = document.getElementById("closeModal");
const closeLoginModal = document.getElementById("closeLoginModal");

const tradeForm = document.getElementById("tradeForm");
const riskReward = document.getElementById("riskReward");
const customRRGroup = document.getElementById("customRRGroup");
const customRR = document.getElementById("customRR");

const tradesTableBody = document.getElementById("tradesTableBody");
const emptyTrades = document.getElementById("emptyTrades");

const equityLine = document.getElementById("equityLine");
const equityArea = document.getElementById("equityArea");
const chartEmpty = document.getElementById("chartEmpty");


// ==============================
// STORAGE
// ==============================

function getTrades() {
    try {
        return JSON.parse(localStorage.getItem(tradesKey)) || [];
    } catch {
        return [];
    }
}

function saveTrades(trades) {
    localStorage.setItem(tradesKey, JSON.stringify(trades));
}


// ==============================
// MODALS
// ==============================

addTradeBtn.addEventListener("click", function () {
    const user = localStorage.getItem(userKey);

    if (!user) {
        loginModal.classList.remove("hidden");
        return;
    }

    tradeModal.classList.remove("hidden");
});

closeModal.addEventListener("click", function () {
    tradeModal.classList.add("hidden");
});

closeLoginModal.addEventListener("click", function () {
    loginModal.classList.add("hidden");
});

tradeModal.addEventListener("click", function (event) {
    if (event.target === tradeModal) {
        tradeModal.classList.add("hidden");
    }
});

loginModal.addEventListener("click", function (event) {
    if (event.target === loginModal) {
        loginModal.classList.add("hidden");
    }
});


// ==============================
// R:R SELECT
// ==============================

riskReward.addEventListener("change", function () {
    if (riskReward.value === "custom") {
        customRRGroup.classList.remove("hidden");
        customRR.focus();
    } else {
        customRRGroup.classList.add("hidden");
        customRR.value = "";
    }
});


// ==============================
// ADD TRADE
// ==============================

tradeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const symbol = document.getElementById("symbol").value.trim();
    const direction = document.getElementById("direction").value;
    const entry = Number(document.getElementById("entry").value);
    const exit = Number(document.getElementById("exit").value);
    const stopLoss = Number(document.getElementById("stopLoss").value);
    const takeProfit = Number(document.getElementById("takeProfit").value);
    const pnl = Number(document.getElementById("pnl").value);
    const risk = Number(document.getElementById("risk").value);
    const strategy = document.getElementById("strategy").value.trim();
    const notes = document.getElementById("notes").value.trim();

    let rr = riskReward.value;

    if (rr === "custom") {
        const customValue = Number(customRR.value);

        if (!customValue || customValue <= 0) {
            alert("Please enter a valid custom R:R.");
            return;
        }

        rr = `1:${customValue}`;
    }

    const trade = {
        id: Date.now(),
        date: new Date().toISOString(),

        symbol,
        direction,

        entry,
        exit,
        stopLoss,
        takeProfit,

        pnl,
        risk,

        rr,
        strategy,
        notes
    };

    const trades = getTrades();

    trades.push(trade);

    saveTrades(trades);

    tradeForm.reset();
    customRRGroup.classList.add("hidden");

    tradeModal.classList.add("hidden");

    renderJournal();
});


// ==============================
// R:R NUMBER
// ==============================

function getRRValue(rr) {
    if (!rr || typeof rr !== "string") {
        return null;
    }

    const parts = rr.split(":");

    if (parts.length !== 2) {
        return null;
    }

    const value = Number(parts[1]);

    return Number.isFinite(value) && value > 0 ? value : null;
}


// ==============================
// FORMAT MONEY
// ==============================

function formatPnL(value) {
    const number = Number(value) || 0;

    if (number > 0) {
        return `+₹${number.toFixed(2)}`;
    }

    if (number < 0) {
        return `-₹${Math.abs(number).toFixed(2)}`;
    }

    return "₹0.00";
}


// ==============================
// RENDER TABLE
// ==============================

function renderTradesTable(trades) {
    tradesTableBody.innerHTML = "";

    if (trades.length === 0) {
        emptyTrades.classList.remove("hidden");
        return;
    }

    emptyTrades.classList.add("hidden");

    const sortedTrades = [...trades].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedTrades.forEach(trade => {
        const row = document.createElement("tr");

        const date = new Date(trade.date);

        const formattedDate = date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const pnlClass =
            Number(trade.pnl) > 0
                ? "positive"
                : Number(trade.pnl) < 0
                    ? "negative"
                    : "";

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${escapeHTML(trade.symbol)}</td>
            <td>${escapeHTML(trade.direction)}</td>
            <td>${Number(trade.entry).toFixed(2)}</td>
            <td>${Number(trade.exit).toFixed(2)}</td>
            <td class="${pnlClass}">
                ${formatPnL(trade.pnl)}
            </td>
            <td>${escapeHTML(trade.rr || "—")}</td>
            <td>${escapeHTML(trade.strategy || "—")}</td>
        `;

        tradesTableBody.appendChild(row);
    });
}


// ==============================
// STATS
// ==============================

function renderStats(trades) {
    const totalTrades = trades.length;

    const totalPnL = trades.reduce(
        (total, trade) => total + (Number(trade.pnl) || 0),
        0
    );

    const winningTrades = trades.filter(
        trade => Number(trade.pnl) > 0
    );

    const losingTrades = trades.filter(
        trade => Number(trade.pnl) < 0
    );

    const winRate =
        totalTrades > 0
            ? (winningTrades.length / totalTrades) * 100
            : 0;

    const rrValues = trades
        .map(trade => getRRValue(trade.rr))
        .filter(value => value !== null);

    const averageRR =
        rrValues.length > 0
            ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length
            : null;

    const grossProfit = winningTrades.reduce(
        (total, trade) => total + Number(trade.pnl),
        0
    );

    const grossLoss = losingTrades.reduce(
        (total, trade) => total + Math.abs(Number(trade.pnl)),
        0
    );

    let profitFactor = "—";

    if (grossLoss > 0) {
        profitFactor = (grossProfit / grossLoss).toFixed(2);
    } else if (grossProfit > 0) {
        profitFactor = "∞";
    }

    const bestTrade =
        trades.length > 0
            ? Math.max(...trades.map(trade => Number(trade.pnl) || 0))
            : null;

    document.getElementById("totalPnl").textContent =
        formatPnL(totalPnL);

    document.getElementById("winRate").textContent =
        `${winRate.toFixed(1)}%`;

    document.getElementById("totalTrades").textContent =
        totalTrades;

    document.getElementById("averageRR").textContent =
        averageRR !== null
            ? `1:${averageRR.toFixed(2)}`
            : "—";

    document.getElementById("winningTrades").textContent =
        winningTrades.length;

    document.getElementById("losingTrades").textContent =
        losingTrades.length;

    document.getElementById("profitFactor").textContent =
        profitFactor;

    document.getElementById("bestTrade").textContent =
        bestTrade !== null
            ? formatPnL(bestTrade)
            : "—";
}


// ==============================
// EQUITY CURVE
// ==============================

function renderEquityCurve(trades) {
    if (trades.length === 0) {
        equityLine.setAttribute("points", "");
        equityArea.setAttribute("points", "");

        chartEmpty.classList.remove("hidden");

        return;
    }

    chartEmpty.classList.add("hidden");

    const sortedTrades = [...trades].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    let equity = 0;

    const equityValues = [0];

    sortedTrades.forEach(trade => {
        equity += Number(trade.pnl) || 0;
        equityValues.push(equity);
    });

    const width = 900;
    const height = 250;

    const paddingX = 10;
    const paddingY = 20;

    const minValue = Math.min(...equityValues);
    const maxValue = Math.max(...equityValues);

    let range = maxValue - minValue;

    if (range === 0) {
        range = 1;
    }

    const extraPadding = range * 0.15;

    const minY = minValue - extraPadding;
    const maxY = maxValue + extraPadding;

    const points = equityValues.map((value, index) => {
        let x;

        if (equityValues.length === 1) {
            x = width / 2;
        } else {
            x =
                paddingX +
                (index / (equityValues.length - 1)) *
                (width - paddingX * 2);
        }

        const y =
            height -
            paddingY -
            ((value - minY) / (maxY - minY)) *
            (height - paddingY * 2);

        return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const linePoints = points.join(" ");

    equityLine.setAttribute("points", linePoints);

    const areaPoints =
        `${paddingX},${height} ` +
        `${linePoints} ` +
        `${width - paddingX},${height}`;

    equityArea.setAttribute("points", areaPoints);
}


// ==============================
// HTML SAFETY
// ==============================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==============================
// MAIN RENDER
// ==============================

function renderJournal() {
    const trades = getTrades();

    renderTradesTable(trades);
    renderStats(trades);
    renderEquityCurve(trades);
}


// ==============================
// INITIAL LOAD
// ==============================

renderJournal();
