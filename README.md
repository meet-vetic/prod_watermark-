# Prod Guard

A Chrome extension that overlays a watermark on production websites, to reduce the risk of making changes in the wrong environment.

## Installation

1. Download this repository (**Code → Download ZIP**) and extract it.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder.
5. Optionally, pin the extension to the toolbar.

## Usage

1. Open a production site and click the extension icon.
2. Click **Mark this site as PROD**, or enter a domain manually.
3. The watermark appears immediately on all open tabs for that domain.

### Domain matching

| Entry           | Matches                                  |
|-----------------|------------------------------------------|
| `app.example.com` | Only `app.example.com`                  |
| `*.example.com`   | `example.com` and all of its subdomains |

Full URLs are accepted. Only the hostname is saved.

### Settings

- **Watermark text:** defaults to `PRODUCTION`. You can change it in the popup.
- **Intensity:** a 1–5 slider. At 1, a single label appears in the centre of the page. At 5, the page is covered with a full-strength tiled pattern.
- **On/Off:** turns the watermark off on all sites without clearing your domain list.

## Privacy

The extension collects no data and makes no network requests. Settings are stored in `chrome.storage.sync`.

## Permissions

| Permission  | Purpose                                     |
|-------------|---------------------------------------------|
| `storage`   | Save the domain list and settings           |
| `activeTab` | Read the current tab's URL when adding a site |
