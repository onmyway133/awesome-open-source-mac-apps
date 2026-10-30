# Contributing

Thanks for helping people find great open source Mac apps. Every app is one JSON file. Open a
pull request that adds or edits a file in `apps/`. A check validates it, a maintainer reviews it,
and once it's merged the app shows up in the README and on
[indiegoodies.com](https://indiegoodies.com/awesome-open-source-mac-apps).

Not comfortable editing JSON? [Suggest an app with the form](../../issues/new/choose) instead.

## What belongs here

- **An app for macOS** that people install and use: native, or cross-platform with a Mac build.
  No libraries, frameworks, command-line-only tools, servers or plugin collections.
- **Open source**, with its code on GitHub.
- **At least 100 GitHub stars**, to keep the list useful. The check enforces this.
- **Maintained**: not archived on GitHub.

## Add an app

Create `apps/<slug>.json`. The slug is the app's name in lowercase words joined by hyphens
(`meeting-bar`, `ice-cubes`). Search `apps/` first to make sure it isn't already listed.

```json
{
  "name": "MeetingBar",
  "repo": "leits/MeetingBar",
  "description": "Your meetings at your fingertips in the macOS menu bar",
  "category": "menu-bar",
  "homepage": "https://meetingbar.app",
  "icon": "https://meetingbar.app/icon.png",
  "screenshot": "https://meetingbar.app/screenshot.png"
}
```

| Field | |
|---|---|
| `name` | Required. The app's name as its author writes it. |
| `repo` | Required. The GitHub repository as `owner/name`. |
| `description` | Required. One line, up to 160 characters, no trailing period. Say what it does, not how great it is. |
| `category` | Required. One slug from the table below. |
| `homepage` | Optional. The app's website, if it has one besides GitHub. |
| `icon` | Optional. A direct link to a square app icon (PNG, at least 128 px). |
| `screenshot` | Optional. A direct link to a screenshot of the app. |
| `stars` | Leave it out. A workflow fills it in and updates it every week. |

Use 2-space indent, the key order shown above, and a trailing newline. Don't edit `README.md`: it
is generated from the JSON files after your pull request is merged.

### Categories

| Slug | Name |
|---|---|
| `productivity` | Productivity |
| `menu-bar` | Menu Bar |
| `window-management` | Window Management |
| `system-utilities` | System Utilities |
| `clipboard` | Clipboard |
| `notes-writing` | Notes & Writing |
| `ai` | AI |
| `developer-tools` | Developer Tools |
| `code-editors` | Code Editors |
| `terminal` | Terminal |
| `git` | Git |
| `database` | Database |
| `api` | API Development |
| `virtualization` | Virtualization |
| `design` | Design & Graphics |
| `images` | Images |
| `screen-capture` | Screen Capture |
| `video` | Video |
| `audio` | Audio & Music |
| `browsers` | Browsers |
| `communication` | Communication |
| `reading` | Reading |
| `files` | Files |
| `security` | Security & Privacy |
| `translation` | Translation |
| `voice` | Voice & Dictation |
| `remote-desktop` | Remote Desktop |
| `games` | Games & Emulators |

To propose a new category, open an issue first.

## Check locally

With Node 24:

```
npm ci
npm run validate
```

To also check stars, set a GitHub token: `GITHUB_TOKEN=$(gh auth token) npm run validate`.

## Pull requests

- One app (or one fix) per pull request.
- Fill in the pull request template.
