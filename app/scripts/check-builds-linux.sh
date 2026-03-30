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

section "CHECKING LINUX BUILD ARTIFACTS"

ARTIFACTS_FOUND=true

# Check for AppImage
APPIMAGE_PATH="$ROOT_DIR/src-tauri/target/release/bundle/appimage/"*".AppImage"
if ls $APPIMAGE_PATH 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓ AppImage found${NC}"
    ls -lh $APPIMAGE_PATH
else
    echo -e "${RED}✗ AppImage not found${NC}"
    ARTIFACTS_FOUND=false
fi

# Check for deb package
DEB_PATH="$ROOT_DIR/src-tauri/target/release/bundle/deb/"*".deb"
if ls $DEB_PATH 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓ DEB package found${NC}"
    ls -lh $DEB_PATH
else
    echo -e "${RED}✗ DEB package not found${NC}"
    ARTIFACTS_FOUND=false
fi

# Check for rpm package
RPM_PATH="$ROOT_DIR/src-tauri/target/release/bundle/rpm/"*".rpm"
if ls $RPM_PATH 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓ RPM package found${NC}"
    ls -lh $RPM_PATH
else
    echo -e "${YELLOW}! RPM package not found (optional)${NC}"
fi

if [ "$ARTIFACTS_FOUND" = true ]; then
    echo -e "${GREEN}✓ All required Linux build artifacts found${NC}"
    exit 0
else
    echo -e "${RED}✗ Some required artifacts are missing${NC}"
    exit 1
fi
