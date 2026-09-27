const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ===============================
// CONFIG
// ===============================

const STORE_API =
    "https://detwal-store-bot.dakshdetwal10.workers.dev";


// ===============================
// ACCOUNT SESSION
// ===============================

const accountBtn =
    document.getElementById("accountBtn");


async function updateAccountButton() {

    if (!accountBtn) return;

    try {

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        const session = data?.session;

        if (session && session.user) {

            accountBtn.href = "../profile/";

        } else {

            accountBtn.href = "../signup/";

        }

        accountBtn.textContent = "Account";

    } catch (error) {

        console.error(
            "Failed to check account session:",
            error
        );

        accountBtn.href = "../signup/";
        accountBtn.textContent = "Account";
    }
}


updateAccountButton();


supabaseClient.auth.onAuthStateChange(() => {

    updateAccountButton();

});


// ===============================
// STORE DATA
// ===============================

let products = [];


// ===============================
// ELEMENTS
// ===============================

const productsGrid =
    document.getElementById("productsGrid");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const sortSelect =
    document.getElementById("sortSelect");


// ===============================
// LOAD STRATEGIES
// ===============================

async function loadStrategies() {

    if (!productsGrid) return;

    productsGrid.innerHTML = `
        <div class="empty-state">
            Loading strategies...
        </div>
    `;

    try {

        const response =
            await fetch(`${STORE_API}/strategies`);

        if (!response.ok) {
            throw new Error("Failed to load strategies.");
        }

        const data =
            await response.json();

        if (!data.success || !Array.isArray(data.strategies)) {
            throw new Error("Invalid strategy response.");
        }

        products = data.strategies;

        renderProducts();

    } catch (error) {

        console.error(
            "Failed to load strategies:",
            error
        );

        productsGrid.innerHTML = `
            <div class="empty-state">
                Unable to load strategies right now.
                Please try again later.
            </div>
        `;
    }
}


// ===============================
// RENDER PRODUCTS
// ===============================

function renderProducts(
    category = "all",
    sort = "featured"
) {

    if (!productsGrid) return;

    let filteredProducts =
        category === "all"
            ? [...products]
            : products.filter(
                product =>
                    product.category === category
            );


    // LOWEST PRICE

    if (sort === "low") {

        filteredProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }


    // HIGHEST PRICE

    if (sort === "high") {

        filteredProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }


    // FEATURED

    if (sort === "featured") {

        filteredProducts.sort(
            (a, b) =>
                Number(b.featured) -
                Number(a.featured)
        );

    }


    if (filteredProducts.length === 0) {

        productsGrid.innerHTML = `
            <div class="empty-state">
                No strategies found.
            </div>
        `;

        return;
    }


    productsGrid.innerHTML =
        filteredProducts.map(product => {

            return `
                <article class="product-card">

                    <div class="product-image">

                        <span>
                            DETwal Strategy
                        </span>

                    </div>


                    <div class="product-content">

                        <div class="product-category">
                            ${escapeHTML(
                                product.category_name ||
                                product.categoryName ||
                                ""
                            )}
                        </div>


                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>


                        <p>
                            ${escapeHTML(
                                product.description || ""
                            )}
                        </p>


                        <div class="product-bottom">

                            <div class="product-price">
                                $${Number(product.price).toFixed(2)}
                            </div>


                            <button
                                class="view-btn"
                                data-strategy-id="${product.id}"
                            >
                                View Strategy
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");


    // Attach buttons

    document
        .querySelectorAll(".view-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const strategyId =
                        button.dataset.strategyId;

                    viewStrategy(strategyId);

                }
            );

        });
}


// ===============================
// VIEW STRATEGY
// ===============================

async function viewStrategy(strategyId) {

    try {

        const response =
            await fetch(
                `${STORE_API}/strategy?id=${encodeURIComponent(strategyId)}`
            );

        if (!response.ok) {
            throw new Error("Failed to load strategy.");
        }

        const data =
            await response.json();

        if (!data.success || !data.strategy) {
            throw new Error("Strategy not found.");
        }

        showStrategyDetails(
            data.strategy
        );

    } catch (error) {

        console.error(
            "Failed to load strategy:",
            error
        );

        alert(
            "Unable to load this strategy right now."
        );
    }
}


// ===============================
// STRATEGY DETAIL VIEW
// ===============================

function showStrategyDetails(strategy) {

    const existing =
        document.getElementById(
            "strategyDetailModal"
        );

    if (existing) {
        existing.remove();
    }


    const modal =
        document.createElement("div");

    modal.id =
        "strategyDetailModal";

    modal.innerHTML = `

        <div class="strategy-modal-overlay">

            <div class="strategy-modal">

                <button
                    class="strategy-modal-close"
                    id="closeStrategyModal"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="product-category">
                    ${escapeHTML(
                        strategy.category_name ||
                        strategy.category ||
                        ""
                    )}
                </div>


                <h2>
                    ${escapeHTML(strategy.name)}
                </h2>


                <p class="strategy-description">
                    ${escapeHTML(
                        strategy.description || ""
                    )}
                </p>


                <div class="strategy-info-grid">

                    <div class="strategy-info-card">

                        <span>
                            Trading Pair
                        </span>

                        <strong>
                            ${escapeHTML(
                                strategy.trading_pair ||
                                "—"
                            )}
                        </strong>

                    </div>


                    <div class="strategy-info-card">

                        <span>
                            Risk / Reward
                        </span>

                        <strong>
                            ${escapeHTML(
                                strategy.rr_ratio ||
                                "—"
                            )}
                        </strong>

                    </div>


                    <div class="strategy-info-card">

                        <span>
                            Strategy Type
                        </span>

                        <strong>
                            ${escapeHTML(
                                strategy.strategy_type ||
                                "—"
                            )}
                        </strong>

                    </div>


                    <div class="strategy-info-card">

                        <span>
                            Price
                        </span>

                        <strong>
                            $${Number(
                                strategy.price
                            ).toFixed(2)}
                        </strong>

                    </div>

                </div>


                <div class="strategy-how">

                    <h3>
                        How It Works
                    </h3>

                    <p>
                        ${escapeHTML(
                            strategy.how_it_works ||
                            "Strategy explanation will be provided after purchase."
                        )}
                    </p>

                </div>


                <div class="strategy-purchase">

                    <div>

                        <span>
                            Price
                        </span>

                        <strong>
                            $${Number(
                                strategy.price
                            ).toFixed(2)}
                        </strong>

                    </div>


                    <button
                        class="purchase-strategy-btn"
                        id="purchaseStrategyBtn"
                    >
                        Purchase It Now
                    </button>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    // Close

    document
        .getElementById("closeStrategyModal")
        .addEventListener(
            "click",
            closeStrategyModal
        );


    // Click outside

    modal
        .querySelector(
            ".strategy-modal-overlay"
        )
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.classList.contains(
                        "strategy-modal-overlay"
                    )
                ) {

                    closeStrategyModal();

                }

            }
        );


    // Purchase

    document
        .getElementById(
            "purchaseStrategyBtn"
        )
        .addEventListener(
            "click",
            () => {

                openPurchaseForm(strategy);

            }
        );


    // ESC

    document.addEventListener(
        "keydown",
        handleEscapeKey
    );
}


// ===============================
// CLOSE DETAIL
// ===============================

function closeStrategyModal() {

    const modal =
        document.getElementById(
            "strategyDetailModal"
        );

    if (modal) {
        modal.remove();
    }

    document.removeEventListener(
        "keydown",
        handleEscapeKey
    );
}


function handleEscapeKey(event) {

    if (event.key === "Escape") {

        closeStrategyModal();

    }

}


// ===============================
// PURCHASE FORM PLACEHOLDER
// ===============================

function openPurchaseForm(strategy) {

    /*
        Purchase form will be connected
        in the next step.

        It will contain:

        - Strategy name
        - Original price
        - Coupon code
        - Apply coupon
        - Final price
        - Customer name
        - Customer email
        - Customer UPI ID
        - DETwal payment UPI ID
        - Add Request
    */

    alert(
        `Purchase: ${strategy.name}\n\nPurchase form will be connected next.`
    );
}


// ===============================
// FILTERS
// ===============================

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            const category =
                button.dataset.category;


            renderProducts(
                category,
                sortSelect
                    ? sortSelect.value
                    : "featured"
            );

        }
    );

});


// ===============================
// SORT
// ===============================

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        () => {

            const activeButton =
                document.querySelector(
                    ".filter-btn.active"
                );


            const category =
                activeButton
                    ? activeButton.dataset.category
                    : "all";


            renderProducts(
                category,
                sortSelect.value
            );

        }
    );

}


// ===============================
// HTML ESCAPE
// ===============================

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


// ===============================
// START
// ===============================

loadStrategies();
