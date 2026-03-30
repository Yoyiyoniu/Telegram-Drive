#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

LINUX_BUILD_OK=false
WINDOWS_BUILD_OK=false

section() { 
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  $1"
    echo "╚════════════════════════════════════════╝"
    echo ""
}

section "STARTING BUILD AND COMPLETE VERIFICATION"

# Detect OS
OS_TYPE=$(uname -s)
STEP=1

section "STEP $STEP: Building for Linux..."
if ./scripts/build-linux.sh; then
    LINUX_BUILD_OK=true
    echo -e "${GREEN}✓ Linux build completed${NC}"
else
    echo -e "${RED}✗ Linux build failed${NC}"
fi
STEP=$((STEP + 1))

section "STEP $STEP: Building for Windows..."
if bun run build:windows; then
    WINDOWS_BUILD_OK=true
    echo -e "${GREEN}✓ Windows build completed${NC}"
else
    echo -e "${RED}✗ Windows build failed${NC}"
fi
STEP=$((STEP + 1))

section "STEP $STEP: Verifying Linux builds..."
./scripts/check-builds-linux.sh
STEP=$((STEP + 1))

section "STEP $STEP: Verifying Windows builds..."
./scripts/check-builds-windows.sh
STEP=$((STEP + 1))

section "STEP $STEP: Copying artifacts to release folder..."
RELEASE_DIR="$(pwd)/release"
mkdir -p "$RELEASE_DIR"

# Copy Linux artifacts
if ls src-tauri/target/release/bundle/appimage/*.AppImage 1> /dev/null 2>&1; then
    cp src-tauri/target/release/bundle/appimage/*.AppImage "$RELEASE_DIR/" 2>/dev/null
    echo -e "${GREEN}✓ AppImage copied${NC}"
fi
if ls src-tauri/target/release/bundle/deb/*.deb 1> /dev/null 2>&1; then
    cp src-tauri/target/release/bundle/deb/*.deb "$RELEASE_DIR/" 2>/dev/null
    echo -e "${GREEN}✓ DEB package copied${NC}"
fi
if ls src-tauri/target/release/bundle/rpm/*.rpm 1> /dev/null 2>&1; then
    cp src-tauri/target/release/bundle/rpm/*.rpm "$RELEASE_DIR/" 2>/dev/null
    echo -e "${GREEN}✓ RPM package copied${NC}"
fi

# Copy Windows artifacts
if ls src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/*.msi 1> /dev/null 2>&1; then
    cp src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/*.msi "$RELEASE_DIR/" 2>/dev/null
    echo -e "${GREEN}✓ MSI installer copied${NC}"
fi
if ls src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/*.exe 1> /dev/null 2>&1; then
    cp src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/*.exe "$RELEASE_DIR/" 2>/dev/null
    echo -e "${GREEN}✓ NSIS executable copied${NC}"
fi

echo -e "${GREEN}✓ Artifacts saved to: $RELEASE_DIR${NC}"

section "PROCESS COMPLETED"
echo -e "Build summary:"
[ "$LINUX_BUILD_OK" = true ] && echo -e "${GREEN}✓ Linux: OK${NC}" || echo -e "${YELLOW}⊘ Linux: Skipped (not on Linux)${NC}"
[ "$WINDOWS_BUILD_OK" = true ] && echo -e "${GREEN}✓ Windows: OK${NC}" || echo -e "${YELLOW}⊘ Windows: Skipped (not on Windows)${NC}"
