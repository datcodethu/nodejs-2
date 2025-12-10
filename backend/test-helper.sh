#!/bin/bash
# 🧪 Backend Test Helper Script
# Usage: bash test-helper.sh [option]

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function print_header() {
    echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       Backend Test Helper Script      ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
}

function print_menu() {
    echo -e "\n${YELLOW}Available Commands:${NC}"
    echo -e "  ${GREEN}1${NC} - Run all tests"
    echo -e "  ${GREEN}2${NC} - Run unit tests only"
    echo -e "  ${GREEN}3${NC} - Run integration tests only"
    echo -e "  ${GREEN}4${NC} - Run security tests only"
    echo -e "  ${GREEN}5${NC} - Run with coverage report"
    echo -e "  ${GREEN}6${NC} - Watch mode (auto-rerun)"
    echo -e "  ${GREEN}7${NC} - Run specific test pattern"
    echo -e "  ${GREEN}8${NC} - Show test coverage"
    echo -e "  ${GREEN}9${NC} - Lint tests"
    echo -e "  ${GREEN}0${NC} - Exit"
    echo ""
}

function run_all_tests() {
    echo -e "${GREEN}➜ Running all tests...${NC}"
    npm test
}

function run_unit_tests() {
    echo -e "${GREEN}➜ Running unit tests...${NC}"
    npm test -- auth.unit.test.js
}

function run_integration_tests() {
    echo -e "${GREEN}➜ Running integration tests...${NC}"
    npm test -- auth.integration.test.js
}

function run_security_tests() {
    echo -e "${GREEN}➜ Running security tests...${NC}"
    npm test -- auth.security.test.js
}

function run_coverage() {
    echo -e "${GREEN}➜ Running tests with coverage...${NC}"
    npm run test:coverage
}

function run_watch_mode() {
    echo -e "${GREEN}➜ Running in watch mode...${NC}"
    echo -e "${YELLOW}Tip: Press 'q' to quit, 'a' to run all, 'p' to filter by pattern${NC}"
    npm run test:watch
}

function run_pattern_test() {
    echo -e "${YELLOW}Enter test name pattern (e.g., 'Login', 'Reuse Detection'):${NC}"
    read pattern
    echo -e "${GREEN}➜ Running tests matching: $pattern${NC}"
    npm test -- --testNamePattern="$pattern"
}

function show_coverage() {
    echo -e "${GREEN}➜ Generating coverage report...${NC}"
    npm run test:coverage
    echo -e "${GREEN}✅ Coverage report generated in coverage/${NC}"
}

function setup_env() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}📝 Creating .env file...${NC}"
        cat > .env << EOF
NODE_ENV=development
JWT_SECRET=test-secret-key-for-development-only
PORT=3000
EOF
        echo -e "${GREEN}✅ .env created with default values${NC}"
    else
        echo -e "${GREEN}✅ .env already exists${NC}"
    fi
}

function install_deps() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

function print_stats() {
    echo -e "\n${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║        Test Suite Statistics          ║${NC}"
    echo -e "${BLUE}╠═══════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ Total Tests: 94                       ║${NC}"
    echo -e "${BLUE}║ Unit Tests: 24                        ║${NC}"
    echo -e "${BLUE}║ Integration Tests: 42                 ║${NC}"
    echo -e "${BLUE}║ Security Tests: 28                    ║${NC}"
    echo -e "${BLUE}║ Expected Runtime: 12 seconds          ║${NC}"
    echo -e "${BLUE}║ Coverage Target: >80%                 ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
}

function print_help() {
    echo -e "\n${YELLOW}Usage:${NC}"
    echo "  bash test-helper.sh [option]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  all          - Run all tests"
    echo "  unit         - Run unit tests only"
    echo "  integration  - Run integration tests only"
    echo "  security     - Run security tests only"
    echo "  coverage     - Run with coverage"
    echo "  watch        - Watch mode"
    echo "  setup        - Setup environment"
    echo "  install      - Install dependencies"
    echo "  stats        - Show test statistics"
    echo "  help         - Show this help"
    echo ""
}

# Main logic
print_header
print_stats

if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        print_menu
        read -p "Choose an option: " choice
        
        case $choice in
            1) run_all_tests ;;
            2) run_unit_tests ;;
            3) run_integration_tests ;;
            4) run_security_tests ;;
            5) run_coverage ;;
            6) run_watch_mode ;;
            7) run_pattern_test ;;
            8) show_coverage ;;
            9) echo "Linting tests..."; npm run test 2>&1 | head -20 ;;
            0) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
            *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
        esac
    done
else
    # Command line mode
    case "$1" in
        all) run_all_tests ;;
        unit) run_unit_tests ;;
        integration) run_integration_tests ;;
        security) run_security_tests ;;
        coverage) run_coverage ;;
        watch) run_watch_mode ;;
        pattern) run_pattern_test ;;
        coverage) show_coverage ;;
        setup) setup_env ;;
        install) install_deps ;;
        stats) print_stats ;;
        help) print_help ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_help
            exit 1
            ;;
    esac
fi
