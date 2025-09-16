# Thorbis Development Guide

## UI Package Auto-Rebuild Setup

The UI package (`@thorbis/ui`) now automatically rebuilds when you make changes, so your updates appear immediately in the apps without manual rebuilding.

### Development Commands

#### For AI App Development with UI Auto-Rebuild:
```bash
# Option 1: Use the enhanced dev script (RECOMMENDED)
npm run dev:ai

# Option 2: Use the dedicated script
npm run dev:ai-with-ui

# Option 3: Manual turbo command
turbo run dev --filter=@thorbis/ai --filter=@thorbis/ui --parallel
```

#### For Other Apps with UI Auto-Rebuild:
```bash
npm run dev:hs      # Home Services + UI auto-rebuild
npm run dev:rest    # Restaurant + UI auto-rebuild  
npm run dev:auto    # Auto Services + UI auto-rebuild
npm run dev:ret     # Retail + UI auto-rebuild
npm run dev:banking # Banking + UI auto-rebuild
# ... and so on for all apps
```

#### UI Package Only:
```bash
npm run dev:ui      # Just the UI package in watch mode
npm run dev:with-ui # UI + Design packages in watch mode
```

### How It Works

1. **Parallel Execution**: The UI package runs in watch mode alongside your app
2. **Auto-Rebuild**: When you change any file in `packages/ui/src/`, it automatically rebuilds
3. **Hot Reload**: Your app picks up the changes and hot-reloads immediately
4. **No Manual Steps**: No need to manually run `npm run build` in the UI package

### What Gets Auto-Rebuilt

- ✅ **UI Components**: All React components in `packages/ui/src/components/`
- ✅ **Hooks**: Custom hooks in `packages/ui/src/hooks/`
- ✅ **Utilities**: Helper functions and utilities
- ✅ **Types**: TypeScript definitions and exports
- ✅ **Styles**: Component-level styling changes

### File Watching

The UI package watches these directories for changes:
- `packages/ui/src/**/*.{ts,tsx,js,jsx}`
- `packages/design/src/**/*.{ts,tsx,js,jsx}` (when using `dev:with-ui`)

### Troubleshooting

If changes aren't showing up:

1. **Check the terminal**: Make sure both processes are running (app + UI)
2. **Hard refresh**: Ctrl+F5 or Cmd+Shift+R in the browser
3. **Restart dev server**: Stop and restart the development command
4. **Clear cache**: `npm run clean:cache` then restart

### Performance Notes

- **First Build**: Initial UI build takes ~6-7 seconds
- **Incremental Builds**: Subsequent builds are much faster (~1-2 seconds)
- **Memory Usage**: Running UI in watch mode uses additional ~200MB RAM
- **CPU Usage**: Minimal impact during idle, brief spike during rebuilds

### Legacy Commands (Still Work)

```bash
# Manual UI build (not needed anymore for development)
cd packages/ui && npm run build

# Manual app-specific development (without UI auto-rebuild)
turbo run dev --filter=@thorbis/ai
```

## Best Practices

1. **Use the enhanced dev scripts** (`npm run dev:ai`) for the best experience
2. **Keep UI package terminal open** to see build status and errors
3. **Make small, incremental changes** to UI components for faster feedback
4. **Check both terminals** if something isn't working (app + UI package)

## Example Workflow

```bash
# 1. Start AI development with UI auto-rebuild
npm run dev:ai

# 2. Edit a UI component
# packages/ui/src/components/business-sidebar.tsx

# 3. Save the file
# → UI package automatically rebuilds (watch terminal for confirmation)
# → AI app hot-reloads with changes (check browser)

# 4. Continue developing with instant feedback!
```

This setup eliminates the need to manually rebuild the UI package every time you make changes, making development much faster and more enjoyable! 🚀
