const events = [
    {
        time: "08:30",
        name: "Non-Farm Payrolls",
        country: "USD",
        impact: "high",
        previous: "—",
        forecast: "—",
        actual: "—",
        description: "Employment data that can create significant volatility across financial markets."
    },
    {
        time: "10:00",
        name: "ISM Manufacturing PMI",
        country: "USD",
        impact: "medium",
        previous: "—",
        forecast: "—",
        actual: "—",
        description: "A business activity indicator used to assess manufacturing conditions."
    },
    {
        time: "14:00",
        name: "FOMC Interest Rate Decision",
        country: "USD",
        impact: "high",
        previous: "—",
        forecast: "—",
        actual: "—",
        description: "A major monetary-policy event that may affect currencies, bonds and gold."
    }
];

const eventsList = document.getElementById("eventsList");
const impactFilter = document.getElementById("impactFilter");

const nextEvent = document.getElementById("nextEvent");
const eventTime = document.getElementById("eventTime");
const eventsToday = document.getElementById("eventsToday");
const currentSession = document.getElementById("currentSession");

const selectedEvent = document.getElementById("selectedEvent");
const eventDescription = document.getElementById("eventDescription");
const previousData = document.getElementById("previousData");
const forecastData = document.getElementById("forecastData");
const actualData = document.getElementById("actualData");


function renderEvents(filter = "all") {

    const filteredEvents =
        filter === "all"
            ? events
            : events.filter(event => event.impact === filter);

    if (filteredEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="event-item">
                <div></div>
                <div class="event-name">
                    No events found.
                </div>
            </div>
        `;
        return;
    }

    eventsList.innerHTML = filteredEvents.map((event, index) => {

        return `
            <div class="event-item" data-index="${events.indexOf(event)}">

                <div class="event-time">
                    ${event.time}
                </div>

                <div>
                    <div class="event-name">
                        ${event.name}
                    </div>

                    <div class="event-country">
                        ${event.country}
                    </div>
                </div>

                <span class="impact ${event.impact}">
                    ${event.impact.toUpperCase()}
                </span>

            </div>
        `;

    }).join("");

    document.querySelectorAll(".event-item[data-index]").forEach(item => {

        item.addEventListener("click", () => {

            const index = Number(item.dataset.index);

            showEvent(events[index]);

        });

    });
}


function showEvent(event) {

    selectedEvent.textContent = event.name;

    eventDescription.textContent =
        event.description;

    previousData.textContent =
        event.previous;

    forecastData.textContent =
        event.forecast;

    actualData.textContent =
        event.actual;
}


function updateOverview() {

    eventsToday.textContent = events.length;

    if (events.length > 0) {

        nextEvent.textContent =
            events[0].name;

        eventTime.textContent =
            `Today at ${events[0].time}`;

    }

    const hour = new Date().getHours();

    if (hour >= 0 && hour < 8) {
        currentSession.textContent = "Asia";
    } else if (hour >= 8 && hour < 13) {
        currentSession.textContent = "London";
    } else if (hour >= 13 && hour < 21) {
        currentSession.textContent = "New York";
    } else {
        currentSession.textContent = "Asia";
    }
}


impactFilter.addEventListener("change", () => {

    renderEvents(
        impactFilter.value
    );

});


renderEvents();
updateOverview();

if (events.length > 0) {
    showEvent(events[0]);
}
