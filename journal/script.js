/* =========================
   RESET
========================= */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}


:root {
    --bg: #05070D;
    --card: #070910;
    --card-light: #090C14;
    --input: #11141E;

    --purple: #8B5CF6;
    --purple-light: #A78BFA;

    --white: #FFFFFF;
    --text: #9298A8;
    --muted: #606678;

    --border: #1D2130;

    --success: #7EE2B8;
    --danger: #FF7B8A;
}


html {
    scroll-behavior: smooth;
}


body {
    font-family: "Inter", sans-serif;
    background: var(--bg);
    color: var(--white);
    line-height: 1.6;
}


button,
input,
select,
textarea {
    font-family: inherit;
}


button {
    cursor: pointer;
}


a {
    color: inherit;
    text-decoration: none;
}


/* =========================
   NAVBAR
========================= */

.navbar {
    border-bottom: 1px solid var(--border);
    background: rgba(5, 7, 13, 0.94);

    position: sticky;
    top: 0;
    z-index: 100;
}


.nav-container {
    max-width: 1200px;
    margin: auto;
    padding: 20px 24px;

    display: flex;
    align-items: center;
    gap: 30px;
}


.logo {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -1px;
}


.nav-links {
    display: flex;
    gap: 28px;
    margin-left: auto;
}


.nav-links a {
    color: var(--text);
    font-size: 13px;
    transition: 0.2s ease;
}


.nav-links a:hover {
    color: var(--white);
}


/* =========================
   LOGGED-OUT ACCOUNT BUTTON
========================= */

.account-btn {
    padding: 9px 16px;

    border: 1px solid var(--border);
    border-radius: 8px;

    font-size: 13px;

    transition: 0.2s ease;
}


.account-btn:hover {
    border-color: var(--purple);
    color: var(--purple-light);
}


/* =========================
   LOGGED-IN ACCOUNT MENU
========================= */

.account-menu {
    position: relative;
}


.account-button {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 5px 9px 5px 5px;

    background: var(--card);
    color: var(--white);

    border: 1px solid var(--border);
    border-radius: 9px;

    font-size: 13px;
    font-weight: 600;

    transition: 0.2s ease;
}


.account-button:hover,
.account-button.active {
    border-color: var(--purple);
    background: rgba(139, 92, 246, 0.06);
}


.account-button-avatar {
    width: 31px;
    height: 31px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 8px;

    background: rgba(139, 92, 246, 0.13);
    border: 1px solid rgba(139, 92, 246, 0.28);

    color: var(--purple-light);

    font-size: 12px;
    font-weight: 700;
}


#accountName {
    max-width: 120px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


.account-arrow {
    color: var(--muted);
    font-size: 16px;
    line-height: 1;
}


/* =========================
   ACCOUNT DROPDOWN
========================= */

.account-dropdown {
    position: absolute;

    top: calc(100% + 10px);
    right: 0;

    width: 300px;

    padding: 12px;

    background: var(--card-light);

    border: 1px solid var(--border);
    border-radius: 13px;

    box-shadow:
        0 25px 70px rgba(0, 0, 0, 0.45),
        0 0 35px rgba(139, 92, 246, 0.06);

    opacity: 0;
    visibility: hidden;

    transform: translateY(-6px);

    transition:
        opacity 0.18s ease,
        visibility 0.18s ease,
        transform 0.18s ease;

    z-index: 300;
}


.account-dropdown.active {
    opacity: 1;
    visibility: visible;

    transform: translateY(0);
}


/* =========================
   ACCOUNT INFORMATION
========================= */

.account-info {
    display: flex;
    align-items: center;

    gap: 11px;

    padding: 7px;
}


.account-avatar {
    width: 43px;
    height: 43px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 11px;

    background: rgba(139, 92, 246, 0.13);

    border: 1px solid rgba(139, 92, 246, 0.28);

    color: var(--purple-light);

    font-size: 15px;
    font-weight: 700;
}


.account-details {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 2px;
}


.account-details strong {
    color: var(--white);

    font-size: 13px;
    font-weight: 700;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


.account-details span {
    color: var(--muted);

    font-size: 11px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


/* =========================
   JOURNAL PROFIT BADGE
========================= */

.profit-badge {
    margin-top: 7px;

    padding: 12px 13px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 15px;

    background: rgba(139, 92, 246, 0.06);

    border: 1px solid rgba(139, 92, 246, 0.18);
    border-radius: 9px;
}


.profit-label {
    color: var(--muted);

    font-size: 9px;
    font-weight: 700;

    letter-spacing: 1px;
}


.profit-badge strong {
    color: var(--purple-light);

    font-size: 14px;
    font-weight: 700;
}


/* =========================
   ACCOUNT DIVIDER
========================= */

.account-divider {
    height: 1px;

    margin: 10px 4px;

    background: var(--border);
}


/* =========================
   ACCOUNT DROPDOWN LINKS
========================= */

.account-dropdown > a,
.logout-btn {
    width: 100%;

    min-height: 38px;

    display: flex;
    align-items: center;

    gap: 10px;

    padding: 0 9px;

    background: transparent;

    border: none;
    border-radius: 8px;

    color: var(--text);

    font-size: 12px;
    font-weight: 500;

    text-align: left;

    transition: 0.2s ease;
}


.account-dropdown > a:hover {
    background: rgba(139, 92, 246, 0.07);
    color: var(--white);
}


.account-dropdown > a span,
.logout-btn span {
    width: 17px;

    color: var(--purple-light);

    text-align: center;
}


.logout-btn {
    margin-top: 2px;
    color: var(--danger);
}


.logout-btn:hover {
    background: rgba(255, 123, 138, 0.06);
}


/* =========================
   COMMON BUTTONS
========================= */

.primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    padding: 12px 18px;

    background: var(--purple);
    color: var(--white);

    border: none;
    border-radius: 9px;

    font-size: 13px;
    font-weight: 700;

    transition: 0.2s ease;
}


.primary-btn:hover {
    background: var(--purple-light);
    transform: translateY(-1px);
}


.secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 11px 18px;

    background: transparent;
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: 9px;

    font-size: 13px;
    font-weight: 600;

    transition: 0.2s ease;
}


.secondary-btn:hover {
    color: var(--white);
    border-color: var(--purple);
}


/* =========================
   JOURNAL LOCK
========================= */

.journal-lock {
    min-height: calc(100vh - 82px);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 70px 24px;
}


.journal-lock-card {
    width: min(560px, 100%);

    padding: 45px 35px;

    text-align: center;

    background:
        radial-gradient(
            circle at top,
            rgba(139, 92, 246, 0.08),
            transparent 55%
        ),
        var(--card);

    border: 1px solid var(--border);
    border-radius: 15px;

    box-shadow:
        0 25px 70px rgba(0, 0, 0, 0.35);
}


.lock-icon {
    width: 56px;
    height: 56px;

    margin: 0 auto 20px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(139, 92, 246, 0.10);

    border: 1px solid rgba(139, 92, 246, 0.28);
    border-radius: 14px;

    color: var(--purple-light);

    font-size: 20px;
}


.journal-lock-card h1 {
    margin-top: 10px;

    font-size: clamp(32px, 5vw, 45px);
    line-height: 1.08;

    letter-spacing: -2px;
}


.journal-lock-card h1 span {
    color: var(--purple-light);
}


.journal-lock-card p {
    max-width: 430px;

    margin: 15px auto 25px;

    color: var(--text);

    font-size: 14px;
}


.lock-actions {
    display: flex;
    justify-content: center;

    gap: 10px;
}


/* =========================
   JOURNAL PAGE
========================= */

.journal-page {
    max-width: 1200px;
    margin: auto;
    padding: 70px 24px 100px;
}


/* =========================
   HEADER
========================= */

.journal-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    gap: 30px;

    margin-bottom: 40px;
}


.eyebrow {
    display: inline-block;

    color: var(--purple-light);

    font-size: 11px;
    font-weight: 700;

    letter-spacing: 1.8px;
}


.journal-header h1 {
    margin-top: 12px;

    font-size: clamp(40px, 6vw, 62px);

    line-height: 1.05;

    letter-spacing: -3px;
}


.journal-header h1 span {
    color: var(--purple-light);
}


.journal-header p {
    max-width: 650px;

    margin-top: 17px;

    color: var(--text);

    font-size: 15px;
}


/* =========================
   STATS
========================= */

.stats-grid {
    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 14px;

    margin-bottom: 20px;
}


.stat-card {
    padding: 22px;

    background: var(--card);

    border: 1px solid var(--border);
    border-radius: 13px;
}


.stat-card span {
    display: block;

    color: var(--muted);

    font-size: 12px;
}


.stat-card strong {
    display: block;

    margin-top: 8px;

    color: var(--white);

    font-size: 25px;

    letter-spacing: -0.8px;
}


/* =========================
   DASHBOARD
========================= */

.dashboard-grid {
    display: grid;

    grid-template-columns: 1.7fr 0.8fr;

    gap: 20px;

    margin-bottom: 65px;
}


.dashboard-card {
    min-height: 350px;

    padding: 24px;

    background: var(--card);

    border: 1px solid var(--border);
    border-radius: 14px;
}


.card-header {
    display: flex;

    align-items: flex-start;
    justify-content: space-between;

    gap: 20px;
}


.card-label {
    color: var(--purple-light);

    font-size: 10px;
    font-weight: 700;

    letter-spacing: 1.5px;
}


.card-header h2 {
    margin-top: 5px;

    font-size: 19px;

    letter-spacing: -0.5px;
}


.chart-status {
    padding: 5px 9px;

    color: var(--purple-light);

    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 6px;

    font-size: 9px;
    font-weight: 700;

    letter-spacing: 1px;
}


/* =========================
   EQUITY CHART
========================= */

.chart-container {
    position: relative;

    height: 270px;

    margin-top: 25px;

    overflow: hidden;
}


#equityChart {
    width: 100%;
    height: 100%;

    overflow: visible;
}


.chart-axis {
    stroke: var(--border);

    stroke-width: 1;

    stroke-dasharray: 4 5;
}


.equity-line {
    fill: none;

    stroke: var(--purple-light);

    stroke-width: 3;

    stroke-linecap: round;
    stroke-linejoin: round;

    filter:
        drop-shadow(
            0 0 8px rgba(139, 92, 246, 0.35)
        );
}


.equity-area {
    fill: rgba(139, 92, 246, 0.08);

    stroke: none;
}


.chart-empty {
    position: absolute;

    inset: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    color: var(--muted);

    font-size: 12px;

    pointer-events: none;
}


/* =========================
   PERFORMANCE
========================= */

.performance-list {
    margin-top: 30px;
}


.performance-list > div {
    padding: 17px 0;

    display: flex;

    justify-content: space-between;
    align-items: center;

    border-bottom: 1px solid var(--border);
}


.performance-list > div:last-child {
    border-bottom: none;
}


.performance-list span {
    color: var(--text);

    font-size: 13px;
}


.performance-list strong {
    color: var(--white);

    font-size: 14px;
}


/* =========================
   TRADES
========================= */

.trades-section {
    margin-top: 20px;
}


.section-heading {
    margin-bottom: 25px;
}


.section-heading h2 {
    margin-top: 9px;

    font-size: 27px;

    letter-spacing: -1px;
}


.table-wrapper {
    overflow-x: auto;

    border: 1px solid var(--border);
    border-radius: 13px;

    background: var(--card);
}


table {
    width: 100%;

    border-collapse: collapse;

    min-width: 850px;
}


th,
td {
    padding: 16px 18px;

    text-align: left;

    border-bottom: 1px solid var(--border);

    font-size: 12px;
}


th {
    color: var(--muted);

    font-size: 10px;
    font-weight: 700;

    letter-spacing: 0.8px;

    text-transform: uppercase;
}


td {
    color: var(--text);
}


tr:last-child td {
    border-bottom: none;
}


.empty-trades {
    padding: 45px 20px;

    text-align: center;

    color: var(--muted);

    font-size: 13px;
}


/* =========================
   MODALS
========================= */

.modal {
    position: fixed;

    inset: 0;

    z-index: 1000;

    display: flex;

    align-items: center;
    justify-content: center;

    padding: 20px;
}


.modal.hidden {
    display: none;
}


.modal-overlay {
    position: absolute;

    inset: 0;

    background: rgba(0, 0, 0, 0.78);

    backdrop-filter: blur(7px);
}


.modal-card,
.login-required-card {
    position: relative;

    z-index: 2;

    width: min(700px, 100%);

    max-height: 90vh;

    overflow-y: auto;

    padding: 28px;

    background: var(--card-light);

    border: 1px solid var(--border);
    border-radius: 16px;

    box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.5),
        0 0 50px rgba(139, 92, 246, 0.08);
}


.login-required-card {
    width: min(450px, 100%);

    text-align: center;

    padding: 40px 30px;
}


.modal-header {
    display: flex;

    justify-content: space-between;
    align-items: flex-start;

    margin-bottom: 25px;
}


.modal-header h2 {
    margin-top: 7px;

    font-size: 25px;

    letter-spacing: -0.8px;
}


.modal-close {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;
    justify-content: center;

    background: var(--input);

    color: var(--text);

    border: 1px solid var(--border);
    border-radius: 8px;

    font-size: 21px;

    transition: 0.2s ease;
}


.modal-close:hover {
    color: var(--white);

    border-color: var(--purple);
}


/* =========================
   LOGIN REQUIRED
========================= */

.login-icon {
    width: 55px;
    height: 55px;

    margin: 0 auto 20px;

    display: flex;

    align-items: center;
    justify-content: center;

    background: rgba(139, 92, 246, 0.1);

    border: 1px solid rgba(139, 92, 246, 0.3);

    border-radius: 50%;

    color: var(--purple-light);

    font-size: 20px;
}


.login-required-card h2 {
    margin-top: 10px;

    font-size: 25px;

    letter-spacing: -0.8px;
}


.login-required-card p {
    margin: 12px auto 25px;

    max-width: 350px;

    color: var(--text);

    font-size: 13px;
}


.login-actions {
    display: flex;

    justify-content: center;

    gap: 10px;
}


/* =========================
   FORM
========================= */

.form-grid {
    display: grid;

    grid-template-columns: repeat(2, 1fr);

    gap: 17px;
}


.form-group {
    display: flex;

    flex-direction: column;

    gap: 7px;
}


.form-group.full-width {
    grid-column: 1 / -1;
}


.form-group label {
    color: var(--text);

    font-size: 11px;
    font-weight: 600;
}


.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;

    padding: 12px 13px;

    background: var(--input);

    color: var(--white);

    border: 1px solid var(--border);
    border-radius: 8px;

    outline: none;

    font-size: 13px;

    transition: 0.2s ease;
}


.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    border-color: var(--purple);

    box-shadow:
        0 0 0 3px rgba(139, 92, 246, 0.08);
}


.form-group select {
    cursor: pointer;
}


.form-group textarea {
    resize: vertical;
}


.form-group input::placeholder,
.form-group textarea::placeholder {
    color: var(--muted);
}


.submit-btn {
    width: 100%;

    margin-top: 24px;
}


/* =========================
   FOOTER
========================= */

.footer {
    border-top: 1px solid var(--border);

    padding: 45px 24px 25px;
}


.footer-container {
    max-width: 1200px;

    margin: auto;

    display: flex;

    justify-content: space-between;

    gap: 40px;
}


.footer-logo {
    font-size: 20px;

    font-weight: 800;
}


.footer-container p {
    margin-top: 8px;

    color: var(--muted);

    font-size: 13px;
}


.footer-links {
    display: flex;

    flex-wrap: wrap;

    gap: 20px;
}


.footer-links a {
    color: var(--text);

    font-size: 12px;
}


.footer-links a:hover {
    color: var(--white);
}


.footer-bottom {
    max-width: 1200px;

    margin: 35px auto 0;

    padding-top: 20px;

    border-top: 1px solid var(--border);

    color: var(--muted);

    font-size: 12px;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 950px) {

    .nav-links {
        display: none;
    }


    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }


    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}


@media (max-width: 650px) {

    .nav-container {
        padding: 16px 18px;
    }


    .journal-page {
        padding: 55px 18px 75px;
    }


    .journal-header {
        align-items: flex-start;

        flex-direction: column;
    }


    .journal-header h1 {
        font-size: 43px;

        letter-spacing: -2px;
    }


    .journal-header .primary-btn {
        width: 100%;
    }


    .stats-grid {
        grid-template-columns: 1fr 1fr;
    }


    .stat-card {
        padding: 17px;
    }


    .stat-card strong {
        font-size: 20px;
    }


    .dashboard-card {
        padding: 19px;
    }


    .form-grid {
        grid-template-columns: 1fr;
    }


    .form-group.full-width {
        grid-column: auto;
    }


    .login-actions {
        flex-direction: column;
    }


    .login-actions .primary-btn,
    .login-actions .secondary-btn {
        width: 100%;
    }


    .modal-card,
    .login-required-card {
        padding: 22px;
    }


    .journal-lock {
        padding: 50px 18px;
    }


    .journal-lock-card {
        padding: 35px 22px;
    }


    .lock-actions {
        flex-direction: column;
    }


    .lock-actions .primary-btn,
    .lock-actions .secondary-btn {
        width: 100%;
    }


    .account-dropdown {
        position: fixed;

        top: 72px;
        right: 15px;
        left: 15px;

        width: auto;
    }


    #accountName {
        max-width: 90px;
    }


    .footer-container {
        flex-direction: column;
    }


    .footer-links {
        flex-direction: column;

        align-items: flex-start;
    }
}
