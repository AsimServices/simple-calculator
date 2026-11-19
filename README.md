# Aura Calculator 🧮

A modern, responsive, and tactile basic calculator web application designed for everyday calculations with a premium look and feel.

![Aura Calculator Preview](https://raw.githubusercontent.com/AsimServices/simple-calculator/main/preview.png)

## ✨ Features

- **Standard Arithmetic**: Addition (+), Subtraction (−), Multiplication (×), Division (÷).
- **Utility Actions**: Percentage (%), Plus/Minus (±), Clear All (AC), Backspace/Delete (⌫).
- **Floating Point Precision Handling**: Eliminates common binary floating-point anomalies (e.g. `0.1 + 0.2 = 0.3`).
- **Calculation History (Tape)**: Persistent recent calculations stored in `localStorage` with one-click restore.
- **Copy to Clipboard**: Easily copy the current result to your clipboard with instant feedback.
- **Dark & Light Mode**: Built-in sleek obsidian dark theme and crisp modern light theme.
- **Haptic Audio Feedback**: Synthesized mechanical click sound (powered by Web Audio API, zero external assets).
- **Full Physical Keyboard Support**: Complete keyboard bindings with real-time on-screen button highlight animations.

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `0` - `9` | Enter Digits |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Operations (+, −, ×, ÷) |
| `Enter` or `=` | Calculate Result |
| `Backspace` | Delete last digit |
| `Escape` or `C` | Clear All (AC) |
| `%` | Percentage |

## 🚀 Running Locally

You can open `index.html` directly in any web browser, or start a local lightweight web server:

```bash
# Using Node / npx
npx serve .

# Or using Python
python -m http.server 3000
```

## 🌐 Deploying to the Web

### Deploy via Vercel (Instant 1-Command)
```bash
vercel --prod
```

### Deploy via GitHub Pages
1. Push this folder to a GitHub repository.
2. In GitHub repository settings, enable **GitHub Pages** from the `main` branch.
