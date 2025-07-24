## 🚀 Why PathPlease?

When working with AI assistants like **Claude**, **ChatGPT**, **GitHub Copilot**, or **Cursor**, context is everything. PathPlease automatically adds file paths as comments to your code, making it crystal clear which file you're sharing with AI tools.

### Before PathPlease ❌

```javascript
import React from 'react'

const UserList = () => {
  // Which UserList.tsx is this? Admin or Client?
  // AI assistants have to guess...
}
```

### After PathPlease ✅

```javascript
// File: src/components/admin/UserList.tsx
import React from 'react'

const UserList = () => {
  // AI assistants instantly know the context!
}
```

## ✨ Features

- 🔄 **Automatic Path Comments** - Adds paths when you open or save files
- 🌍 **Universal Language Support** - Works with 70+ programming languages
- 🧠 **Smart Detection** - Skips files that can't have comments (JSON, images, etc.)
- ⚡ **Zero Configuration** - Works out of the box with sensible defaults
- 🎨 **Customizable** - Configure comment styles, path formats, and exclusions
- 📁 **Workspace Aware** - Shows relative paths from your project root
- 🔧 **Professional Grade** - Built with TypeScript, comprehensive error handling

## 🛠️ Installation

1. **From VS Code Marketplace:**

   - Open VS Code
   - Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
   - Search for "PathPlease"
   - Click "Install"

2. **From Command Line:**

   ```bash
   code --install-extension Furqan.pathplease
   ```

3. **Manual Installation:**
   - Download the `.vsix` file from [Releases](https://github.com/yourusername/pathplease/releases)
   - Run: `code --install-extension pathplease-1.0.0.vsix`

## 🎯 Quick Start

PathPlease works automatically! Just install and start coding:

1. **Install the extension**
2. **Open any file** - Path comment is added automatically
3. **Share with AI** - Include the file path for better context

### Manual Controls

| Command              | Shortcut                   | Description                     |
| -------------------- | -------------------------- | ------------------------------- |
| Add Path Comment     | `Ctrl+Alt+P` (`Cmd+Alt+P`) | Add path to current file        |
| Remove Path Comment  | `Ctrl+Alt+R` (`Cmd+Alt+R`) | Remove path from current file   |
| Refresh Path Comment | `Ctrl+Alt+Shift+P`         | Update existing path comment    |
| Toggle Auto-Add      | Status Bar Click           | Enable/disable automatic adding |

## 📚 Language Support

PathPlease supports **70+ programming languages** with appropriate comment styles:

<details>
<summary><strong>Click to see supported languages</strong></summary>

| Language Family | Languages                                                                   | Comment Style     |
| --------------- | --------------------------------------------------------------------------- | ----------------- |
| **C-Style**     | JavaScript, TypeScript, Java, C#, C++, Go, Rust, Swift, Kotlin, Dart, Scala | `//`              |
| **Web**         | CSS, SCSS, LESS, Vue, Svelte                                                | `/* */` or `//`   |
| **Scripting**   | Python, Ruby, Perl, Bash, PowerShell                                        | `#`               |
| **Markup**      | HTML, XML, SVG, Markdown                                                    | `<!-- -->`        |
| **Data**        | YAML, TOML, INI, Dockerfile                                                 | `#`               |
| **Database**    | SQL, MySQL, PostgreSQL, SQLite                                              | `--`              |
| **Functional**  | Haskell, F#, OCaml, Lisp, Clojure, Elm                                      | `--` or `;`       |
| **Systems**     | Assembly, Lua, Vim, LaTeX, MATLAB                                           | Various           |
| **Modern**      | Zig, V, Crystal, Nim, Elixir, Julia                                         | Language-specific |

</details>

## ⚙️ Configuration

Open VS Code settings (`Ctrl+,`) and search for "PathPlease":

### Core Settings

```json
{
  "pathplease.autoAddOnOpen": true,
  "pathplease.autoAddOnSave": false,
  "pathplease.pathFormat": "relative",
  "pathplease.insertPosition": "top"
}
```

### Path Formats

- **`relative`** (default): `src/components/UserList.tsx`
- **`absolute`**: `/Users/john/project/src/components/UserList.tsx`
- **`filename`**: `UserList.tsx`

### Custom Comment Styles

```json
{
  "pathplease.commentStyles": {
    "python": { "start": "# ", "end": "" },
    "html": { "start": "<!-- ", "end": " -->" },
    "custom-lang": { "start": "/* ", "end": " */" }
  }
}
```

### Exclude Patterns

```json
{
  "pathplease.excludePatterns": [
    "node_modules/**",
    "dist/**",
    "**/*.min.js",
    "**/*.json",
    "**/*.log"
  ]
}
```

## 🤖 Perfect for AI Tools

PathPlease makes your code AI-ready:

### Claude & ChatGPT

```javascript
// File: src/hooks/useAuth.ts
export const useAuth = () => {
  // AI instantly knows this is a React hook in the hooks directory
}
```

### GitHub Copilot

Better context leads to more accurate suggestions.

### Cursor & Other AI IDEs

Enhanced file awareness for better code generation.

## 🎨 UI Integration

- **Status Bar**: Shows PathPlease status, click to toggle
- **Command Palette**: Access all commands via `Ctrl+Shift+P`
- **Context Menu**: Right-click for PathPlease options
- **Editor Toolbar**: Quick add button in editor title bar

## 🔧 Advanced Usage

### Workspace Configuration

Create `.vscode/settings.json` in your project:

```json
{
  "pathplease.pathFormat": "relative",
  "pathplease.excludePatterns": ["src/generated/**", "**/*.spec.ts"],
  "pathplease.commentStyles": {
    "typescript": { "start": "/** File: ", "end": " */" }
  }
}
```

### Integration with Git

```json
{
  "pathplease.enableGitIntegration": true
}
```

_Coming in v1.1: Include branch info in comments_

## 📊 Smart File Detection

PathPlease automatically skips files that can't have comments:

- ✅ **Supported**: `.js`, `.py`, `.ts`, `.java`, `.css`, `.html`, etc.
- ❌ **Skipped**: `package.json`, images, binaries, lock files

## 🚀 Performance

- **Zero Impact**: Only processes files when needed
- **Smart Caching**: Remembers which files already have comments
- **Async Operations**: Non-blocking file processing
- **Memory Efficient**: Minimal resource usage

## 🛠️ Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/yourusername/pathplease.git
cd pathplease

# Install dependencies
npm install

# Build extension
npm run compile

# Package for distribution
npm run package
```

### Testing

```bash
# Compile and test
npm run pretest
npm test

# Manual testing
code . # Open in VS Code
# Press F5 to launch Extension Development Host
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Changelog

### v1.0.0

- ✨ Initial release
- 🎯 Automatic path comment insertion
- 🌍 Support for 70+ programming languages
- 🔧 Comprehensive configuration options
- 📊 Smart file type detection
- 🎨 Professional UI integration

See [CHANGELOG.md](CHANGELOG.md) for full history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the VS Code team for excellent extension APIs
- Inspired by developer workflows with AI coding assistants
- Built with ❤️ for the developer community

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/pathplease/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/pathplease/discussions)
- 📧 **Email**: your.email@example.com
- 🐦 **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

<div align="center">

**Made with ❤️ for developers working with AI tools**

[⭐ Star on GitHub](https://github.com/yourusername/pathplease) • [📦 VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=your-publisher-name.pathplease) • [🐛 Report Bug](https://github.com/yourusername/pathplease/issues)

</div>
