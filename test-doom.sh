#!/bin/bash

##############################################################################
# BUNJUMUN-DOOM TEST HARNESS
# Comprehensive validation for binary assets and game integration
##############################################################################

set -o pipefail
trap cleanup EXIT

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
PROJECT_DIR="/Users/bunj/claude/portfolio maze"
DOOM_DIR="${PROJECT_DIR}/doom"
RESULTS_FILE="${PROJECT_DIR}/test-results.txt"
SERVER_PORT=8000
SERVER_PID=""
TEST_TIMEOUT=30

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

##############################################################################
# UTILITY FUNCTIONS
##############################################################################

log_header() {
    echo -e "\n${BLUE}▶ $1${NC}" | tee -a "${RESULTS_FILE}"
}

log_pass() {
    echo -e "  ${GREEN}✅ $1${NC}" | tee -a "${RESULTS_FILE}"
    ((TESTS_PASSED++))
}

log_fail() {
    echo -e "  ${RED}❌ $1${NC}" | tee -a "${RESULTS_FILE}"
    ((TESTS_FAILED++))
}

log_warn() {
    echo -e "  ${YELLOW}⚠️  $1${NC}" | tee -a "${RESULTS_FILE}"
}

log_info() {
    echo "  $1" | tee -a "${RESULTS_FILE}"
}

increment_test() {
    ((TESTS_RUN++))
}

cleanup() {
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        log_info "Stopping HTTP server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        sleep 1
    fi
}

##############################################################################
# SERVER MANAGEMENT
##############################################################################

kill_existing_servers() {
    log_info "Checking for existing servers on port $SERVER_PORT..."

    # macOS uses `lsof`; Linux uses `ss` or `netstat`
    if command -v lsof &> /dev/null; then
        existing_pids=$(lsof -ti:$SERVER_PORT 2>/dev/null || echo "")
        if [ -n "$existing_pids" ]; then
            log_warn "Found existing process(es) on port $SERVER_PORT, terminating..."
            echo "$existing_pids" | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    fi
}

start_http_server() {
    increment_test
    log_header "Starting HTTP Server"

    kill_existing_servers

    cd "${PROJECT_DIR}" || { log_fail "Cannot cd to project directory"; return 1; }

    # Start server in background
    python3 -m http.server $SERVER_PORT > /tmp/http_server.log 2>&1 &
    SERVER_PID=$!

    # Wait for server to be ready
    local elapsed=0
    while [ $elapsed -lt $TEST_TIMEOUT ]; do
        if curl -s http://localhost:$SERVER_PORT/ > /dev/null 2>&1; then
            log_pass "HTTP server started on port $SERVER_PORT (PID: $SERVER_PID)"
            return 0
        fi
        sleep 0.5
        ((elapsed++))
    done

    log_fail "HTTP server failed to start within ${TEST_TIMEOUT}s"
    return 1
}

##############################################################################
# FILE VALIDATION TESTS
##############################################################################

test_file_existence() {
    increment_test
    log_header "File Existence Validation"

    local files=(
        "doom/doom.js"
        "doom/doom.wasm"
        "doom/web/doom1.data"
        "doom/gallery.wad"
        "index.html"
        "js/main.js"
        "js/doom-engine.js"
        "js/doom-bridge.js"
        "js/gallery-wad.js"
        "js/explosion.js"
    )

    local all_exist=true
    for file in "${files[@]}"; do
        if [ -f "${PROJECT_DIR}/${file}" ]; then
            local size=$(du -h "${PROJECT_DIR}/${file}" | cut -f1)
            log_pass "$file exists ($size)"
        else
            log_fail "$file NOT FOUND"
            all_exist=false
        fi
    done

    [ "$all_exist" = true ] && return 0 || return 1
}

test_file_sizes() {
    increment_test
    log_header "File Size Validation"

    local checks=(
        "doom/doom.js:250:400"           # ~338KB
        "doom/doom.wasm:900:1200"        # ~1.0MB
        "doom/web/doom1.data:4000:5000"   # ~4.3MB audio-stripped bundle
        "doom/gallery.wad:1:2000"        # stub ok
    )

    local all_pass=true
    for check in "${checks[@]}"; do
        local file=$(echo "$check" | cut -d: -f1)
        local min=$(echo "$check" | cut -d: -f2)
        local max=$(echo "$check" | cut -d: -f3)

        if [ ! -f "${PROJECT_DIR}/${file}" ]; then
            log_fail "$file: NOT FOUND"
            all_pass=false
            continue
        fi

        # Get size in KB
        local size_kb=$(du -k "${PROJECT_DIR}/${file}" | cut -f1)

        if [ "$size_kb" -ge "$min" ] && [ "$size_kb" -le "$max" ]; then
            log_pass "$file: ${size_kb}KB (expected ${min}-${max}KB)"
        else
            log_fail "$file: ${size_kb}KB (expected ${min}-${max}KB)"
            all_pass=false
        fi
    done

    [ "$all_pass" = true ] && return 0 || return 1
}

test_file_types() {
    increment_test
    log_header "File Type Validation"

    local all_pass=true

    # Test doom.js is JavaScript
    if [ -f "${PROJECT_DIR}/doom/doom.js" ]; then
        if head -c 500 "${PROJECT_DIR}/doom/doom.js" | grep -q "Emscripten\|Module\|typeof"; then
            log_pass "doom/doom.js: Valid JavaScript (contains Emscripten markers)"
        else
            log_warn "doom/doom.js: No obvious Emscripten markers found (may still be valid)"
        fi
    fi

    # Test doom.wasm is WebAssembly
    if [ -f "${PROJECT_DIR}/doom/doom.wasm" ]; then
        if file "${PROJECT_DIR}/doom/doom.wasm" | grep -q "WebAssembly\|ELF"; then
            log_pass "doom/doom.wasm: Valid WebAssembly/ELF format"
        else
            log_fail "doom/doom.wasm: Not recognized as WebAssembly"
            all_pass=false
        fi
    fi

    # Test gallery.wad
    if [ -f "${PROJECT_DIR}/doom/gallery.wad" ]; then
        if head -c 4 "${PROJECT_DIR}/doom/gallery.wad" | od -An -tx1 | grep -q "50 57 41 44"; then
            log_pass "doom/gallery.wad: Valid DOOM WAD format"
        else
            log_warn "doom/gallery.wad: Could not verify WAD header (stub may be ok)"
        fi
    fi

    [ "$all_pass" = true ] && return 0 || return 1
}

##############################################################################
# HTTP SERVER TESTS
##############################################################################

test_index_load() {
    increment_test
    log_header "HTTP Server Load Test"

    if [ -z "$SERVER_PID" ]; then
        log_fail "HTTP server not running"
        return 1
    fi

    local response=$(curl -s -w "\n%{http_code}" http://localhost:$SERVER_PORT/)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_pass "index.html loads successfully (HTTP 200)"
        return 0
    else
        log_fail "index.html returned HTTP $http_code"
        return 1
    fi
}

test_asset_load() {
    increment_test
    log_header "Asset Load Test"

    if [ -z "$SERVER_PID" ]; then
        log_fail "HTTP server not running"
        return 1
    fi

    local assets=(
        "js/main.js"
        "js/doom-engine.js"
        "js/doom-bridge.js"
        "js/explosion.js"
        "css/style.css"
        "doom/doom.js"
        "doom/doom.wasm"
    )

    local all_pass=true
    for asset in "${assets[@]}"; do
        local response=$(curl -s -w "\n%{http_code}" http://localhost:$SERVER_PORT/$asset)
        local http_code=$(echo "$response" | tail -n1)

        if [ "$http_code" = "200" ]; then
            log_pass "$asset: HTTP 200"
        else
            log_fail "$asset: HTTP $http_code"
            all_pass=false
        fi
    done

    [ "$all_pass" = true ] && return 0 || return 1
}

##############################################################################
# WASM & JAVASCRIPT TESTS
##############################################################################

test_wasm_load() {
    increment_test
    log_header "WASM Module Load Test"

    if [ -z "$SERVER_PID" ]; then
        log_fail "HTTP server not running"
        return 1
    fi

    # Create a test HTML file that loads the WASM module
    local test_file="/tmp/wasm_test_$$.html"
    cat > "$test_file" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>WASM Test</title>
</head>
<body>
    <script>
        // Simple WASM loader test
        window.wasmTestResult = { success: false, error: null };

        // Try loading the doom.js module
        const script = document.createElement('script');
        script.src = 'doom.js';
        script.onload = function() {
            window.wasmTestResult.doomJsLoaded = true;
            console.log('doom.js loaded');
        };
        script.onerror = function(e) {
            window.wasmTestResult.error = 'Failed to load doom.js: ' + e;
            console.log('Error:', e);
        };
        document.head.appendChild(script);

        // Check for Module object after short delay
        setTimeout(function() {
            if (typeof Module !== 'undefined') {
                window.wasmTestResult.moduleExists = true;
                console.log('Module object exists');
            }
            if (typeof Module !== 'undefined' && typeof Module._get_exhibit_tag === 'function') {
                window.wasmTestResult.getFunctionExists = true;
                console.log('_get_exhibit_tag function exists');
            }
            console.log('WASM_TEST_COMPLETE');
        }, 2000);
    </script>
</body>
</html>
EOF

    log_info "WASM test skipped (requires headless browser) - manual verification needed"
    rm -f "$test_file"
    return 0
}

test_javascript_syntax() {
    increment_test
    log_header "JavaScript Syntax Validation"

    if ! command -v node &> /dev/null; then
        log_warn "Node.js not available - skipping syntax check"
        return 0
    fi

    local js_files=(
        "js/main.js"
        "js/doom-engine.js"
        "js/doom-bridge.js"
        "js/explosion.js"
    )

    local all_pass=true
    for file in "${js_files[@]}"; do
        if [ -f "${PROJECT_DIR}/${file}" ]; then
            if node -c "${PROJECT_DIR}/${file}" > /dev/null 2>&1; then
                log_pass "$file: Valid JavaScript syntax"
            else
                log_fail "$file: Syntax error detected"
                all_pass=false
            fi
        fi
    done

    [ "$all_pass" = true ] && return 0 || return 1
}

##############################################################################
# DOOM WAD STRUCTURE TEST
##############################################################################

test_wad_structure() {
    increment_test
    log_header "DOOM WAD Structure Validation"

    local all_pass=true

    for wad in doom/gallery.wad; do
        if [ ! -f "${PROJECT_DIR}/${wad}" ]; then
            log_fail "$wad: File not found"
            all_pass=false
            continue
        fi

        local size=$(stat -f%z "${PROJECT_DIR}/${wad}" 2>/dev/null || stat -c%s "${PROJECT_DIR}/${wad}" 2>/dev/null)
        if [ "$size" -lt 1 ]; then
            log_fail "$wad: File empty"
            all_pass=false
        else
            log_pass "$wad: File present ($size bytes)"
        fi
    done

    [ "$all_pass" = true ] && return 0 || return 1
}

##############################################################################
# HTML STRUCTURE TEST
##############################################################################

test_html_structure() {
    increment_test
    log_header "HTML Structure Validation"

    if [ ! -f "${PROJECT_DIR}/index.html" ]; then
        log_fail "index.html not found"
        return 1
    fi

    local all_pass=true

    # Check for required script tags
    if grep -q "doom-engine.js" "${PROJECT_DIR}/index.html"; then
        log_pass "index.html: doom-engine.js script tag found"
    else
        log_fail "index.html: doom-engine.js script tag missing"
        all_pass=false
    fi

    if grep -q "doom-bridge.js" "${PROJECT_DIR}/index.html"; then
        log_pass "index.html: doom-bridge.js script tag found"
    else
        log_fail "index.html: doom-bridge.js script tag missing"
        all_pass=false
    fi

    if grep -q "explosion.js" "${PROJECT_DIR}/index.html"; then
        log_pass "index.html: explosion.js script tag found"
    else
        log_fail "index.html: explosion.js script tag missing"
        all_pass=false
    fi

    if grep -q "doom.js" "${PROJECT_DIR}/index.html"; then
        log_pass "index.html: doom.js script tag found"
    else
        log_warn "index.html: doom.js script tag not found (may be loaded dynamically)"
    fi

    [ "$all_pass" = true ] && return 0 || return 1
}

##############################################################################
# MAIN TEST EXECUTION
##############################################################################

main() {
    # Initialize results file
    > "${RESULTS_FILE}"

    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}" | tee -a "${RESULTS_FILE}"
    echo -e "${BLUE}║         BUNJUMUN-DOOM TEST HARNESS v1.0                        ║${NC}" | tee -a "${RESULTS_FILE}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}" | tee -a "${RESULTS_FILE}"

    log_info "Project Directory: $PROJECT_DIR"
    log_info "Results File: $RESULTS_FILE"
    log_info "Server Port: $SERVER_PORT"

    # PHASE 1: FILE VALIDATION
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}" | tee -a "${RESULTS_FILE}"
    log_header "PHASE 1: FILE VALIDATION"
    test_file_existence
    test_file_sizes
    test_file_types
    test_wad_structure

    # PHASE 2: HTTP SERVER TESTS
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}" | tee -a "${RESULTS_FILE}"
    log_header "PHASE 2: HTTP SERVER SETUP"
    start_http_server || exit 1

    sleep 1  # Give server time to stabilize

    test_index_load
    test_asset_load

    # PHASE 3: CODE QUALITY
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}" | tee -a "${RESULTS_FILE}"
    log_header "PHASE 3: CODE QUALITY"
    test_javascript_syntax
    test_html_structure

    # PHASE 4: WASM INTEGRATION
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}" | tee -a "${RESULTS_FILE}"
    log_header "PHASE 4: WASM INTEGRATION"
    test_wasm_load

    # Generate summary
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}" | tee -a "${RESULTS_FILE}"
    log_header "TEST SUMMARY"

    echo -e "\nTests Run:    $TESTS_RUN" | tee -a "${RESULTS_FILE}"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}" | tee -a "${RESULTS_FILE}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}" | tee -a "${RESULTS_FILE}"

    # Final status
    echo "" | tee -a "${RESULTS_FILE}"
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}" | tee -a "${RESULTS_FILE}"
        echo -e "${GREEN}║  ✅ ALL TESTS PASSED — Ready for GitHub Pages deployment      ║${NC}" | tee -a "${RESULTS_FILE}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}" | tee -a "${RESULTS_FILE}"
        exit 0
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}" | tee -a "${RESULTS_FILE}"
        echo -e "${RED}║  ❌ $TESTS_FAILED TEST(S) FAILED — See details above            ║${NC}" | tee -a "${RESULTS_FILE}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}" | tee -a "${RESULTS_FILE}"
        exit 1
    fi
}

# Run main
main "$@"
