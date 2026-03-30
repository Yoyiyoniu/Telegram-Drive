#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

section() { 
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  $1"
    echo "╚════════════════════════════════════════╝"
    echo ""
}

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." >/dev/null 2>&1 && pwd)"

section "INSTALLING APPIMAGE"

# Find the AppImage file
APPIMAGE_FILE=$(ls "$ROOT_DIR/src-tauri/target/release/bundle/appimage/"*".AppImage" 2>/dev/null | head -n 1)

if [ -z "$APPIMAGE_FILE" ]; then
    echo -e "${RED}✗ AppImage not found${NC}"
    echo "Please run build-linux.sh first"
    exit 1
fi

echo -e "${YELLOW}Found AppImage: $APPIMAGE_FILE${NC}"

# Make it executable
chmod +x "$APPIMAGE_FILE"
echo -e "${GREEN}✓ Made AppImage executable${NC}"

# Install to /opt or ~/.local/bin
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

INSTALL_PATH="$INSTALL_DIR/penguin-drive"
cp "$APPIMAGE_FILE" "$INSTALL_PATH"
chmod +x "$INSTALL_PATH"

echo -e "${GREEN}✓ AppImage installed to $INSTALL_PATH${NC}"

# Create desktop entry for application menu
DESKTOP_DIR="$HOME/.local/share/applications"
mkdir -p "$DESKTOP_DIR"

DESKTOP_FILE="$DESKTOP_DIR/penguin-drive.desktop"
cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Penguin Drive
Exec=penguin-drive
Icon=$HOME/.local/share/icons/penguin-drive.png
Categories=Utility;
Terminal=false
EOF

# Copy icon to standard location
ICON_DIR="$HOME/.local/share/icons"
mkdir -p "$ICON_DIR"
cp "$ROOT_DIR/src-tauri/icons/128x128.png" "$ICON_DIR/penguin-drive.png"

chmod +x "$DESKTOP_FILE"
echo -e "${GREEN}✓ Desktop entry created${NC}"
echo -e "${GREEN}✓ You can now run 'penguin-drive' from your terminal${NC}"
echo -e "${GREEN}✓ The app should appear in your application menu${NC}"
