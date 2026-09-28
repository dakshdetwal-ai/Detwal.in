/* =========================================================
   DETWAL TRADING JOURNAL V2
   Supabase = authentication only
   IndexedDB = accounts + trades + screenshots
   ========================================================= */

const SUPABASE_URL = "https://evsnwenvmwhrohyzrjgq.supabase.co";
const SUPABASE_KEY = "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const DB_NAME = "DETwalJournalDB";
const DB_VERSION = 2;

let currentUser = null;
let accounts = [];
let currentAccount = null;
let currentTrades = [];
let editingTradeId = null;
let pendingScreenshot = null;


/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function currencySymbol(currency) {
    return {
        USD: "$",
        EUR: "€",
        GBP: "£",
        INR: "₹"
    }[currency] || "$";
}

function money(value, currency = "USD") {
    const number = Number(value) || 0;

    const sign =
        number > 0 ? "+" :
        number < 0 ? "-" :
        "";

    return `${sign}${currencySymbol(currency)}${Math.abs(number).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;
}

function plainMoney(value, currency = "USD") {
    return `${currencySymbol(currency)}${Math.abs(Number(value) || 0).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;
}

function getUserName() {
    return (
        currentUser?.user_metadata?.full_name ||
        currentUser?.user_metadata?.name ||
        "User"
    );
}

function getInitial() {
    return (
        getUserName() ||
        currentUser?.email ||
        "U"
    ).trim().charAt(0).toUpperCase();
}


/* =========================================================
   DOM REFERENCES
========================================================= */

const journalContent = $("journalContent");
const journalLock = $("journalLock");

const loginNavBtn = $("loginNavBtn");
const accountMenu = $("accountMenu");
const accountButton = $("accountButton");
const accountDropdown = $("accountDropdown");
const logoutBtn = $("logoutBtn");

const accountInitial = $("accountInitial");
const accountAvatar = $("accountAvatar");
const accountName = $("accountName");
const dropdownName = $("dropdownName");
const dropdownEmail = $("dropdownEmail");
const navProfit = $("navProfit");

const addTradeBtn = $("addTradeBtn");

const loginModal = $("loginModal");
const closeLoginModal = $("closeLoginModal");

const tradeModal = $("tradeModal");
const closeModal = $("closeModal");
const tradeForm = $("tradeForm");

const accountModal = $("accountModal");
const closeAccountModal = $("closeAccountModal");
const accountForm = $("accountForm");

const accountSelect = $("accountSelect");
const addAccountBtn = $("addAccountBtn");
const manageAccountBtn = $("manageAccountBtn");
const deleteAccountBtn = $("deleteAccountBtn");
const saveAccountBtn = $("saveAccountBtn");

const exportJsonBtn = $("exportJsonBtn");
const exportCsvBtn = $("exportCsvBtn");
const importBtn = $("importBtn");
const importFile = $("importFile");

const riskReward = $("riskReward");
const customRRGroup = $("customRRGroup");
const customRR = $("customRR");

const screenshotInput = $("screenshot");
const screenshotPreview = $("screenshotPreview");
const removeScreenshotBtn = $("removeScreenshotBtn");

const tradesTableBody = $("tradesTableBody");
const emptyTrades = $("emptyTrades");

const viewTradeModal = $("viewTradeModal");
const closeViewTradeModal = $("closeViewTradeModal");
const viewTradeContent = $("viewTradeContent");
const viewTradeTitle = $("viewTradeTitle");


/* =========================================================
   SHOW / HIDE JOURNAL
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

function showLock() {
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


/* =========================================================
   INDEXEDDB
========================================================= */

function openDB() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = event => {

            const db = event.target.result;

            /* Accounts */

            if (!db.objectStoreNames.contains("accounts")) {

                const store = db.createObjectStore(
                    "accounts",
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
            }


            /* Trades */

            if (!db.objectStoreNames.contains("trades")) {

                const store = db.createObjectStore(
                    "trades",
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
                    "account_id",
                    "account_id",
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

            } else {

                const store =
                    event.target.transaction.objectStore(
                        "trades"
                    );

                if (!store.indexNames.contains("account_id")) {

                    store.createIndex(
                        "account_id",
                        "account_id",
                        {
                            unique: false
                        }
                    );
                }

                if (!store.indexNames.contains("user_id")) {

                    store.createIndex(
                        "user_id",
                        "user_id",
                        {
                            unique: false
                        }
                    );
                }
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


function dbRequest(
    storeName,
    mode,
    callback
) {

    return openDB().then(db => {

        return new Promise((resolve, reject) => {

            const transaction =
                db.transaction(
                    storeName,
                    mode
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            let request;

            try {

                request = callback(store);

            } catch (error) {

                reject(error);
                return;
            }

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    });
}


function getAll(storeName) {
    return dbRequest(
        storeName,
        "readonly",
        store => store.getAll()
    );
}


function put(storeName, value) {
    return dbRequest(
        storeName,
        "readwrite",
        store => store.put(value)
    );
}


function deleteRecord(storeName, id) {
    return dbRequest(
        storeName,
        "readwrite",
        store => store.delete(id)
    );
}


/* =========================================================
   ACCOUNT LOADING
========================================================= */

async function loadAccounts() {

    if (!currentUser) {
        return;
    }

    accounts = (
        await getAll("accounts")
    ).filter(
        account =>
            account.user_id === currentUser.id
    );


    /* Create default account */

    if (!accounts.length) {

        const defaultAccount = {

            id: uid("account"),

            user_id: currentUser.id,

            name: "Main Account",

            type: "Personal",

            currency: "USD",

            starting_balance: 10000,

            created_at:
                new Date().toISOString()
        };

        await put(
            "accounts",
            defaultAccount
        );

        accounts = [
            defaultAccount
        ];
    }


    /* Restore selected account */

    const savedAccount =
        localStorage.getItem(
            `detwal_journal_account_${currentUser.id}`
        );


    currentAccount =
        accounts.find(
            account =>
                account.id === savedAccount
        ) ||
        accounts[0];


    localStorage.setItem(
        `detwal_journal_account_${currentUser.id}`,
        currentAccount.id
    );


    renderAccountSelector();

    await refreshJournal();
}


/* =========================================================
   ACCOUNT SELECTOR
========================================================= */

function renderAccountSelector() {

    if (!accountSelect) {
        return;
    }

    accountSelect.innerHTML = "";

    accounts.forEach(account => {

        const option =
            document.createElement("option");

        option.value = account.id;

        option.textContent =
            `${account.name} · ${plainMoney(
                account.starting_balance,
                account.currency
            )}`;

        accountSelect.appendChild(option);
    });


    if (currentAccount) {

        accountSelect.value =
            currentAccount.id;
    }


    updateAccountSummary();
}


function updateAccountSummary() {

    if (!currentAccount) {
        return;
    }

    const pnl =
        currentTrades.reduce(
            (sum, trade) =>
                sum + (Number(trade.pnl) || 0),
            0
        );

    const startingBalance =
        Number(
            currentAccount.starting_balance
        ) || 0;

    const currentBalance =
        startingBalance + pnl;

    const returnPercent =
        startingBalance > 0
            ? (pnl / startingBalance) * 100
            : 0;


    if ($("selectedAccountName")) {

        $("selectedAccountName").textContent =
            currentAccount.name;
    }

    if ($("startingBalance")) {

        $("startingBalance").textContent =
            plainMoney(
                startingBalance,
                currentAccount.currency
            );
    }

    if ($("currentBalance")) {

        $("currentBalance").textContent =
            plainMoney(
                currentBalance,
                currentAccount.currency
            );
    }

    if ($("accountReturn")) {

        $("accountReturn").textContent =
            `${returnPercent >= 0 ? "+" : ""}${returnPercent.toFixed(2)}%`;
    }
}


accountSelect?.addEventListener(
    "change",
    async () => {

        currentAccount =
            accounts.find(
                account =>
                    account.id === accountSelect.value
            );

        if (!currentAccount) {
            return;
        }

        localStorage.setItem(
            `detwal_journal_account_${currentUser.id}`,
            currentAccount.id
        );

        await refreshJournal();
    }
);


/* =========================================================
   ACCOUNT DROPDOWN
========================================================= */

accountButton?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        accountDropdown.classList.toggle(
            "active"
        );

        accountButton.classList.toggle(
            "active"
        );
    }
);


document.addEventListener(
    "click",
    event => {

        if (
            accountMenu &&
            !accountMenu.contains(
                event.target
            )
        ) {

            accountDropdown?.classList.remove(
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

logoutBtn?.addEventListener(
    "click",
    async () => {

        logoutBtn.disabled = true;

        try {

            await supabaseClient.auth.signOut();

            window.location.href =
                "../home/";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            logoutBtn.disabled = false;
        }
    }
);


/* =========================================================
   ACCOUNT MANAGEMENT
========================================================= */

function openAccountModal(account = null) {

    if (!accountForm) {
        return;
    }

    accountForm.reset();

    $("accountId").value =
        account?.id || "";

    $("accountModalTitle").textContent =
        account
            ? "Edit Account"
            : "Add Account";

    $("saveAccountBtn").textContent =
        account
            ? "Save Changes"
            : "Create Account";


    if (account) {

        $("accountNameInput").value =
            account.name;

        $("accountType").value =
            account.type || "Personal";

        $("accountCurrency").value =
            account.currency || "USD";

        $("accountBalance").value =
            account.starting_balance;

        deleteAccountBtn?.classList.remove(
            "hidden"
        );

    } else {

        $("accountType").value =
            "Personal";

        $("accountCurrency").value =
            "USD";

        deleteAccountBtn?.classList.add(
            "hidden"
        );
    }


    accountModal.classList.remove(
        "hidden"
    );
}


addAccountBtn?.addEventListener(
    "click",
    () => openAccountModal()
);


manageAccountBtn?.addEventListener(
    "click",
    () => {

        if (currentAccount) {

            openAccountModal(
                currentAccount
            );
        }
    }
);


closeAccountModal?.addEventListener(
    "click",
    () => {

        accountModal.classList.add(
            "hidden"
        );
    }
);


accountModal?.addEventListener(
    "click",
    event => {

        if (
            event.target === accountModal ||
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            accountModal.classList.add(
                "hidden"
            );
        }
    }
);


/* Save account */

accountForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const accountId =
            $("accountId").value ||
            uid("account");

        const existing =
            accounts.find(
                account =>
                    account.id === accountId
            );


        const account = {

            id: accountId,

            user_id:
                currentUser.id,

            name:
                $("accountNameInput")
                    .value
                    .trim(),

            type:
                $("accountType").value,

            currency:
                $("accountCurrency").value,

            starting_balance:
                Number(
                    $("accountBalance").value
                ) || 0,

            created_at:
                existing?.created_at ||
                new Date().toISOString(),

            updated_at:
                new Date().toISOString()
        };


        if (!account.name) {

            alert(
                "Please enter an account name."
            );

            return;
        }


        await put(
            "accounts",
            account
        );


        accounts =
            (await getAll("accounts"))
                .filter(
                    a =>
                        a.user_id ===
                        currentUser.id
                );


        currentAccount =
            accounts.find(
                a =>
                    a.id === account.id
            ) ||
            accounts[0];


        localStorage.setItem(
            `detwal_journal_account_${currentUser.id}`,
            currentAccount.id
        );


        accountModal.classList.add(
            "hidden"
        );

        renderAccountSelector();

        await refreshJournal();
    }
);


/* Delete account */

deleteAccountBtn?.addEventListener(
    "click",
    async () => {

        if (!currentAccount) {
            return;
        }


        if (accounts.length <= 1) {

            alert(
                "You must keep at least one trading account."
            );

            return;
        }


        const confirmed =
            confirm(
                `Delete "${currentAccount.name}" and all trades inside it? This cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        const trades =
            await getAll("trades");


        for (const trade of trades) {

            if (
                trade.user_id ===
                    currentUser.id &&
                trade.account_id ===
                    currentAccount.id
            ) {

                await deleteRecord(
                    "trades",
                    trade.id
                );
            }
        }


        await deleteRecord(
            "accounts",
            currentAccount.id
        );


        accounts =
            (await getAll("accounts"))
                .filter(
                    account =>
                        account.user_id ===
                        currentUser.id
                );


        currentAccount =
            accounts[0];


        localStorage.setItem(
            `detwal_journal_account_${currentUser.id}`,
            currentAccount.id
        );


        accountModal.classList.add(
            "hidden"
        );

        renderAccountSelector();

        await refreshJournal();
    }
);


/* =========================================================
   TRADE MODAL
========================================================= */

function currentLocalDateTime() {

    const date = new Date();

    const local =
        new Date(
            date.getTime() -
            date.getTimezoneOffset() *
                60000
        );

    return local
        .toISOString()
        .slice(0, 16);
}


function localDateTime(iso) {

    const date =
        new Date(iso);

    const local =
        new Date(
            date.getTime() -
            date.getTimezoneOffset() *
                60000
        );

    return local
        .toISOString()
        .slice(0, 16);
}


function clearScreenshotPreview() {

    if (!screenshotPreview) {
        return;
    }

    screenshotPreview.innerHTML = "";

    screenshotPreview.classList.add(
        "hidden"
    );

    removeScreenshotBtn?.classList.add(
        "hidden"
    );
}


function showScreenshot(blob) {

    if (!blob) {

        clearScreenshotPreview();

        return;
    }


    const url =
        URL.createObjectURL(blob);


    screenshotPreview.innerHTML =
        `<img src="${url}" alt="Trade screenshot">`;


    screenshotPreview.classList.remove(
        "hidden"
    );


    removeScreenshotBtn?.classList.remove(
        "hidden"
    );


    const image =
        screenshotPreview.querySelector(
            "img"
        );


    if (image) {

        image.onload = () => {
            URL.revokeObjectURL(url);
        };
    }
}


function openTradeModal(trade = null) {

    if (!tradeForm) {
        return;
    }


    tradeForm.reset();


    editingTradeId =
        trade?.id || null;


    pendingScreenshot =
        trade?.screenshot || null;


    $("tradeDate").value =
        trade
            ? localDateTime(trade.date)
            : currentLocalDateTime();


    const title =
        $("tradeModalTitle");

    const eyebrow =
        $("tradeModalEyebrow");

    const saveButton =
        $("saveTradeBtn");


    if (title) {

        title.textContent =
            trade
                ? "Edit Trade"
                : "Add Trade";
    }


    if (eyebrow) {

        eyebrow.textContent =
            trade
                ? "EDIT TRADE"
                : "NEW TRADE";
    }


    if (saveButton) {

        saveButton.textContent =
            trade
                ? "Save Changes"
                : "Save Trade";
    }


    if (trade) {

        $("symbol").value =
            trade.symbol || "";

        $("direction").value =
            trade.direction || "";

        $("entry").value =
            trade.entry ?? "";

        $("exit").value =
            trade.exit ?? "";

        $("stopLoss").value =
            trade.stopLoss ?? "";

        $("takeProfit").value =
            trade.takeProfit ?? "";

        $("riskReward").value =
            trade.rr || "";

        $("pnl").value =
            trade.pnl ?? "";

        $("risk").value =
            trade.risk ?? "";

        $("strategy").value =
            trade.strategy || "";

        $("notes").value =
            trade.notes || "";


        const standardRR =
            [...riskReward.options]
                .some(
                    option =>
                        option.value ===
                        trade.rr
                );


        if (!standardRR && trade.rr) {

            riskReward.value =
                "custom";

            customRRGroup?.classList.remove(
                "hidden"
            );

            customRR.value =
                String(trade.rr)
                    .split(":")[1] || "";

        } else {

            customRRGroup?.classList.add(
                "hidden"
            );
        }

    } else {

        customRRGroup?.classList.add(
            "hidden"
        );
    }


    showScreenshot(
        pendingScreenshot
    );


    tradeModal.classList.remove(
        "hidden"
    );
}


addTradeBtn?.addEventListener(
    "click",
    async () => {

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

            loginModal.classList.remove(
                "hidden"
            );

            return;
        }


        if (!currentAccount) {

            alert(
                "Please create a trading account first."
            );

            return;
        }


        openTradeModal();
    }
);


closeModal?.addEventListener(
    "click",
    () => {

        tradeModal.classList.add(
            "hidden"
        );
    }
);


closeLoginModal?.addEventListener(
    "click",
    () => {

        loginModal.classList.add(
            "hidden"
        );
    }
);


tradeModal?.addEventListener(
    "click",
    event => {

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


loginModal?.addEventListener(
    "click",
    event => {

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


/* =========================================================
   R:R
========================================================= */

riskReward?.addEventListener(
    "change",
    () => {

        if (
            riskReward.value ===
            "custom"
        ) {

            customRRGroup?.classList.remove(
                "hidden"
            );

        } else {

            customRRGroup?.classList.add(
                "hidden"
            );

            if (customRR) {
                customRR.value = "";
            }
        }
    }
);


/* =========================================================
   SCREENSHOT
========================================================= */

screenshotInput?.addEventListener(
    "change",
    () => {

        const file =
            screenshotInput.files?.[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            alert(
                "Please select an image."
            );

            screenshotInput.value = "";

            return;
        }


        if (
            file.size >
            8 * 1024 * 1024
        ) {

            alert(
                "Screenshot must be smaller than 8 MB."
            );

            screenshotInput.value = "";

            return;
        }


        pendingScreenshot = file;

        showScreenshot(file);
    }
);


removeScreenshotBtn?.addEventListener(
    "click",
    () => {

        pendingScreenshot = null;

        screenshotInput.value = "";

        clearScreenshotPreview();
    }
);


/* =========================================================
   SAVE TRADE
========================================================= */

tradeForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (
            !currentUser ||
            !currentAccount
        ) {

            alert(
                "Please log in and select a trading account."
            );

            return;
        }


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


        if (!rr) {

            alert(
                "Please select an R:R."
            );

            return;
        }


        const existing =
            currentTrades.find(
                trade =>
                    trade.id ===
                    editingTradeId
            );


        const trade = {

            id:
                editingTradeId ||
                uid("trade"),

            user_id:
                currentUser.id,

            account_id:
                currentAccount.id,

            date:
                new Date(
                    $("tradeDate").value
                ).toISOString(),

            symbol:
                $("symbol")
                    .value
                    .trim()
                    .toUpperCase(),

            direction:
                $("direction").value,

            entry:
                Number(
                    $("entry").value
                ),

            exit:
                Number(
                    $("exit").value
                ),

            stopLoss:
                Number(
                    $("stopLoss").value
                ) || 0,

            takeProfit:
                Number(
                    $("takeProfit").value
                ) || 0,

            pnl:
                Number(
                    $("pnl").value
                ) || 0,

            risk:
                Number(
                    $("risk").value
                ) || 0,

            rr,

            strategy:
                $("strategy")
                    .value
                    .trim(),

            notes:
                $("notes")
                    .value
                    .trim(),

            screenshot:
                pendingScreenshot ||
                null,

            created_at:
                existing?.created_at ||
                new Date().toISOString(),

            updated_at:
                new Date().toISOString()
        };


        if (
            !Number.isFinite(
                trade.entry
            ) ||
            !Number.isFinite(
                trade.exit
            )
        ) {

            alert(
                "Please enter valid entry and exit prices."
            );

            return;
        }


        try {

            await put(
                "trades",
                trade
            );


            tradeModal.classList.add(
                "hidden"
            );


            editingTradeId = null;

            pendingScreenshot = null;

            clearScreenshotPreview();

            await refreshJournal();

        } catch (error) {

            console.error(
                "Trade save error:",
                error
            );

            alert(
                "Could not save this trade on your device."
            );
        }
    }
);


/* =========================================================
   TRADE TABLE
========================================================= */

function renderTradesTable(trades) {

    if (!tradesTableBody) {
        return;
    }


    tradesTableBody.innerHTML = "";


    if (!trades.length) {

        emptyTrades?.classList.remove(
            "hidden"
        );

        return;
    }


    emptyTrades?.classList.add(
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


            const pnl =
                Number(trade.pnl) || 0;


            const pnlClass =
                pnl > 0
                    ? "positive"
                    : pnl < 0
                        ? "negative"
                        : "";


            row.innerHTML = `

                <td>
                    ${new Date(
                        trade.date
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )}
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
                    ${money(
                        pnl,
                        currentAccount.currency
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        trade.rr || "—"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        trade.strategy ||
                        "—"
                    )}
                </td>

                <td>

                    <button
                        class="trade-action"
                        data-action="view"
                        data-id="${trade.id}"
                    >
                        View
                    </button>

                    <button
                        class="trade-action"
                        data-action="edit"
                        data-id="${trade.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="trade-action delete-action"
                        data-action="delete"
                        data-id="${trade.id}"
                    >
                        Delete
                    </button>

                </td>
            `;


            tradesTableBody.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   TRADE ACTIONS
========================================================= */

tradesTableBody?.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const trade =
            currentTrades.find(
                item =>
                    item.id ===
                    button.dataset.id
            );


        if (!trade) {
            return;
        }


        const action =
            button.dataset.action;


        if (action === "view") {

            openViewTrade(
                trade
            );

            return;
        }


        if (action === "edit") {

            openTradeModal(
                trade
            );

            return;
        }


        if (
            action === "delete"
        ) {

            const confirmed =
                confirm(
                    "Delete this trade? This cannot be undone."
                );


            if (!confirmed) {
                return;
            }


            await deleteRecord(
                "trades",
                trade.id
            );


            await refreshJournal();
        }
    }
);


/* =========================================================
   VIEW TRADE
========================================================= */

function openViewTrade(trade) {

    if (!viewTradeModal) {
        return;
    }


    viewTradeTitle.textContent =
        `${trade.symbol} · ${trade.direction}`;


    const screenshot =
        trade.screenshot
            ? `
                <div class="trade-detail full">
                    <img
                        id="viewTradeScreenshot"
                        alt="Trade screenshot"
                    >
                </div>
            `
            : "";


    viewTradeContent.innerHTML = `

        <div class="trade-details-grid">

            <div class="trade-detail">
                <span>Date</span>
                <strong>
                    ${new Date(
                        trade.date
                    ).toLocaleString()}
                </strong>
            </div>

            <div class="trade-detail">
                <span>P&L</span>
                <strong class="${
                    Number(trade.pnl) >= 0
                        ? "positive"
                        : "negative"
                }">
                    ${money(
                        trade.pnl,
                        currentAccount.currency
                    )}
                </strong>
            </div>

            <div class="trade-detail">
                <span>Entry</span>
                <strong>
                    ${trade.entry}
                </strong>
            </div>

            <div class="trade-detail">
                <span>Exit</span>
                <strong>
                    ${trade.exit}
                </strong>
            </div>

            <div class="trade-detail">
                <span>Stop Loss</span>
                <strong>
                    ${trade.stopLoss || "—"}
                </strong>
            </div>

            <div class="trade-detail">
                <span>Take Profit</span>
                <strong>
                    ${trade.takeProfit || "—"}
                </strong>
            </div>

            <div class="trade-detail">
                <span>R:R</span>
                <strong>
                    ${escapeHTML(
                        trade.rr || "—"
                    )}
                </strong>
            </div>

            <div class="trade-detail">
                <span>Risk</span>
                <strong>
                    ${trade.risk || 0}%
                </strong>
            </div>

            <div class="trade-detail">
                <span>Strategy</span>
                <strong>
                    ${escapeHTML(
                        trade.strategy ||
                        "—"
                    )}
                </strong>
            </div>

            <div class="trade-detail full">
                <span>Notes</span>
                <strong>
                    ${escapeHTML(
                        trade.notes ||
                        "No notes"
                    )}
                </strong>
            </div>

            ${screenshot}

        </div>
    `;


    if (trade.screenshot) {

        const image =
            $("viewTradeScreenshot");


        if (image) {

            const url =
                URL.createObjectURL(
                    trade.screenshot
                );


            image.src = url;


            image.onload = () => {

                URL.revokeObjectURL(
                    url
                );
            };
        }
    }


    viewTradeModal.classList.remove(
        "hidden"
    );
}


closeViewTradeModal?.addEventListener(
    "click",
    () => {

        viewTradeModal.classList.add(
            "hidden"
        );
    }
);


viewTradeModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
                viewTradeModal ||
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            viewTradeModal.classList.add(
                "hidden"
            );
        }
    }
);


/* =========================================================
   STATISTICS
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


    return (
        Number.isFinite(value) &&
        value > 0
    )
        ? value
        : null;
}


function renderStats(trades) {

    const totalTrades =
        trades.length;


    const totalPnL =
        trades.reduce(
            (sum, trade) =>
                sum +
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
        totalTrades
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
        rrValues.length
            ? rrValues.reduce(
                (a, b) =>
                    a + b,
                0
            ) / rrValues.length
            : null;


    const grossProfit =
        winningTrades.reduce(
            (sum, trade) =>
                sum +
                Number(trade.pnl),
            0
        );


    const grossLoss =
        losingTrades.reduce(
            (sum, trade) =>
                sum +
                Math.abs(
                    Number(
                        trade.pnl
                    )
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

        profitFactor = "∞";
    }


    const bestTrade =
        trades.length
            ? Math.max(
                ...trades.map(
                    trade =>
                        Number(
                            trade.pnl
                        ) || 0
                )
            )
            : null;


    $("totalPnl").textContent =
        money(
            totalPnL,
            currentAccount.currency
        );


    $("winRate").textContent =
        `${winRate.toFixed(1)}%`;


    $("totalTrades").textContent =
        totalTrades;


    $("averageRR").textContent =
        averageRR !== null
            ? `1:${averageRR.toFixed(2)}`
            : "—";


    $("winningTrades").textContent =
        winningTrades.length;


    $("losingTrades").textContent =
        losingTrades.length;


    $("profitFactor").textContent =
        profitFactor;


    $("bestTrade").textContent =
        bestTrade !== null
            ? money(
                bestTrade,
                currentAccount.currency
            )
            : "—";


    if (navProfit) {

        navProfit.textContent =
            money(
                totalPnL,
                currentAccount.currency
            );
    }


    updateAccountSummary();
}


/* =========================================================
   EQUITY CURVE
========================================================= */

function renderEquityCurve(
    trades
) {

    if (!trades.length) {

        $("equityLine")
            .setAttribute(
                "points",
                ""
            );

        $("equityArea")
            .setAttribute(
                "points",
                ""
            );

        $("chartEmpty")
            ?.classList.remove(
                "hidden"
            );

        return;
    }


    $("chartEmpty")
        ?.classList.add(
            "hidden"
        );


    const sortedTrades =
        [...trades].sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    let equity =
        Number(
            currentAccount.starting_balance
        ) || 0;


    const values = [
        equity
    ];


    sortedTrades.forEach(
        trade => {

            equity +=
                Number(
                    trade.pnl
                ) || 0;

            values.push(
                equity
            );
        }
    );


    const width = 900;
    const height = 250;
    const padding = 10;


    const minValue =
        Math.min(
            ...values
        );


    const maxValue =
        Math.max(
            ...values
        );


    let range =
        maxValue -
        minValue;


    if (range === 0) {
        range = 1;
    }


    const minY =
        minValue -
        range * 0.15;


    const maxY =
        maxValue +
        range * 0.15;


    const points =
        values.map(
            (value, index) => {

                const x =
                    values.length === 1
                        ? width / 2
                        : padding +
                          (
                              index /
                              (
                                  values.length -
                                  1
                              )
                          ) *
                          (
                              width -
                              padding * 2
                          );


                const y =
                    height -
                    20 -
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
                    210;


                return `${x.toFixed(2)},${y.toFixed(2)}`;
            }
        ).join(" ");


    $("equityLine")
        .setAttribute(
            "points",
            points
        );


    $("equityArea")
        .setAttribute(
            "points",
            `${padding},250 ${points} ${width-padding},250`
        );
}


/* =========================================================
   REFRESH JOURNAL
========================================================= */

async function refreshJournal() {

    if (
        !currentUser ||
        !currentAccount
    ) {
        return;
    }


    try {

        const allTrades =
            await getAll("trades");


        currentTrades =
            allTrades.filter(
                trade =>
                    trade.user_id ===
                        currentUser.id &&
                    trade.account_id ===
                        currentAccount.id
            );


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
            "Journal loading error:",
            error
        );
    }
}


/* =========================================================
   EXPORT HELPERS
========================================================= */

function downloadFile(
    filename,
    content,
    type
) {

    const blob =
        new Blob(
            [content],
            {
                type
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );
}


function blobToDataURL(blob) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () =>
                resolve(
                    reader.result
                );


            reader.onerror =
                reject;


            reader.readAsDataURL(
                blob
            );
        }
    );
}


async function dataURLToBlob(
    dataURL
) {

    const response =
        await fetch(
            dataURL
        );


    return response.blob();
}


/* =========================================================
   JSON EXPORT
========================================================= */

exportJsonBtn?.addEventListener(
    "click",
    async () => {

        try {

            const allAccounts =
                (
                    await getAll(
                        "accounts"
                    )
                ).filter(
                    account =>
                        account.user_id ===
                        currentUser.id
                );


            const allTrades =
                (
                    await getAll(
                        "trades"
                    )
                ).filter(
                    trade =>
                        trade.user_id ===
                        currentUser.id
                );


            const exportedTrades =
                await Promise.all(
                    allTrades.map(
                        async trade => ({

                            ...trade,

                            screenshot:
                                trade.screenshot
                                    ? await blobToDataURL(
                                        trade.screenshot
                                    )
                                    : null
                        })
                    )
                );


            const backup = {

                format:
                    "DETwal Journal Backup",

                version:
                    2,

                exported_at:
                    new Date().toISOString(),

                accounts:
                    allAccounts,

                trades:
                    exportedTrades
            };


            downloadFile(
                `detwal-journal-${new Date()
                    .toISOString()
                    .slice(0, 10)}.json`,

                JSON.stringify(
                    backup,
                    null,
                    2
                ),

                "application/json"
            );

        } catch (error) {

            console.error(
                "Export error:",
                error
            );

            alert(
                "Could not export the journal."
            );
        }
    }
);


/* =========================================================
   CSV EXPORT
========================================================= */

exportCsvBtn?.addEventListener(
    "click",
    async () => {

        try {

            const allAccounts =
                (
                    await getAll(
                        "accounts"
                    )
                ).filter(
                    account =>
                        account.user_id ===
                        currentUser.id
                );


            const allTrades =
                (
                    await getAll(
                        "trades"
                    )
                ).filter(
                    trade =>
                        trade.user_id ===
                        currentUser.id
                );


            const rows = [

                [
                    "Date",
                    "Account",
                    "Currency",
                    "Symbol",
                    "Direction",
                    "Entry",
                    "Exit",
                    "Stop Loss",
                    "Take Profit",
                    "P&L",
                    "Risk %",
                    "R:R",
                    "Strategy",
                    "Notes"
                ]
            ];


            allTrades.forEach(
                trade => {

                    const account =
                        allAccounts.find(
                            item =>
                                item.id ===
                                trade.account_id
                        );


                    rows.push([

                        trade.date,

                        account?.name ||
                            "",

                        account?.currency ||
                            "",

                        trade.symbol,

                        trade.direction,

                        trade.entry,

                        trade.exit,

                        trade.stopLoss,

                        trade.takeProfit,

                        trade.pnl,

                        trade.risk,

                        trade.rr,

                        trade.strategy,

                        trade.notes
                    ]);
                }
            );


            const csv =
                rows
                    .map(
                        row =>
                            row
                                .map(
                                    value =>
                                        `"${String(
                                            value ?? ""
                                        ).replace(
                                            /"/g,
                                            '""'
                                        )}"`
                                )
                                .join(",")
                    )
                    .join("\n");


            downloadFile(
                `detwal-journal-${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`,

                csv,

                "text/csv;charset=utf-8"
            );

        } catch (error) {

            console.error(
                "CSV export error:",
                error
            );

            alert(
                "Could not export CSV."
            );
        }
    }
);


/* =========================================================
   IMPORT
========================================================= */

importBtn?.addEventListener(
    "click",
    () => {

        importFile?.click();
    }
);


importFile?.addEventListener(
    "change",
    async () => {

        const file =
            importFile.files?.[0];


        if (!file) {
            return;
        }


        try {

            const backup =
                JSON.parse(
                    await file.text()
                );


            if (
                backup?.format !==
                "DETwal Journal Backup"
            ) {

                throw new Error(
                    "Invalid backup"
                );
            }


            const confirmed =
                confirm(
                    "Import this backup? Existing journal data will remain and imported data will be added."
                );


            if (!confirmed) {
                return;
            }


            for (
                const oldAccount
                of backup.accounts || []
            ) {

                const newAccount = {

                    ...oldAccount,

                    id:
                        uid("account"),

                    user_id:
                        currentUser.id,

                    created_at:
                        oldAccount.created_at ||
                        new Date().toISOString(),

                    updated_at:
                        new Date().toISOString()
                };


                await put(
                    "accounts",
                    newAccount
                );


                const relatedTrades =
                    (
                        backup.trades ||
                        []
                    ).filter(
                        trade =>
                            trade.account_id ===
                            oldAccount.id
                    );


                for (
                    const oldTrade
                    of relatedTrades
                ) {

                    const newTrade = {

                        ...oldTrade,

                        id:
                            uid("trade"),

                        user_id:
                            currentUser.id,

                        account_id:
                            newAccount.id,

                        screenshot:
                            oldTrade.screenshot
                                ? await dataURLToBlob(
                                    oldTrade.screenshot
                                )
                                : null
                    };


                    await put(
                        "trades",
                        newTrade
                    );
                }
            }


            await loadAccounts();


            alert(
                "Journal backup imported successfully."
            );

        } catch (error) {

            console.error(
                "Import error:",
                error
            );

            alert(
                "Invalid or damaged DETwal backup file."
            );

        } finally {

            importFile.value = "";
        }
    }
);


/* =========================================================
   SUPABASE AUTH
========================================================= */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (session?.user) {

            currentUser =
                session.user;


            if (accountInitial) {
                accountInitial.textContent =
                    getInitial();
            }

            if (accountAvatar) {
                accountAvatar.textContent =
                    getInitial();
            }

            if (accountName) {
                accountName.textContent =
                    getUserName();
            }

            if (dropdownName) {
                dropdownName.textContent =
                    getUserName();
            }

            if (dropdownEmail) {
                dropdownEmail.textContent =
                    currentUser.email || "";
            }


            showJournal();


            loadAccounts();

        } else {

            currentUser = null;

            accounts = [];

            currentAccount = null;

            currentTrades = [];


            showLock();
        }
    }
);


/* =========================================================
   INITIALIZE
========================================================= */

(async function initializeJournal() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (
            error ||
            !data?.session?.user
        ) {

            showLock();

            return;
        }


        currentUser =
            data.session.user;


        if (accountInitial) {
            accountInitial.textContent =
                getInitial();
        }

        if (accountAvatar) {
            accountAvatar.textContent =
                getInitial();
        }

        if (accountName) {
            accountName.textContent =
                getUserName();
        }

        if (dropdownName) {
            dropdownName.textContent =
                getUserName();
        }

        if (dropdownEmail) {
            dropdownEmail.textContent =
                currentUser.email || "";
        }


        showJournal();


        await loadAccounts();

    } catch (error) {

        console.error(
            "Journal initialization error:",
            error
        );

        showLock();
    }

})();
