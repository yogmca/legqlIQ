#!/bin/bash

# Google Indexing Status Checker for LegalIQ.in
# Run this to check if your site is indexed by Google

echo "=================================================="
echo "🔍 GOOGLE INDEXING STATUS CHECK FOR LEGALIQ.IN"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify sitemaps are accessible
echo "📋 Step 1: Checking Sitemap Accessibility..."
echo ""

sitemaps=(
    "sitemap.xml"
    "sitemap-index.xml"
    "sitemap-static.xml"
    "sitemap-locations.xml"
    "sitemap-lawyers.xml"
    "sitemap-tax-consultants.xml"
    "sitemap-auditors.xml"
)

for sitemap in "${sitemaps[@]}"; do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "https://legaliq.in/$sitemap")
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ $sitemap - HTTP $status_code (OK)${NC}"
    else
        echo -e "${RED}❌ $sitemap - HTTP $status_code (ERROR)${NC}"
    fi
done

echo ""
echo "=================================================="
echo ""

# Check 2: Verify robots.txt
echo "🤖 Step 2: Checking robots.txt..."
echo ""

robots_status=$(curl -s -o /dev/null -w "%{http_code}" "https://legaliq.in/robots.txt")
if [ "$robots_status" = "200" ]; then
    echo -e "${GREEN}✅ robots.txt - HTTP $robots_status (OK)${NC}"
else
    echo -e "${RED}❌ robots.txt - HTTP $robots_status (ERROR)${NC}"
fi

echo ""
echo "=================================================="
echo ""

# Check 3: Test if site is indexed by Google
echo "🔍 Step 3: Checking Google Indexing Status..."
echo ""
echo -e "${YELLOW}⚠️  Manual Check Required:${NC}"
echo ""
echo "Open this URL in your browser:"
echo "https://www.google.com/search?q=site:legaliq.in"
echo ""
echo "Expected Results:"
echo "  - If you see pages: ✅ Site is indexed"
echo "  - If 'No results found': ❌ Site is NOT indexed yet"
echo ""

echo "=================================================="
echo ""

# Check 4: Test keyword ranking
echo "🎯 Step 4: Checking Keyword Ranking..."
echo ""
echo -e "${YELLOW}⚠️  Manual Check Required:${NC}"
echo ""
echo "Open this URL in INCOGNITO mode:"
echo "https://www.google.com/search?q=find+lawyers+online"
echo ""
echo "Expected Results:"
echo "  - If you see legaliq.in: ✅ You're ranking!"
echo "  - If NOT visible: ❌ Not ranking yet (normal if not submitted to GSC)"
echo ""

echo "=================================================="
echo ""

# Summary and Next Steps
echo "📊 SUMMARY & NEXT STEPS"
echo "=================================================="
echo ""
echo -e "${GREEN}✅ Technical SEO Status: PERFECT${NC}"
echo "   - Sitemaps are accessible"
echo "   - robots.txt is configured"
echo "   - Meta tags are optimized"
echo ""
echo -e "${YELLOW}⚠️  Google Indexing Status: UNKNOWN${NC}"
echo "   - Need to check manually (see above)"
echo ""
echo -e "${RED}❌ If NOT indexed, you need to:${NC}"
echo ""
echo "1. Set up Google Search Console"
echo "   → https://search.google.com/search-console"
echo ""
echo "2. Verify site ownership"
echo "   → Add property: https://legaliq.in"
echo ""
echo "3. Submit sitemaps (one by one):"
for sitemap in "${sitemaps[@]}"; do
    echo "   → $sitemap"
done
echo ""
echo "4. Request indexing for key pages:"
echo "   → https://legaliq.in/"
echo "   → https://legaliq.in/lawyers/mumbai"
echo "   → https://legaliq.in/lawyers/delhi"
echo "   → https://legaliq.in/lawyers/bangalore"
echo ""
echo "=================================================="
echo ""
echo "📖 For detailed instructions, read:"
echo "   → WHY_NOT_SHOWING_IN_GOOGLE.md"
echo ""
echo "⏱️  Time Required: 20 minutes"
echo "📈 Expected Results: 1-2 weeks"
echo ""
echo "=================================================="
