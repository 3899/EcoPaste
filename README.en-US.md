<a href="https://github.com/EcoPasteHub/EcoPaste">
  <img src="https://socialify.git.ci/EcoPasteHub/EcoPaste/image?description=1&descriptionEditable=Open%20source%20clipboard%20management%20tools%20for%20Windows%2C%20MacOS%20and%20Linux(x11).&font=Source%20Code%20Pro&forks=1&issues=1&logo=https%3A%2F%2Fgithub.com%2FEcoPasteHub%2FEcoPaste%2Fblob%2Fmaster%2Fpublic%2Flogo.png%3Fraw%3Dtrue&name=1&owner=1&pattern=Floating%20Cogs&pulls=1&stargazers=1&theme=Auto" alt="EcoPaste" />
</a>

<div align="center">
  <br/>
  
  <div>
      English | <a href="./README.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ja-JP.md">日本語</a>
  </div>

  <br/>
    
  <div>
    <a href="https://github.com/EcoPasteHub/EcoPaste/releases">
      <img
        alt="Windows"
        src="https://img.shields.io/badge/-Windows-blue?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB0PSIxNzI2MzA1OTcxMDA2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1NDgiIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4Ij48cGF0aCBkPSJNNTI3LjI3NTU1MTYxIDk2Ljk3MTAzMDEzdjM3My45OTIxMDY2N2g0OTQuNTEzNjE5NzVWMTUuMDI2NzU3NTN6TTUyNy4yNzU1NTE2MSA5MjguMzIzNTA4MTVsNDk0LjUxMzYxOTc1IDgwLjUyMDI4MDQ5di00NTUuNjc3NDcxNjFoLTQ5NC41MTM2MTk3NXpNNC42NzA0NTEzNiA0NzAuODMzNjgyOTdINDIyLjY3Njg1OTI1VjExMC41NjM2ODE5N2wtNDE4LjAwNjQwNzg5IDY5LjI1Nzc5NzUzek00LjY3MDQ1MTM2IDg0Ni43Njc1OTcwM0w0MjIuNjc2ODU5MjUgOTE0Ljg2MDMxMDEzVjU1My4xNjYzMTcwM0g0LjY3MDQ1MTM2eiIgcC1pZD0iMTU0OSIgZmlsbD0iI2ZmZmZmZiI+PC9wYXRoPjwvc3ZnPg=="
      />
    </a >  
    <a href="https://github.com/EcoPasteHub/EcoPaste/releases">
      <img
        alt="MacOS"
        src="https://img.shields.io/badge/-MacOS-black?style=flat-square&logo=apple&logoColor=white"
      />
    </a >
    <a href="https://github.com/EcoPasteHub/EcoPaste/releases">
      <img 
        alt="Linux"
        src="https://img.shields.io/badge/-Linux-yellow?style=flat-square&logo=linux&logoColor=white" 
      />
    </a>
  </div>

  <div>
    <a href="./LICENSE">
      <img
        src="https://img.shields.io/github/license/EcoPasteHub/EcoPaste?style=flat-square"
      />
    </a >
    <a href="https://github.com/EcoPasteHub/EcoPaste/releases">
      <img
        src="https://img.shields.io/github/package-json/v/EcoPasteHub/EcoPaste?style=flat-square"
      />
    </a >
    <a href="https://github.com/EcoPasteHub/EcoPaste/releases">
      <img
        src="https://img.shields.io/github/downloads/EcoPasteHub/EcoPaste/total?style=flat-square"
      />  
    </a >
  </div>
  
  <br/>

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./static/app-dark.en-US.png" />
    <source media="(prefers-color-scheme: light)" srcset="./static/app-light.en-US.png" />
    <img src="./static/app-light.en-US.png" />
 </picture>
</div>

## Download

### Windows

Latest Version: [Download Latest Build from Releases](https://github.com/3899/EcoPaste/releases/latest)

Installation Guide: [Click here](https://ecopaste.cn/guide/install#linux)

## Features

- 🎉 Built with Tauri v2, lightweight and efficient, taking cross-platform experience to the next level.
- 💻 Compatible with Windows, macOS, and Linux (X11), enabling seamless switching between devices.
- ✨ Simple and intuitive user interface, easy to operate, zero learning curve, ready to use out of the box.
- 📋 Supports clipboard content types like plain text, rich text, HTML, images, and files.
- 🔒 Local data storage ensures user privacy and gives users full control over their data.
- 📝 Notes feature allows easy categorization, management, and retrieval to boost productivity.
- ⚙️ Rich personalization settings to meet diverse user needs and create a tailored experience.
- 🤝 Comprehensive documentation and community support to explore and grow with developers.
- 🧩 Continuously optimized with more exciting features waiting to be discovered.

## 🚀 Fork Update History

> This repository is a fork of [EcoPasteHub/EcoPaste](https://github.com/EcoPasteHub/EcoPaste) with the following usability improvements and update history:

### M04.x

#### ✨ New Features
- **☁️ WebDAV Cloud Backup Enhancement**:
  - **Decoupled Slim/Full Backups**: Segmented backup policies into "Full" and "Slim" routines. Allows independent scheduling and management for manual or automatic backups.
  - **Automated Scheduling Engine**: Built-in frontend task scheduler supporting flexible combinations of "Time", "Interval", and "Cron Expressions", enabling dual-pipeline scheduling for both full and slim backups.
- **📝 Markdown Support**: Adopted a new score-weighted regex detection strategy to accurately identify Markdown structures, preventing misclassification of code or standard text, complete with independent rich Markdown editors.
- **🖼️ Image Directory Locating**: Allows image types to open the system file explorer directly navigating precisely to the source file directory.

#### 🔄 Immersive UX Optimization
- **☁️ Seamless Restore Interaction**: Refactored WebDAV restore logic to eagerly render UI skeletons and loaders while asynchronously fetching backup arrays, eliminating UI freezing and lack of feedback.
- **💾 Backup Archive Compatibility**: Implemented a Staging Directory mapping technique ensuring WebDAV `.zip` structure is identical to native Export Data structure, achieving two-way compatibility.

#### 🔧 Internal Fixes
- **🌐 WebDAV Cross-Platform Directories**: Ensured automated creation of remote WebDAV folder trees via Rust hooks (`ensure_remote_dir`) fixing `405 Method Not Allowed` exceptions.
- **💾 Database Backup Abortion Fixes**: Defensively patched `Invalid column type Null` errors thrown by underlying Kysely when blank records exist in the Clipboard History table.

#### 🐛 Upstream Bug Fixes
- **📋 Clipboard Classification Weights**: Completely fixed an issue where copying cells in Excel resulted in forced downgrade of text content into images due to conflicting Image+HTML types holding the clipboard simultaneously.

### M03.x

#### ✨ New Features
- **☁️ WebDAV Cloud Backup**: Back up clipboard data to cloud storage via WebDAV protocol (Nutstore, NextCloud, etc.). Supports manual backup, automatic scheduled backups, backup count limits, and one-click restore.
- **Smart Delete Confirmation**: When deleting images, a "Delete local file" option (checked by default) is shown in the confirmation dialog, allowing you to keep the local file while removing only the clipboard record.

### M02.x

#### ✨ New Features
- **🎨 Dedicated Groups & Color Preview**: Added native "Links", "Colors", "Code", and "Email" group categories. Accurately extracts and highlights RGB/RGBA color formats; path links are highlighted for quick access.
- **📝 Rich Secondary Editing**: Supports independent pop-up editing for text and other rich content, with system-level quick file location.
- **💻 Code Syntax Highlighting**: Automatically detects copied code snippets and renders IDE-quality syntax highlighting (Preferences → Clipboard → Display Settings → Code Syntax Highlight).
- **🔢 Custom Code/File Display Lines**: Extended line number customizations to support Code and File datatypes. (Preferences → Clipboard → Display Settings → Code/File display lines).
- **📊 Source App Tracking**: Shows the source app's icon and name when copying (Preferences → Clipboard → Display Settings → Record App Source).
- **⚡️ Native Quick Access**: Support opening file paths directly in the system file explorer, opening web links in the browser with one click, and viewing images using the system's default image viewer.

#### 🐛 Upstream Bug Fixes
- **📸 Perfect Screenshot Dump**: Rebuilt SQLite persistence and the underlying FS mapping path to save screenshots perfectly to custom local directories, entirely fixing the issue where built-in library limits caused custom directory crashes and broken image displays, while avoiding C: drive bloat.
- **🔗 Duplicate Link Records**: Completely fixed the stubborn issue where copying a link produces two identical records in the clipboard.

### M01.x

#### 🔄 Dynamic Expand/Collapse & Immersive Experience
- **Full Content Expansion**: Provides expand/collapse buttons when content exceeds display limits; states persist across virtual scrolling.
- **No-Focus Silent Window (Windows)**: The host app retains focus when the clipboard window appears; double-click to paste silently; auto-hides when clicking outside.
- **Follow Input Cursor**: Window follows the editor's text cursor position for seamless workflow.
- **Redesigned Preferences**: Added "Display Settings" section with granular control over advanced options.

#### 📏 Advanced Text & Image Display
- **Custom Text Display Lines**: Preferences → Clipboard → Display Settings → Text display lines (1-50 lines)
- **Image Height Scaling**: Flexibly adjust image display height with smart expand/collapse (50-500 pixels)

#### ⚙️ Config Persistence
- All new settings are automatically saved to the user data directory and persist across app updates.

#### 🐛 Upstream Bug Fixes
- **📋 Clipboard Type Misidentification**: Completely fixed the issue where web images might be incorrectly identified as HTML due to html weight priority. Rewrote detection logic to give image types the highest priority.
- **💾 Backup Tunnel Restored**: Re-enabled the data backup/restore entry that was hidden due to permission restrictions in the original version, ensuring stable imports and exports.

#### 🔄 Auto Sync with Upstream
- Automatically checks for updates from upstream EcoPasteHub/EcoPaste daily
- Auto-merges and triggers builds when new versions are available
- Creates an issue for manual resolution if merge conflicts occur

---

## Feedback

1. 🔍 First, check out the [FAQ](https://ecopaste.cn/problem/macos/damage) or browse through the existing [issues](https://github.com/EcoPasteHub/EcoPaste/issues).

2. ❓ If your issue remains unresolved, please submit a new [issue](https://github.com/EcoPasteHub/EcoPaste/issues/new/choose) with a detailed description to help us quickly identify and address the problem.
