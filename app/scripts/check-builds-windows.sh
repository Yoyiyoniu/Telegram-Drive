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

section "CHECKING WINDOWS BUILD ARTIFACTS"

ARTIFACTS_FOUND=true

# Check for MSI installer
MSI_PATH="$ROOT_DIR/src-tauri/target/release/bundle/msi/"*".msi"
if ls $MSI_PATH 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓ MSI installer found${NC}"
    ls -lh $MSI_PATH
else
    echo -e "${RED}✗ MSI installer not found${NC}"
    ARTIFACTS_FOUND=false
fi

# Check for portable exe
EXE_PATH="$ROOT_DIR/src-tauri/target/release/bundle/nsis/"*".exe"
if ls $EXE_PATH 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓ NSIS executable found${NC}"
    ls -lh $EXE_PATH
else
    echo -e "${RED}✗ NSIS executable not found${NC}"
    ARTIFACTS_FOUND=false
fi

if [ "$ARTIFACTS_FOUND" = true ]; then
    echo -e "${GREEN}✓ All required Windows build artifacts found${NC}"
    exit 0
else
    echo -e "${RED}✗ Some required artifacts are missing${NC}"
    exit 1
fi
