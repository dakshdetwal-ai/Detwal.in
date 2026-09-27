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

const DETWAL_UPI =
    "dakshdetwal@fam";


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
            throw new Error(
                "Failed to load strategies."
            );
        }

        const data =
            await response.json();

        if (
            !data.success ||
            !Array.isArray(data.strategies)
        ) {
            throw new Error(
                "Invalid strategy response."
            );
        }

        products =
            data.strategies;

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


    if (sort === "low") {

        filteredProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }


    if (sort === "high") {

        filteredProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }


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
                            ${escapeHTML(
                                product.name
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                product.description || ""
                            )}
                        </p>


                        <div class="product-bottom">

                            <div class="product-price">
                                $${Number(
                                    product.price
                                ).toFixed(2)}
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


    document
        .querySelectorAll(".view-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    viewStrategy(
                        button.dataset.strategyId
                    );

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
                `${STORE_API}/strategy?id=${encodeURIComponent(
                    strategyId
                )}`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load strategy."
            );
        }

        const data =
            await response.json();

        if (
            !data.success ||
            !data.strategy
        ) {
            throw new Error(
                "Strategy not found."
            );
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

    closeAllModals();


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
                    ${escapeHTML(
                        strategy.name
                    )}
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


    document
        .getElementById(
            "closeStrategyModal"
        )
        .addEventListener(
            "click",
            closeStrategyModal
        );


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


    document
        .getElementById(
            "purchaseStrategyBtn"
        )
        .addEventListener(
            "click",
            () => {

                openPurchaseForm(
                    strategy
                );

            }
        );


    document.addEventListener(
        "keydown",
        handleEscapeKey
    );
}


// ===============================
// PURCHASE FORM
// ===============================

function openPurchaseForm(strategy) {

    closeStrategyModal();


    const originalPrice =
        Number(strategy.price);


    const modal =
        document.createElement("div");

    modal.id =
        "purchaseModal";


    modal.innerHTML = `

        <div class="strategy-modal-overlay">

            <div class="strategy-modal purchase-modal">

                <button
                    class="strategy-modal-close"
                    id="closePurchaseModal"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="product-category">
                    DETwal STORE
                </div>


                <h2>
                    Purchase Strategy
                </h2>


                <p class="strategy-description">
                    ${escapeHTML(
                        strategy.name
                    )}
                </p>


                <div class="purchase-summary">

                    <div class="purchase-row">

                        <span>
                            Strategy
                        </span>

                        <strong>
                            ${escapeHTML(
                                strategy.name
                            )}
                        </strong>

                    </div>


                    <div class="purchase-row">

                        <span>
                            Original Price
                        </span>

                        <strong id="originalPrice">
                            $${originalPrice.toFixed(2)}
                        </strong>

                    </div>


                    <div
                        class="purchase-row"
                        id="discountRow"
                        style="display:none;"
                    >

                        <span>
                            Discount
                        </span>

                        <strong id="discountAmount">
                            -$0.00
                        </strong>

                    </div>


                    <div class="purchase-row total-row">

                        <span>
                            Final Price
                        </span>

                        <strong id="finalPrice">
                            $${originalPrice.toFixed(2)}
                        </strong>

                    </div>

                </div>


                <form
                    id="strategyPurchaseForm"
                    novalidate
                >

                    <label for="couponCode">
                        Coupon Code
                    </label>

                    <div class="coupon-row">

                        <input
                            type="text"
                            id="couponCode"
                            placeholder="Enter coupon code"
                            autocomplete="off"
                        >

                        <button
                            type="button"
                            id="applyCouponBtn"
                            class="secondary-btn"
                        >
                            Apply
                        </button>

                    </div>


                    <div
                        id="couponMessage"
                        class="form-message"
                    ></div>


                    <label for="customerName">
                        Full Name
                    </label>

                    <input
                        type="text"
                        id="customerName"
                        placeholder="Your name"
                        autocomplete="name"
                        required
                    >


                    <label for="customerEmail">
                        Email Address
                    </label>

                    <input
                        type="email"
                        id="customerEmail"
                        placeholder="you@example.com"
                        autocomplete="email"
                        required
                    >


                    <label for="customerUpi">
                        Your UPI ID
                    </label>

                    <input
                        type="text"
                        id="customerUpi"
                        placeholder="yourname@upi"
                        autocomplete="off"
                        required
                    >


                    <div class="payment-box">

                        <span>
                            Pay DETwal
                        </span>

                        <strong>
                            ${DETWAL_UPI}
                        </strong>

                        <small>
                            Pay the final amount to this UPI ID,
                            then submit your request.
                        </small>

                    </div>


                    <div
                        id="orderMessage"
                        class="form-message"
                    ></div>


                    <button
                        type="submit"
                        class="purchase-submit-btn"
                        id="submitOrderBtn"
                    >
                        Add Request
                    </button>

                </form>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    // ===========================
    // CLOSE
    // ===========================

    document
        .getElementById(
            "closePurchaseModal"
        )
        .addEventListener(
            "click",
            closePurchaseModal
        );


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

                    closePurchaseModal();

                }

            }
        );


    // ===========================
    // COUPON
    // ===========================

    let appliedCoupon = "";
    let discountAmount = 0;


    const couponInput =
        document.getElementById(
            "couponCode"
        );


    const applyCouponBtn =
        document.getElementById(
            "applyCouponBtn"
        );


    const couponMessage =
        document.getElementById(
            "couponMessage"
        );


    const discountRow =
        document.getElementById(
            "discountRow"
        );


    const discountDisplay =
        document.getElementById(
            "discountAmount"
        );


    const finalPriceDisplay =
        document.getElementById(
            "finalPrice"
        );


    function updatePrice() {

        const finalPrice =
            Math.max(
                0,
                originalPrice -
                discountAmount
            );


        if (
            discountAmount > 0
        ) {

            discountRow.style.display =
                "flex";

            discountDisplay.textContent =
                `-$${discountAmount.toFixed(2)}`;

        } else {

            discountRow.style.display =
                "none";

        }


        finalPriceDisplay.textContent =
            `$${finalPrice.toFixed(2)}`;

    }


    applyCouponBtn.addEventListener(
        "click",
        async () => {

            const code =
                couponInput.value
                    .trim()
                    .toUpperCase();


            if (!code) {

                appliedCoupon = "";
                discountAmount = 0;

                couponMessage.textContent =
                    "Enter a coupon code.";

                couponMessage.className =
                    "form-message error";

                updatePrice();

                return;
            }


            applyCouponBtn.disabled =
                true;

            applyCouponBtn.textContent =
                "Checking...";


            try {

                const response =
                    await fetch(
                        `${STORE_API}/coupon?code=${encodeURIComponent(
                            code
                        )}`
                    );


                if (!response.ok) {
                    throw new Error(
                        "Coupon request failed."
                    );
                }


                const data =
                    await response.json();


                if (
                    !data.success ||
                    !data.valid
                ) {

                    appliedCoupon = "";
                    discountAmount = 0;

                    couponMessage.textContent =
                        "Invalid or inactive coupon.";

                    couponMessage.className =
                        "form-message error";

                    updatePrice();

                    return;
                }


                const discountType =
                    data.discountType;


                const discountValue =
                    Number(
                        data.discountValue
                    );


                if (
                    discountType === "percent"
                ) {

                    discountAmount =
                        originalPrice *
                        (discountValue / 100);

                } else {

                    discountAmount =
                        discountValue;

                }


                discountAmount =
                    Math.min(
                        originalPrice,
                        Math.max(
                            0,
                            discountAmount
                        )
                    );


                appliedCoupon =
                    data.code || code;


                couponMessage.textContent =
                    `Coupon applied: ${appliedCoupon}`;

                couponMessage.className =
                    "form-message success";


                updatePrice();

            } catch (error) {

                console.error(
                    "Coupon validation error:",
                    error
                );

                appliedCoupon = "";
                discountAmount = 0;

                couponMessage.textContent =
                    "Unable to validate coupon. Please try again.";

                couponMessage.className =
                    "form-message error";

                updatePrice();

            } finally {

                applyCouponBtn.disabled =
                    false;

                applyCouponBtn.textContent =
                    "Apply";

            }

        }
    );


    couponInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                applyCouponBtn.click();

            }

        }
    );


    // ===========================
    // ORDER SUBMISSION
    // ===========================

    const form =
        document.getElementById(
            "strategyPurchaseForm"
        );


    const orderMessage =
        document.getElementById(
            "orderMessage"
        );


    const submitOrderBtn =
        document.getElementById(
            "submitOrderBtn"
        );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const customerName =
                document
                    .getElementById(
                        "customerName"
                    )
                    .value
                    .trim();


            const customerEmail =
                document
                    .getElementById(
                        "customerEmail"
                    )
                    .value
                    .trim();


            const customerUpi =
                document
                    .getElementById(
                        "customerUpi"
                    )
                    .value
                    .trim();


            if (
                !customerName ||
                !customerEmail ||
                !customerUpi
            ) {

                orderMessage.textContent =
                    "Please complete all required fields.";

                orderMessage.className =
                    "form-message error";

                return;
            }


            const emailValid =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(
                        customerEmail
                    );


            if (!emailValid) {

                orderMessage.textContent =
                    "Please enter a valid email address.";

                orderMessage.className =
                    "form-message error";

                return;
            }


            const finalPrice =
                Math.max(
                    0,
                    originalPrice -
                    discountAmount
                );


            submitOrderBtn.disabled =
                true;

            submitOrderBtn.textContent =
                "Submitting...";


            orderMessage.textContent =
                "";


            try {

                const response =
                    await fetch(
                        `${STORE_API}/order`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                strategyId:
                                    strategy.id,

                                name:
                                    customerName,

                                email:
                                    customerEmail,

                                upi:
                                    customerUpi,

                                coupon:
                                    appliedCoupon

                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Unable to create order."
                    );

                }


                // ===========================
                // SUCCESS
                // ===========================

                form.innerHTML = `

                    <div class="order-success">

                        <div class="success-icon">
                            ✓
                        </div>

                        <h3>
                            Request Added
                        </h3>

                        <p>
                            Your purchase request has been
                            sent to the DETwal team.
                        </p>

                        <div class="order-id-box">

                            <span>
                                Order ID
                            </span>

                            <strong>
                                ${escapeHTML(
                                    data.orderId ||
                                    "Pending"
                                )}
                            </strong>

                        </div>

                        <p class="success-note">
                            Keep your Order ID for reference.
                            The team will verify your payment
                            and process your strategy.
                        </p>

                        <button
                            type="button"
                            class="purchase-submit-btn"
                            id="successCloseBtn"
                        >
                            Done
                        </button>

                    </div>

                `;


                document
                    .getElementById(
                        "successCloseBtn"
                    )
                    .addEventListener(
                        "click",
                        closePurchaseModal
                    );


            } catch (error) {

                console.error(
                    "Order submission error:",
                    error
                );


                orderMessage.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";

                orderMessage.className =
                    "form-message error";


                submitOrderBtn.disabled =
                    false;

                submitOrderBtn.textContent =
                    "Add Request";

            }

        }
    );


    document.addEventListener(
        "keydown",
        handleEscapeKey
    );
}


// ===============================
// CLOSE PURCHASE MODAL
// ===============================

function closePurchaseModal() {

    const modal =
        document.getElementById(
            "purchaseModal"
        );


    if (modal) {
        modal.remove();
    }


    document.removeEventListener(
        "keydown",
        handleEscapeKey
    );
}


// ===============================
// CLOSE DETAIL MODAL
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


// ===============================
// CLOSE ALL MODALS
// ===============================

function closeAllModals() {

    const detail =
        document.getElementById(
            "strategyDetailModal"
        );


    const purchase =
        document.getElementById(
            "purchaseModal"
        );


    if (detail) {
        detail.remove();
    }


    if (purchase) {
        purchase.remove();
    }


    document.removeEventListener(
        "keydown",
        handleEscapeKey
    );
}


// ===============================
// ESCAPE KEY
// ===============================

function handleEscapeKey(event) {

    if (
        event.key !== "Escape"
    ) {
        return;
    }


    closeStrategyModal();
    closePurchaseModal();

}


// ===============================
// FILTERS
// ===============================

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                btn => {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


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

    return String(
        value ?? ""
    )
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
