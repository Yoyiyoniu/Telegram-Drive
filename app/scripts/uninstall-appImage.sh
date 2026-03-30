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

section "UNINSTALLING APPIMAGE"

INSTALL_DIR="$HOME/.local/bin"
INSTALL_PATH="$INSTALL_DIR/penguin-drive"
DESKTOP_DIR="$HOME/.local/share/applications"
DESKTOP_FILE="$DESKTOP_DIR/penguin-drive.desktop"
ICON_DIR="$HOME/.local/share/icons"
ICON_FILE="$ICON_DIR/penguin-drive.png"

# Remove binary
if [ -f "$INSTALL_PATH" ]; then
    rm "$INSTALL_PATH"
    echo -e "${GREEN}✓ Binary uninstalled from $INSTALL_PATH${NC}"
else
    echo -e "${YELLOW}! Binary not found at $INSTALL_PATH${NC}"
fi

# Remove desktop entry
if [ -f "$DESKTOP_FILE" ]; then
    rm "$DESKTOP_FILE"
    echo -e "${GREEN}✓ Desktop entry removed${NC}"
else
    echo -e "${YELLOW}! Desktop entry not found${NC}"
fi

# Remove icon
if [ -f "$ICON_FILE" ]; then
    rm "$ICON_FILE"
    echo -e "${GREEN}✓ Icon removed${NC}"
else
    echo -e "${YELLOW}! Icon not found${NC}"
fi

echo -e "${GREEN}✓ Uninstall completed${NC}"
