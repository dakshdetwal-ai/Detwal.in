const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


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
// PRODUCTS
// ===============================

const products = [
    {
        name: "XAUUSD News Strategy",
        category: "gold",
        categoryName: "Gold",
        description: "A structured strategy designed for trading major economic news events on gold.",
        price: 49,
        featured: true
    },
    {
        name: "London Session Setup",
        category: "forex",
        categoryName: "Forex",
        description: "A session-based trading system focused on structured London market setups.",
        price: 29,
        featured: true
    },
    {
        name: "NASDAQ Breakout System",
        category: "indices",
        categoryName: "Indices",
        description: "A rule-based breakout framework designed for NASDAQ market conditions.",
        price: 39,
        featured: true
    },
    {
        name: "Crypto Momentum System",
        category: "crypto",
        categoryName: "Crypto",
        description: "A momentum-based framework for identifying structured cryptocurrency setups.",
        price: 35,
        featured: false
    },
    {
        name: "Gold Liquidity Strategy",
        category: "gold",
        categoryName: "Gold",
        description: "A liquidity-focused approach for identifying potential XAUUSD market setups.",
        price: 59,
        featured: false
    },
    {
        name: "Forex Structure System",
        category: "forex",
        categoryName: "Forex",
        description: "A market-structure framework built around predefined trading rules.",
        price: 25,
        featured: false
    }
];


const productsGrid =
    document.getElementById("productsGrid");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const sortSelect =
    document.getElementById("sortSelect");



function renderProducts(
    category = "all",
    sort = "featured"
) {

    let filteredProducts =
        category === "all"
            ? [...products]
            : products.filter(
                product =>
                    product.category === category
            );


    if (sort === "low") {

        filteredProducts.sort(
            (a, b) => a.price - b.price
        );

    }


    if (sort === "high") {

        filteredProducts.sort(
            (a, b) => b.price - a.price
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
                        <span>DETwal Strategy</span>
                    </div>

                    <div class="product-content">

                        <div class="product-category">
                            ${product.categoryName}
                        </div>

                        <h3>
                            ${product.name}
                        </h3>

                        <p>
                            ${product.description}
                        </p>

                        <div class="product-bottom">

                            <div class="product-price">
                                $${product.price}
                            </div>

                            <button
                                class="view-btn"
                                onclick="viewStrategy('${product.name}')"
                            >
                                View Strategy
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}



function viewStrategy(strategyName) {

    alert(
        `${strategyName}\n\nStrategy details and checkout will be available soon.`
    );

}



filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            button.classList.add("active");


            const category =
                button.dataset.category;


            renderProducts(
                category,
                sortSelect.value
            );

        }
    );

});



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



renderProducts();
