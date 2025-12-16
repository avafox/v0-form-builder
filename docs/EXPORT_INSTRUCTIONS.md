# Architecture Documentation Export Instructions

This guide explains how to export the architecture documentation to various formats for presentations, documentation, and stakeholder reviews.

## Available Formats

1. PDF
2. Microsoft Visio
3. PowerPoint
4. Draw.io
5. PNG/SVG Images
6. Confluence/Wiki

---

## 1. Export to PDF

### Method A: Using Pandoc (Recommended)

```bash
# Install pandoc
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt-get install pandoc

# Windows
choco install pandoc

# Generate PDF
pandoc docs/AWS_ARCHITECTURE_DETAILED.md \
  -o AWS_Architecture.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  --toc \
  --toc-depth=2
```

### Method B: Using VS Code Extension

1. Install "Markdown PDF" extension in VS Code
2. Open `docs/AWS_ARCHITECTURE_DETAILED.md`
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Markdown PDF: Export (pdf)"
5. Select output location

### Method C: Online Converter

1. Go to https://www.markdowntopdf.com/
2. Upload `docs/AWS_ARCHITECTURE_DETAILED.md`
3. Click "Convert"
4. Download PDF

---

## 2. Export Mermaid Diagrams to Images

### Method A: Using Mermaid CLI

```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Create output directory
mkdir -p diagrams

# Extract and convert all diagrams
mmdc -i docs/AWS_ARCHITECTURE_DETAILED.md \
  -o diagrams/ \
  -e png \
  -b transparent

# For SVG format (scalable)
mmdc -i docs/AWS_ARCHITECTURE_DETAILED.md \
  -o diagrams/ \
  -e svg
```

### Method B: Using Mermaid Live Editor

1. Go to https://mermaid.live/
2. Copy each Mermaid diagram from the markdown
3. Paste into the editor
4. Click "Actions" → "Export as PNG/SVG"
5. Save each diagram

### Method C: Using VS Code Extension

1. Install "Markdown Preview Mermaid Support" extension
2. Open `docs/AWS_ARCHITECTURE_DETAILED.md`
3. Right-click on diagram in preview
4. Select "Copy Image" or "Save Image As"

---

## 3. Export to Microsoft Visio

### Method A: Convert Mermaid to Visio

```bash
# Install mermaid-to-visio converter
npm install -g mermaid-to-visio

# Convert diagrams
mermaid-to-visio docs/AWS_ARCHITECTURE_DETAILED.md \
  -o AWS_Architecture.vsdx
```

### Method B: Manual Recreation

1. Export diagrams as PNG/SVG (see section 2)
2. Open Microsoft Visio
3. Import images as reference
4. Recreate using Visio shapes:
   - AWS stencils: Download from AWS Architecture Icons
   - Azure stencils: Download from Microsoft
   - Use connectors for relationships

### Method C: Use Draw.io then Export

1. Import to Draw.io (see section 4)
2. File → Export as → VSDX (Visio)

---

## 4. Export to Draw.io

### Method A: Direct Import

1. Go to https://app.diagrams.net/
2. File → Import from → Text
3. Paste Mermaid diagram code
4. Select "Mermaid" as format
5. Click "Import"
6. Edit and save as `.drawio` or `.xml`

### Method B: Using Draw.io Desktop

```bash
# Install draw.io desktop
# macOS
brew install --cask drawio

# Ubuntu/Debian
sudo snap install drawio

# Open and import
drawio docs/AWS_ARCHITECTURE_DETAILED.md
```

---

## 5. Export to PowerPoint

### Method A: Export Diagrams as Images

```bash
# Export all diagrams as PNG
mmdc -i docs/AWS_ARCHITECTURE_DETAILED.md \
  -o diagrams/ \
  -e png \
  -w 1920 \
  -H 1080

# Then insert into PowerPoint
```

### Method B: Using Pandoc

```bash
# Convert to PowerPoint
pandoc docs/AWS_ARCHITECTURE_DETAILED.md \
  -o AWS_Architecture.pptx \
  -t pptx
```

### Method C: Manual Creation

1. Export diagrams as high-res PNG (1920x1080)
2. Create PowerPoint presentation
3. Insert images on slides
4. Add text annotations and speaker notes

---

## 6. Export to Confluence/Wiki

### Method A: Direct Markdown Import

1. Go to Confluence page
2. Click "..." → "Import"
3. Select "Markdown"
4. Upload `docs/AWS_ARCHITECTURE_DETAILED.md`

### Method B: Convert to Confluence Storage Format

```bash
# Install markdown-to-confluence
npm install -g markdown-to-confluence

# Convert
markdown-to-confluence \
  docs/AWS_ARCHITECTURE_DETAILED.md \
  -o confluence.xml
```

### Method C: Use Mermaid Plugin

1. Install "Mermaid Diagrams for Confluence" plugin
2. Create new page
3. Insert Mermaid macro
4. Paste diagram code

---

## 7. Export Cost Estimates to Excel

### Extract Cost Table

```bash
# Install pandoc with lua filter
pandoc docs/AWS_ARCHITECTURE_DETAILED.md \
  -t csv \
  -o AWS_Costs.csv \
  --lua-filter=extract-tables.lua

# Open in Excel
open AWS_Costs.csv
```

### Manual Export

1. Copy cost table from markdown
2. Paste into Excel
3. Format as table
4. Add formulas for totals

---

## 8. Create Architecture Poster

### High-Resolution Export

```bash
# Export main diagram as high-res PNG
mmdc -i docs/AWS_ARCHITECTURE_DETAILED.md \
  -o architecture-poster.png \
  -w 3840 \
  -H 2160 \
  -b white

# Print at 24" x 36" for office display
```

---

## 9. Generate Interactive HTML

### Method A: Using Mermaid.js

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad:true});</script>
</head>
<body>
  <div class="mermaid">
    <!-- Paste Mermaid diagram code here -->
  </div>
</body>
</html>
```

### Method B: Using Markdown to HTML

```bash
# Install markdown-it
npm install -g markdown-it

# Convert to HTML
markdown-it docs/AWS_ARCHITECTURE_DETAILED.md \
  -o AWS_Architecture.html

# Open in browser
open AWS_Architecture.html
```

---

## 10. Automated Export Script

Create a script to export all formats at once:

```bash
#!/bin/bash
# export-all.sh

echo "Exporting architecture documentation..."

# Create output directory
mkdir -p exports/diagrams

# Export to PDF
echo "Generating PDF..."
pandoc docs/AWS_ARCHITECTURE_DETAILED.md \
  -o exports/AWS_Architecture.pdf \
  --pdf-engine=xelatex \
  --toc

# Export diagrams to PNG
echo "Generating diagram images..."
mmdc -i docs/AWS_ARCHITECTURE_DETAILED.md \
  -o exports/diagrams/ \
  -e png \
  -b transparent

# Export diagrams to SVG
echo "Generating SVG diagrams..."
mmdc -i docs/AWS_ARCHITECTURE_DETAILED.md \
  -o exports/diagrams/ \
  -e svg

# Export to PowerPoint
echo "Generating PowerPoint..."
pandoc docs/AWS_ARCHITECTURE_DETAILED.md \
  -o exports/AWS_Architecture.pptx

# Export to HTML
echo "Generating HTML..."
markdown-it docs/AWS_ARCHITECTURE_DETAILED.md \
  -o exports/AWS_Architecture.html

echo "Export complete! Files saved to exports/"
```

Make executable and run:

```bash
chmod +x export-all.sh
./export-all.sh
```

---

## Best Practices

1. **Version Control**: Keep exported files in Git with version tags
2. **Naming Convention**: Use `AWS_Architecture_v1.0.pdf` format
3. **Update Frequency**: Re-export after major architecture changes
4. **Distribution**: Store in shared drive or documentation portal
5. **Accessibility**: Provide multiple formats for different audiences

---

## Troubleshooting

### Mermaid CLI Issues

```bash
# If mmdc command not found
npm install -g @mermaid-js/mermaid-cli

# If puppeteer fails
npm install -g puppeteer --unsafe-perm=true
```

### Pandoc Issues

```bash
# If PDF generation fails
# Install LaTeX
brew install basictex  # macOS
sudo apt-get install texlive  # Ubuntu
```

### Font Issues in Exports

```bash
# Install required fonts
# macOS
brew tap homebrew/cask-fonts
brew install font-dejavu

# Ubuntu
sudo apt-get install fonts-dejavu
```

---

## Additional Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [Pandoc User Guide](https://pandoc.org/MANUAL.html)
- [Draw.io Documentation](https://www.diagrams.net/doc/)
- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)

---

**Last Updated**: 2025-01-10
