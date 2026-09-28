const COUPON_API =
    "https://detwal-help-bot.dakshdetwal10.workers.dev/subscription-coupon";

const NORMAL_PRICE = 9;


/*
==================================================
VALIDATE NEWS TRADING COUPON
==================================================
*/

async function validateCoupon(code) {

    const cleanCode = String(code || "")
        .trim()
        .toUpperCase();


    // No coupon entered

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


        if (!response.ok) {

            console.error(
                "Coupon API HTTP error:",
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


        // Valid coupon

        if (
            data &&
            data.success === true &&
            data.valid === true
        ) {

            const price =
                Number(data.price);


            // Make sure Worker returned a valid price

            if (
                !Number.isFinite(price) ||
                price < 0 ||
                price >= NORMAL_PRICE
            ) {

                console.error(
                    "Invalid coupon price:",
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
                ).toUpperCase(),
                price: price
            };

        }


        // Invalid / inactive coupon

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
