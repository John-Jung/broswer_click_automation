# Multi-Tab Auto Clicker

A Chrome Extension for automated multi-tab clicking

---

## Key Features

-  **Automatic Mouse Coordinate Detection**: Real-time mouse position tracking and setup
-  **Multi-Tab Simultaneous Control**: Click simultaneously on N tabs
-  **Adjustable Click Interval**: Set from 0.1 seconds to unlimited
-  **ESC Key Control**: Toggle start/stop with ESC key
-  **Detailed Logs**: All actions recorded in console

---

## Installation

1. Create folder structure:
```
auto_click/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
└── background.js
```

2. Load in Chrome:
   - Enter `chrome://extensions/` 
   - Turn ON "Developer mode"
   - Click "Load unpacked" → Select `auto_click` folder

---

## Usage

### Step 1: Set Coordinates (for each tab)
- Click "Set Position (Current Tab)"
- Move mouse - coordinates display in real-time
- Click desired location → coordinates locked

### Step 2: Set Click Interval (Optional)
- Enter value in "Click Interval (seconds)" field
  - 0.5: 0.5 second interval
  - 1: 1 second interval
  - 2: 2 second interval
- Click "Set Interval"

### Step 3: Start/Stop Clicking
- **Press ESC**: Start clicking simultaneously on all configured tabs
- **Press ESC again**: Stop clicking on all tabs

---

## File Description

| File | Role |
|------|------|
| **manifest.json** | Extension configuration |
| **popup.html** | UI (coordinate display, interval setting) |
| **popup.js** | Popup logic |
| **background.js** | Service Worker (message hub) |
| **content.js** | Execute clicks on webpage |

---

## Architecture

```
Content Script (each tab)
        ↓
Service Worker (central message processing)
        ↓
Broadcast command to all tabs (simultaneously)
        ↓
Execute clicks
```

---

## Use Cases

- CSRF attack simulation
- Clickjacking vulnerability testing
- UI automation weakness testing
- Server load testing