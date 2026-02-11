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

Latest Version: [EcoPaste_0.6.0-beta.3_Plus](https://github.com/2899/EcoPaste/releases/download/v0.6.0-beta.3_Plus/EcoPaste_0.6.0-beta.3_Plus_x64-setup.exe)

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

## 🚀 Fork Version Enhancements

> This repository is a fork of [EcoPasteHub/EcoPaste](https://github.com/EcoPasteHub/EcoPaste), with the following usability improvements added to the original version:

### 📏 Text Display Lines Configuration

- **Description**: Customize the number of lines displayed for plain text, rich text, and HTML content in clipboard entries.
- **Location**: Preferences → Clipboard → Display Settings → Text Display Lines
- **Range**: 1 - 20 lines (Default: 4 lines)
- **Effect**:
  - If content lines ≤ setting: Displays actual lines.
  - If content lines > setting: Truncates display to the set number of lines.

### 🖼️ Image Display Height Configuration

- **Description**: Customize the maximum height for image previews in the clipboard.
- **Location**: Preferences → Clipboard → Display Settings → Image Display Height
- **Range**: 50 - 500 pixels (Default: 100 pixels)
- **Effect**: If image preview height exceeds the setting, it scales down while maintaining the aspect ratio.

### 🔄 Expand/Collapse Feature

- **Description**: Provides an expand/collapse button when content exceeds display limits. Expanding shows the full content, while collapsing truncates it based on settings.
- **Applicability**:
  - Text content: Shows expand button when exceeding set lines.
  - Image content: Shows expand button when exceeding set height **AND** not filling the container width after scaling.
- **Operation**: Click the expand/collapse button at the bottom of the entry to toggle display.
- **Persistence**: Expand/collapse state is unaffected by virtual scrolling and remains unchanged after scrolling.

### 📌 Default Collapse Feature

- **Description**: Configure whether to automatically collapse all expanded content when the window is activated.
- **Location**: Preferences → Clipboard → Display Settings → Default Collapse
- **Behavior**:
  - **On**: Automatically collapses content exceeding display settings every time the window is activated.
  - **Off** (Default): Expand/collapse state is preserved regardless of window activation.

### 📍 Window Follows Cursor Position (Windows)

- **Description**: The clipboard window can follow the text cursor position.
- **Location**: Preferences → Clipboard → Window Settings → Window Position → Follow Cursor
- **How it works**:
  1. Prioritizes getting the text cursor position in the current input box.
  2. If unavailable (e.g., non-text input scenarios), falls back to following the mouse position.
- **Platform Support**: Currently only supports Windows.
- **Use Case**: Suitable for scenarios requiring frequent pasting like document editing and coding.

### 🎯 No-Focus Window Experience (Windows)

- **Description**: When the clipboard window is invoked, the original application retains focus, providing an experience consistent with Windows' built-in Win+V clipboard.
- **How it works**:
  - When invoked via shortcut, the window appears and immediately returns focus to the original application.
  - The input cursor in the original application remains visible, keeping the editing state intact.
  - Clicking a clipboard entry directly pastes it into the original application, and the window hides automatically.
  - Clicking inside the clipboard window allows normal typing for search.
  - Clicking outside the clipboard window automatically hides it.
- **Usage Flow**:
  1. Press shortcut in any app → Clipboard window floats, original app keeps focus.
  2. Click or double-click an entry → Content pastes to original app, window vanishes.
  3. Click outside the window → Window hides automatically.
  4. Press shortcut again → Window hides.
- **Platform Support**: Currently only supports Windows.

### ⚙️ Preference Settings Grouping Optimization

- Added a "Display Settings" group to logically categorize display-related configurations, including:
  - Text Display Lines, Image Display Height, Default Collapse, Operation Buttons, Auto Sort, Show Original Content.
- "Content Settings" retains: Auto Paste, Copy as Plain Text, Paste as Plain Text, Auto Favorite, Delete Confirmation.

### 🔧 Configuration Persistence

- All new configuration items are automatically saved to the user data directory.
- Settings are not lost after application updates.
- No need to manually export/import settings.

### 🔄 Auto Sync with Upstream

- This repository automatically checks for updates from upstream EcoPasteHub/EcoPaste daily.
- Automatically merges and triggers builds when new versions are available.
- Creates an issue for manual resolution if merge conflicts occur.

## 🐛 Original Version Fixes

> The following are fixes for known issues in the original EcoPaste:

### 📋 Clipboard Content Type Logic

- **Issue**:
  - When copying web images, the app might incorrectly identify them as "HTML" instead of "Image".
  - After taking a screenshot, the app might incorrectly identify the screenshot as "File" instead of "Image".
- **Fix**: Modified logic to prioritize identifying as "Image" type when clipboard content contains image data.

### 💾 Data Backup Entry

- **Issue**: Missing entry for data backup function.
- **Fix**: Displayed the data backup function entry to ensure data backup and restore features are accessible.

---

## Feedback

1. 🔍 First, check out the [FAQ](https://ecopaste.cn/problem/macos/damage) or browse through the existing [issues](https://github.com/EcoPasteHub/EcoPaste/issues)。

2. ❓ If your issue remains unresolved, please submit a new [issue](https://github.com/EcoPasteHub/EcoPaste/issues/new/choose) with a detailed description to help us quickly identify and address the problem.
