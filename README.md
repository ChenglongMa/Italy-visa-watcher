# Italy VISA Watcher

A Tampermonkey user script to monitor visa appointment availability on [prenotami.esteri.it](https://prenotami.esteri.it).

## Features

- Adds a sidebar to the booking calendar page for easy month selection.
- Automatically checks for available visa appointment slots.
- Sends desktop notifications when slots are available.
- Customizable polling interval (default: every 5 minutes).
- Lightweight and easy to use.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Create a new script in Tampermonkey.
3. Copy and paste the code from `script.user.js` into the editor.
4. Save the script.

## Usage

1. Login and navigate to the [prenotami.esteri.it Booking Calendar](https://prenotami.esteri.it/BookingCalendar).
2. Use the sidebar to select the months you want to monitor.
3. Click the "Start Watching" button to begin monitoring.
4. The script will notify you when appointment slots become available.

## How It Works

- The script injects a sidebar into the booking calendar page.
- You can select specific months to monitor for availability.
- The script periodically sends requests to the server to check for available slots.
- If slots are found, a **desktop notification** is displayed with the available dates.

## Permissions

This script requires the following permissions:
- Access to `prenotami.esteri.it` to monitor appointment availability.
- Notification permission to send desktop alerts.

## Disclaimer

This script is provided as-is and is not affiliated with or endorsed by the Italian government or [prenotami.esteri.it](https://prenotami.esteri.it). Use it at your own risk.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.