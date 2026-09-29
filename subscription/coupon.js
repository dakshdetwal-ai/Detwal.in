const COUPON_API =
    "https://detwal-help-bot.dakshdetwal10.workers.dev/subscription-coupon";

const NORMAL_PRICE = 9;


/*
==================================================
VALIDATE DETwal NEWS TRADING COUPON
==================================================
*/

async function validateCoupon(code) {

    const cleanCode = String(code || "")
        .trim()
        .toUpperCase();


    // ==================================================
    // NO COUPON
    // ==================================================

    if (!cleanCode) {

        return {
            valid: false,
            price: NORMAL_PRICE,
            code: ""
        };

    }


    try {

        const url =
            `${COUPON_API}?code=${encodeURIComponent(cleanCode)}`;


        const response =
            await fetch(url, {
                method: "GET",
                cache: "no-store"
            });


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            console.error(
                "DETwal Coupon API HTTP Error:",
                response.status
            );

            return {
                valid: false,
                price: NORMAL_PRICE,
                code: cleanCode,
                error: true
            };

        }


        const data =
            await response.json();


        console.log(
            "DETwal coupon response:",
            data
        );


        // ==================================================
        // VALID COUPON
        //
        // IMPORTANT:
        // Worker returns:
        //
        // valid: true
        // price: 8
        //
        // It does NOT need success: true.
        // ==================================================

        if (
            data &&
            data.valid === true
        ) {

            const price =
                Number(data.price);


            // ==================================================
            // PRICE VALIDATION
            // ==================================================

            if (
                !Number.isFinite(price) ||
                price <= 0 ||
                price >= NORMAL_PRICE
            ) {

                console.error(
                    "DETwal invalid coupon price:",
                    data.price
                );

                return {
                    valid: false,
                    price: NORMAL_PRICE,
                    code: cleanCode,
                    error: true
                };

            }


            return {
                valid: true,

                code: String(
                    data.code || cleanCode
                )
                    .trim()
                    .toUpperCase(),

                price: price,

                originalPrice:
                    Number(
                        data.originalPrice ||
                        NORMAL_PRICE
                    ),

                discount:
                    Number(
                        data.discount ||
                        (
                            NORMAL_PRICE - price
                        )
                    )
            };

        }


        // ==================================================
        // INVALID / INACTIVE COUPON
        // ==================================================

        return {
            valid: false,
            price: NORMAL_PRICE,
            code: cleanCode
        };


    } catch (error) {

        console.error(
            "DETwal coupon validation error:",
            error
        );

        return {
            valid: false,
            price: NORMAL_PRICE,
            code: cleanCode,
            error: true
        };

    }

}
