// ==UserScript==
// @name         Italy VISA Watcher
// @namespace    https://github.com/ChenglongMa/tampermonkey-scripts
// @version      1.0.0
// @description  Watch for visa appointment availability on prenotami.esteri.it
// @author       Chenglong Ma
// @match        *://*.prenotami.esteri.it/BookingCalendar*
// @grant        none
// @license      MIT
// @icon         data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODk4LjU2IDE4OTguNTYiPgogIDxwYXRoIGQ9Ik0xNjYuMSw5NDkuMjhjMC00MzEuODcsMzUxLjMxLTc4My4xOCw3ODMuMTgtNzgzLjE4LDE5Ni45NSwwLDM4Mi42Myw3Mi4xNCw1MjcuMDIsMjAzLjgzbDEwNC42NC0xMjkuMkMxNDA3LjAyLDg1LjA3LDExODQuNjgsMCw5NDkuMjgsMCw0MjUuODIsMCwwLDQyNS44MiwwLDk0OS4yOGMwLDM3NC42OCwyMTguMzEsNjk5LjUzLDUzNC41LDg1My43N2wxMDcuODUtMTMzLjM2Yy0yNzkuNzctMTE5LjYtNDc2LjI0LTM5Ny40Ni00NzYuMjQtNzIwLjQyWiIvPgogIDxwYXRoIGQ9Ik0xNzY0LjAyLDQ2MS43N2wtNjEuMS0xMDEuOC00NTEuMzMsNTU3LjM5TDY4Ny42NywzNjAuNjhWMTYxMy44MWwxNjYuMS0yMDUuMTRWNzU4LjAzbDQxMS41OCw0MDYuMjQsNDEwLjc1LTUwNy4yMWMzNy4wMiw5Mi4zMSw1Ni4zNiwxOTEuNDksNTYuMzYsMjkyLjIyLDAsNDMxLjc1LTM1MS4zMSw3ODMuMTgtNzgzLjE4LDc4My4xOC00NS45MiwwLTkwLjg4LTMuOTEtMTM0LjU1LTExLjYzbC0xMTYuNTEsMTQ0LjA0Yzc5Ljk3LDIxLjk1LDE2NC4yLDMzLjY5LDI1MS4wNiwzMy42OSw1MjMuNDYsMCw5NDkuMjgtNDI1Ljk0LDk0OS4yOC05NDkuMjgsMC0xNzIuMDQtNDYuNTEtMzQwLjYzLTEzNC41NC00ODcuNTFaIi8+Cjwvc3ZnPg==
// ==/UserScript==

(function () {
    'use strict';

    // --- Locate the heading container ---
    const heading = document.querySelector('.heading-container');
    if (!heading) return;
    heading.style.position = 'relative';

    // --- Inject CSS for left‑aligning checkboxes and spinner animation ---
    const style = document.createElement('style');
    style.textContent = `
        /* Left-align all checkboxes */
        #vw-sidebar form { text-align: left; }

        /* Spinner keyframes */
        @keyframes vw-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        /* Spinner styling */
        .vw-spinner {
            border: 4px solid rgba(0,0,0,0.1);
            border-top: 4px solid #333;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: vw-spin 1s linear infinite;
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
        }
        /* Watching indicator container */
        #vw-watching-indicator {
            display: none;
            margin-top: 10px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);

    // --- Build the sidebar ---
    const sidebar = document.createElement('div');
    sidebar.id = 'vw-sidebar';
    Object.assign(sidebar.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '220px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        zIndex: '1000'
    });

    // Month checkboxes
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const form = document.createElement('form');
    form.id = 'vw-month-form';
    const title = document.createElement('h4');
    title.textContent = 'Select Months';
    form.appendChild(title);

    months.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'checkbox';
        const label = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = i + 1;        // 1–12
        cb.name = 'vw-month';
        cb.style.marginRight = '6px';
        label.appendChild(cb);
        label.appendChild(document.createTextNode(m));
        div.appendChild(label);
        form.appendChild(div);
    });

    // Toggle button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'vw-toggle-watch';
    btn.textContent = 'Start Watching';
    btn.disabled = true;
    btn.className = 'button primary';
    Object.assign(btn.style, {
        display: 'block',
        width: '100%',
        marginTop: '10px',
        padding: '6px 0'
    });

    // Watching indicator (spinner + text)
    const indicator = document.createElement('div');
    indicator.id = 'vw-watching-indicator';
    const spinner = document.createElement('span');
    spinner.className = 'vw-spinner';
    const label = document.createElement('span');
    label.textContent = 'Watching…';
    indicator.appendChild(spinner);
    indicator.appendChild(label);

    // Assemble sidebar
    sidebar.appendChild(form);
    sidebar.appendChild(btn);
    sidebar.appendChild(indicator);
    heading.appendChild(sidebar);

    // --- Utility functions ---

    let watchInterval = null;

    /**
     * Fetch availability for a given month and notify if slots open.
     * @param {number} month - Month index (1-12)
     */
    function checkAvailability(month) {
        fetch("https://prenotami.esteri.it/BookingCalendar/RetrieveCalendarAvailability", {
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "content-type": "application/json; charset=UTF-8"
            },
            referrer: "https://prenotami.esteri.it/BookingCalendar?selectedService=Soggiorni%20da%201%20a%2090%20giorni%20nell%27area%20Schengen",
            body: JSON.stringify({
                _Servizio: "498",
                selectedDay: `${new Date().getFullYear()}-${month}-01`,
            }),
            method: "POST",
            mode: "cors",
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const parsedData = JSON.parse(data);
                const availableDates = parsedData.filter(item => item.SlotLiberi > 0);
                if (availableDates.length > 0) {
                    console.log("Available dates:", availableDates);
                    sendNotification(month, availableDates);
                    stopWatching(); // Stop polling
                } else {
                    console.log("No available dates.");
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                showMessage("Error fetching data. Please reload the page.");
            });
    }

    function showMessage(msg) {
        const message = document.createElement('div');
        message.innerText = `${msg}\n
        (Click to dismiss)`;
        Object.assign(message.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: '#ff8f6b',
            color: '#fff',
            padding: '10px',
            borderRadius: '4px',
            zIndex: '1000',
            cursor: 'pointer',
        });
        message.addEventListener('click', () => message.remove());
        // setTimeout(() => {
        //     if (document.body.contains(message)) {
        //         message.remove();
        //     }
        // }, 5000); // Auto-remove after 5 seconds
        document.body.appendChild(message);
    }

    /**
     * Send desktop notification of available dates.
     * @param {number} month - Month index (1-12)
     * @param {Array} availableDates
     */
    function sendNotification(month, availableDates) {
        const msg = `Found available dates for ${months[month - 1]}!\n
        Please refresh the page to see them.`;
        showMessage(msg);

        if (Notification.permission === "granted") {
            const firstDate = new Date(availableDates[0].DateLibere).toLocaleDateString();
            new Notification("VISA Appointment Available for " + months[month - 1], {
                body: `First available date: ${firstDate}`,
                icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODk4LjU2IDE4OTguNTYiPgogIDxwYXRoIGQ9Ik0xNjYuMSw5NDkuMjhjMC00MzEuODcsMzUxLjMxLTc4My4xOCw3ODMuMTgtNzgzLjE4LDE5Ni45NSwwLDM4Mi42Myw3Mi4xNCw1MjcuMDIsMjAzLjgzbDEwNC42NC0xMjkuMkMxNDA3LjAyLDg1LjA3LDExODQuNjgsMCw5NDkuMjgsMCw0MjUuODIsMCwwLDQyNS44MiwwLDk0OS4yOGMwLDM3NC42OCwyMTguMzEsNjk5LjUzLDUzNC41LDg1My43N2wxMDcuODUtMTMzLjM2Yy0yNzkuNzctMTE5LjYtNDc2LjI0LTM5Ny40Ni00NzYuMjQtNzIwLjQyWiIvPgogIDxwYXRoIGQ9Ik0xNzY0LjAyLDQ2MS43N2wtNjEuMS0xMDEuOC00NTEuMzMsNTU3LjM5TDY4Ny42NywzNjAuNjhWMTYxMy44MWwxNjYuMS0yMDUuMTRWNzU4LjAzbDQxMS41OCw0MDYuMjQsNDEwLjc1LTUwNy4yMWMzNy4wMiw5Mi4zMSw1Ni4zNiwxOTEuNDksNTYuMzYsMjkyLjIyLDAsNDMxLjc1LTM1MS4zMSw3ODMuMTgtNzgzLjE4LDc4My4xOC00NS45MiwwLTkwLjg4LTMuOTEtMTM0LjU1LTExLjYzbC0xMTYuNTEsMTQ0LjA0Yzc5Ljk3LDIxLjk1LDE2NC4yLDMzLjY5LDI1MS4wNiwzMy42OSw1MjMuNDYsMCw5NDkuMjgtNDI1Ljk0LDk0OS4yOC05NDkuMjgsMC0xNzIuMDQtNDYuNTEtMzQwLjYzLTEzNC41NC00ODcuNTFaIi8+Cjwvc3ZnPg=="
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    sendNotification(month, availableDates);
                }
            });
        }
    }

    function keepSessionAlive() {
        fetch(window.location.href, {
            method: 'GET',
            credentials: 'include'
        })
            .catch(err => console.warn('Keep‑alive fails', err));
    }

    function anyChecked() {
        return Array.from(form.querySelectorAll('input[type=checkbox]')).some(cb => cb.checked);
    }

    function getSelectedMonths() {
        return Array.from(form.querySelectorAll('input[type=checkbox]:checked'))
            .map(cb => parseInt(cb.value, 10));
    }

    function check(months) {
        console.log('Running check for months:', months);
        months.forEach((month, i) => {
            // Stagger requests by 3 seconds each
            setTimeout(() => checkAvailability(month), i * 3000);
        });
    }

    // --- Event wiring ---
    // Enable/disable toggle button
    form.addEventListener('change', () => {
        btn.disabled = !anyChecked();
    });

    // Start/stop watching
    function stopWatching() {
        // Stop polling
        clearInterval(watchInterval);
        watchInterval = null;
        // Hide indicator
        indicator.style.display = 'none';
        btn.textContent = 'Start Watching';
        btn.style.backgroundColor = '';
    }

    btn.addEventListener('click', () => {

        if (watchInterval == null) {
            // Request notification permission if needed
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
            // Show indicator
            indicator.style.display = 'block';
            btn.textContent = 'Stop Watching';
            btn.style.backgroundColor = '#ff8f6b';

            // Run immediately
            check(getSelectedMonths());
            // Schedule every 5 minutes
            watchInterval = setInterval(() => {
                keepSessionAlive();
                check(getSelectedMonths());
            }, 5 * 60 * 1000);
        } else {
            // Stop polling
            stopWatching();
        }
    });
})();
