# 🍥 AnimeLens

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.sh/)
[![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)

A powerful Discord bot for anime and manga enthusiasts! Get instant information about your favorite anime, manga, characters, and more.

> **⚠️ Alpha Version**: This project was created in just a few hours and is currently in alpha. Expect frequent updates and improvements!

## ✨ Features

- **🎯 Anime Information**: Search and get detailed info about any anime
- **👤 Character Lookup**: Find information about anime characters
- **🎲 Random Recommendations**: Discover new anime and manga
- **📈 Trending Content**: See what's popular right now on MAL
- **📅 Seasonal Anime**: Browse anime by season
- **🎵 Anime Songs**: Find theme songs and OSTs
- **📖 Manga Support**: Information about manga series
- **❓ Interactive Quiz**: Test your anime knowledge
- **💬 Quote Database**: Browse famous anime quotes
- **📋 Schedule Tracking**: Keep up with airing schedules
- **🔄 Real-time Updates**: Hot reload in development mode

## 🚀 Installation

### Prerequisites

- [Bun](https://bun.sh/) (latest version recommended)
- A Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/unloopedmido/animelens.git
   cd animelens
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   DISCORD_CLIENT_TOKEN=your_bot_token_here
   DISCORD_GUILD_ID=your_guild_id_here  # Optional: for faster command registration in development
   NODE_ENV=development  # or production
   ```

4. **Build and run**
   ```bash
   # Development mode (with hot reload)
   bun run dev

   # Production mode
   bun run build
   bun run start
   ```

## 📖 Usage

Once the bot is running and invited to your server, use slash commands to interact with it:

### Anime Commands
- `/anime info <title>` - Get detailed information about an anime
- `/anime character <name>` - Search for anime characters
- `/anime random` - Get a random anime recommendation
- `/anime trending` - View trending anime
- `/anime season <season> <year>` - Browse seasonal anime
- `/anime schedule` - Check airing schedules
- `/anime song <title>` - Find anime theme songs
- `/anime quote` - Browse anime quotes
- `/anime quiz` - Take an anime quiz

### Manga Commands
- `/manga info <title>` - Get information about a manga
- `/manga random` - Get a random manga recommendation

### Utility Commands
- `/misc ping` - Check bot latency
- `/help` - Show all available commands

## 🛠️ Development

### Key Technologies

- **Bun**: Fast JavaScript runtime and package manager
- **TypeScript**: Type-safe JavaScript with modern features
- **Discord.js v14**: Powerful Discord API wrapper
- **@discordx/pagination**: Interactive pagination for Discord

### Adding New Commands

1. Create a new file in the appropriate category folder under `src/commands/`
2. Extend the `Command` class and implement the `execute` method
3. Export the command as default
4. The loader will automatically pick it up!

Example:
```typescript
import { Command } from "../../classes/command";

export default class MyCommand extends Command {
  constructor() {
    super({
      name: "mycommand",
      description: "My awesome command",
      category: "misc", // Optional: groups commands
    });
  }

  override async execute(client, interaction) {
    // Your command logic here
  }
}
```

## 🤝 Contributing

Contributions are welcome! This is an alpha project, so there are plenty of opportunities to improve:

- Add more anime/manga features
- Improve error handling
- Add more interactive elements
- Enhance the UI/embeds
- Add localization support
- Implement caching for better performance

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MyAnimeList** for providing the anime/manga database
- **Jikan API** for the excellent REST API
- **Discord.js** community for the amazing library
- **Bun** team for the fast runtime

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/unloopedmido/animelens/issues)
- **Discord**: Join our community server (coming soon!)

---

**Made with ❤️ for anime fans, by anime fans**

*This project is not affiliated with MyAnimeList, AnimeThemes, Jikan, or any anime streaming services.*
