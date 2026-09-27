// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

const supabaseClient =
    window.supabase.createClient(
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
// WHATSAPP COMMUNITY
// ===============================

const whatsappLink =
    "https://chat.whatsapp.com/J1zCNyN068J7lMidiixMVU";


const joinButtons = [

    document.getElementById("joinCommunity"),

    document.getElementById("joinCommunityBottom")

];


joinButtons.forEach(button => {

    if (!button) return;


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            window.open(
                whatsappLink,
                "_blank",
                "noopener,noreferrer"
            );

        }
    );

});
