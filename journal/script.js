const addTradeBtn = document.getElementById("addTradeBtn");
const tradeModal = document.getElementById("tradeModal");
const closeModal = document.getElementById("closeModal");
const tradeForm = document.getElementById("tradeForm");
const tradesTable = document.getElementById("tradesTable");

let trades = JSON.parse(localStorage.getItem("detwal_trades")) || [];

addTradeBtn.addEventListener("click", () => {
    tradeModal.classList.add("active");
});

closeModal.addEventListener("click", () => {
    tradeModal.classList.remove("active");
});

tradeModal.addEventListener("click", (event) => {
    if (event.target === tradeModal) {
        tradeModal.classList.remove("active");
    }
});

tradeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const trade = {
        date: new Date().toLocaleDateString(),
        symbol: document.getElementById("symbol").value.toUpperCase(),
        direction: document.getElementById("direction").value,
        entry: Number(document.getElementById("entry").value),
        exit: Number(document.getElementById("exit").value),
        stopLoss: Number(document.getElementById("stopLoss").value) || 0,
        takeProfit: Number(document.getElementById("takeProfit").value) || 0,
        pnl: Number(document.getElementById("pnl").value),
        risk: Number(document.getElementById("risk").value) || 0,
        strategy: document.getElementById("strategy").value,
        notes: document.getElementById("notes").value
    };

    trades.push(trade);

    localStorage.setItem(
        "detwal_trades",
        JSON.stringify(trades)
    );

    tradeForm.reset();
    tradeModal.classList.remove("active");

    renderTrades();
    updateStats();
});

function renderTrades() {

    if (trades.length === 0) {
        tradesTable.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">
                    No trades recorded yet.
                    Click <strong>+ Add Trade</strong>
                    to create your first entry.
                </td>
            </tr>
        `;
        return;
    }

    tradesTable.innerHTML = trades
        .slice()
        .reverse()
        .map(trade => {

            const rr =
                trade.stopLoss && trade.takeProfit
                    ? Math.abs(
                        (trade.takeProfit - trade.entry) /
                        (trade.entry - trade.stopLoss)
                    ).toFixed(2)
                    : "—";

            return `
                <tr>
                    <td>${trade.date}</td>
                    <td>${trade.symbol}</td>
                    <td>${trade.direction}</td>
                    <td>${trade.entry}</td>
                    <td>${trade.exit}</td>
                    <td>${rr}</td>
                    <td>${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}</td>
                </tr>
            `;
        })
        .join("");
}

function updateStats() {

    const totalTrades = trades.length;

    const totalPnl = trades.reduce(
        (sum, trade) => sum + trade.pnl,
        0
    );

    const winningTrades = trades.filter(
        trade => trade.pnl > 0
    ).length;

    const losingTrades = trades.filter(
        trade => trade.pnl < 0
    ).length;

    const winRate =
        totalTrades > 0
            ? (winningTrades / totalTrades) * 100
            : 0;

    const grossProfit = trades
        .filter(trade => trade.pnl > 0)
        .reduce((sum, trade) => sum + trade.pnl, 0);

    const grossLoss = Math.abs(
        trades
            .filter(trade => trade.pnl < 0)
            .reduce((sum, trade) => sum + trade.pnl, 0)
    );

    const profitFactor =
        grossLoss > 0
            ? grossProfit / grossLoss
            : grossProfit > 0
                ? grossProfit
                : 0;

    const bestTrade =
        trades.length > 0
            ? Math.max(...trades.map(trade => trade.pnl))
            : 0;

    document.getElementById("totalTrades").textContent =
        totalTrades;

    document.getElementById("totalPnl").textContent =
        `$${totalPnl.toFixed(2)}`;

    document.getElementById("winRate").textContent =
        `${winRate.toFixed(1)}%`;

    document.getElementById("winningTrades").textContent =
        winningTrades;

    document.getElementById("losingTrades").textContent =
        losingTrades;

    document.getElementById("profitFactor").textContent =
        profitFactor.toFixed(2);

    document.getElementById("bestTrade").textContent =
        `$${bestTrade.toFixed(2)}`;

    document.getElementById("averageRR").textContent =
        "—";
}

renderTrades();
updateStats();
