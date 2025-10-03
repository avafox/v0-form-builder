#!/bin/bash

# Export all Mermaid diagrams to multiple formats
# Usage: ./scripts/export-diagrams.sh

echo "Exporting architecture diagrams..."

# Create output directory
mkdir -p exports/png exports/svg exports/pdf

# Export main architecture
echo "Exporting main architecture..."
mmdc -i docs/diagrams/main-architecture.mmd -o exports/png/main-architecture.png -s 3
mmdc -i docs/diagrams/main-architecture.mmd -o exports/svg/main-architecture.svg
mmdc -i docs/diagrams/main-architecture.mmd -o exports/pdf/main-architecture.pdf

# Export authentication flow
echo "Exporting authentication flow..."
mmdc -i docs/diagrams/auth-flow.mmd -o exports/png/auth-flow.png -s 3
mmdc -i docs/diagrams/auth-flow.mmd -o exports/svg/auth-flow.svg
mmdc -i docs/diagrams/auth-flow.mmd -o exports/pdf/auth-flow.pdf

# Export ServiceNow flow
echo "Exporting ServiceNow flow..."
mmdc -i docs/diagrams/servicenow-flow.mmd -o exports/png/servicenow-flow.png -s 3
mmdc -i docs/diagrams/servicenow-flow.mmd -o exports/svg/servicenow-flow.svg
mmdc -i docs/diagrams/servicenow-flow.mmd -o exports/pdf/servicenow-flow.pdf

echo "Export complete! Check the exports/ directory"
echo ""
echo "PNG files: exports/png/"
echo "SVG files: exports/svg/"
echo "PDF files: exports/pdf/"
