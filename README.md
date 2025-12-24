# SelfOwO Bot 🤖

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.0.0-green.svg) ![Author](https://img.shields.io/badge/author-Spectral-purple.svg)

**SelfOwO Bot** is a comprehensive, automated selfbot designed for the OwO Discord bot, featuring a modern WebUI for real-time monitoring and configuration. Built with TypeScript, React, and Discord.js Selfbot v13.

**Made by [Spectral.](https://spectralportfolio.vercel.app/)**

## ✨ Features

### 🎮 Automation
*   **Auto Hunt & Battle:** Automatically runs `owo hunt` and `owo battle`.
*   **Smart Gem Usage:** Detects missing gems and automatically equips them from your inventory.
*   **Auto Pray/Curse:** Configurable auto-pray/curse for yourself or other users.
*   **Gambling:** Auto Coinflip and Slots with safe balance checks (stops if balance is too low).
*   **Inventory Management:** Auto-sell and auto-sacrifice items based on rarity.
*   **Leveling:** Auto-assigns attribute points to specified stats (e.g., strength, magic).
*   **Quests:** Automatically selects and completes daily quests.

### 🛡️ Safety & Security
*   **Captcha Detection:** Automatically pauses the bot upon detecting a captcha challenge.
*   **Admin Notifications:** Sends a DM to the admin account when a captcha is detected.
*   **Human-like Delays:** Randomized cooldowns to mimic human behavior.

### 💻 Web Dashboard
*   **Real-time Stats:** View total hunts, battles, gems used, and more.
*   **Live Logs:** Watch the bot's actions in real-time via a streaming log viewer.
*   **Configuration:** Toggle features and adjust settings directly from the web interface.
*   **Responsive Design:** Fully optimized for mobile and desktop.
*   **Multi-Account:** Support for Main and Extra accounts running simultaneously.

### 🎨 Customization
*   **Rich Presence:** Custom Discord status (Sitting/Streaming) with interactive buttons.
*   **Themes:** Beautiful, modern UI with dark mode aesthetics.

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/selfowobot.git
    cd selfowobot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    cd frontend
    npm install
    cd ..
    ```

3.  **Configure the bot:**
    *   Rename `config.example.json` to `config.json`.
    *   Edit `config.json` with your Discord tokens and Admin ID.

4.  **Build the project:**
    ```bash
    npm run build
    ```

5.  **Start the bot:**
    ```bash
    npm start
    ```

## ⚙️ Configuration

You can configure the bot either by editing `config.json` manually or using the **Settings** page in the WebUI (running at `http://localhost:1243` by default).

| Setting | Description |
| :--- | :--- |
| `autoHunt` | Enable/Disable auto hunting. |
| `autoBattle` | Enable/Disable auto battling. |
| `autoGem` | Auto-equip gems (0=Off, 1=Fabled, 2=Common...). |
| `autoPray` | Enable/Disable auto praying. |
| `prayCurseTarget` | Target for pray/curse (self/other). |
| `autoGamble` | Configure coinflip and slots automation. |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
**Made with ❤️ by Spectral.**
