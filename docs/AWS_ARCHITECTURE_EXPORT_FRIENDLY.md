# AWS Architecture - Export-Friendly Diagrams

> These diagrams use simplified Mermaid syntax that works with most export tools (Mermaid CLI, Draw.io, Visio converters)

## Main Architecture (Simplified for Export)

\`\`\`mermaid
graph TB
    Users[Internal Users via VPN]
    R53[Route 53 Private DNS]
    WAF[AWS WAF IP Filter]
    Amplify[AWS Amplify Next.js App]
    Redis[Upstash Redis Cache]
    EntraID[Microsoft Entra ID]
    Graph[Microsoft Graph API]
    SNOW[ServiceNow API]
    
    Users --> R53
    R53 --> WAF
    WAF --> Amplify
    Amplify --> EntraID
    Amplify --> Redis
    Amplify --> Graph
    Amplify --> SNOW
    Graph --> EntraID
    
    style Amplify fill:#FF9900
    style EntraID fill:#0078D4
    style Redis fill:#DC382D
    style SNOW fill:#62D84E
\`\`\`

## Authentication Flow (Linear)

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Amplify
    participant EntraID
    participant Graph
    participant Redis
    
    User->>Amplify: 1. Access App
    Amplify->>EntraID: 2. Redirect to Login
    EntraID->>User: 3. Login Page
    User->>EntraID: 4. Enter Credentials
    EntraID->>Amplify: 5. OAuth Token
    Amplify->>Graph: 6. Get User Groups
    Graph->>Redis: 7. Cache Groups
    Redis->>Amplify: 8. Return Access Decision
    Amplify->>User: 9. Show App or Deny
\`\`\`

## ServiceNow Integration Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant Redis
    participant ServiceNow
    
    User->>NextJS: Request Calendar Data
    NextJS->>Redis: Check Cache
    alt Cache Hit
        Redis->>NextJS: Return Cached Data
    else Cache Miss
        NextJS->>ServiceNow: API Request
        ServiceNow->>NextJS: Return Data
        NextJS->>Redis: Store in Cache
    end
    NextJS->>User: Display Calendar
\`\`\`

## CI/CD Pipeline (Simplified)

\`\`\`mermaid
graph LR
    Dev[Developer] --> Git[GitHub Push]
    Git --> Amplify[Amplify Build]
    Amplify --> Test[Run Tests]
    Test --> Deploy[Deploy to Production]
    Deploy --> Live[Live Application]
    
    style Git fill:#181717
    style Amplify fill:#FF9900
    style Live fill:#00C853
\`\`\`

## Component Architecture

\`\`\`mermaid
graph TD
    App[Next.js Application]
    Pages[Pages Layer]
    Components[Components Layer]
    API[API Routes]
    Lib[Library Functions]
    
    App --> Pages
    App --> API
    Pages --> Components
    Pages --> Lib
    API --> Lib
    
    Lib --> Auth[Authentication]
    Lib --> Access[Access Control]
    Lib --> Graph[Graph API]
    Lib --> Cache[Redis Cache]
\`\`\`

## Network Architecture

\`\`\`mermaid
graph TB
    Internet[Internet]
    VPN[Corporate VPN]
    VPC[AWS VPC]
    DNS[Private DNS Zone]
    WAF[AWS WAF]
    Amplify[Amplify App]
    
    Internet -.->|Blocked| WAF
    VPN --> VPC
    VPC --> DNS
    DNS --> Amplify
    WAF -->|Allow Corporate IPs| Amplify
    
    style WAF fill:#DD4814
    style VPN fill:#0078D4
    style Amplify fill:#FF9900
\`\`\`

---

## Export Instructions

### Method 1: Mermaid CLI (Best Quality)

\`\`\`bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Export to PNG
mmdc -i docs/AWS_ARCHITECTURE_EXPORT_FRIENDLY.md -o architecture.png

# Export to SVG (scalable)
mmdc -i docs/AWS_ARCHITECTURE_EXPORT_FRIENDLY.md -o architecture.svg

# Export to PDF
mmdc -i docs/AWS_ARCHITECTURE_EXPORT_FRIENDLY.md -o architecture.pdf
\`\`\`

### Method 2: Online Tools

**Mermaid Live Editor** (https://mermaid.live)
1. Copy diagram code
2. Paste into editor
3. Click "Actions" → "Export PNG/SVG/PDF"

**Draw.io** (https://app.diagrams.net)
1. File → Import → Mermaid
2. Paste diagram code
3. Edit and export as needed

### Method 3: VS Code Extension

\`\`\`bash
# Install extension
code --install-extension bierner.markdown-mermaid

# Open markdown file
# Right-click diagram → "Export Mermaid Diagram"
\`\`\`

---

## Troubleshooting Export Issues

### Issue: "Unsupported markdown list"

**Cause:** HTML tags or special characters in labels

**Fix:** Use these simplified diagrams instead

### Issue: Diagram doesn't render

**Cause:** Syntax errors or unsupported features

**Fix:** 
- Remove `<br/>` tags
- Remove special characters from labels
- Simplify subgraph nesting
- Remove `classDef` styling

### Issue: Export is blurry

**Cause:** PNG export at low resolution

**Fix:**
\`\`\`bash
# Use high DPI
mmdc -i diagram.md -o output.png -s 3

# Or export to SVG (vector, always sharp)
mmdc -i diagram.md -o output.svg
\`\`\`

### Issue: Colors don't export

**Cause:** Some tools ignore inline styles

**Fix:** Use the styling in these simplified diagrams, or add colors manually after export

---

## Alternative: PowerPoint-Ready Format

For presentations, use this approach:

1. Export each diagram as SVG
2. Import SVG into PowerPoint
3. Ungroup and edit as needed

Or use this pre-formatted structure:

\`\`\`
Slide 1: Main Architecture Overview
Slide 2: Authentication Flow
Slide 3: ServiceNow Integration
Slide 4: CI/CD Pipeline
Slide 5: Security Layers
Slide 6: Cost Breakdown
\`\`\`

---

## Quick Reference: Export Commands

\`\`\`bash
# All diagrams to PNG
mmdc -i docs/AWS_ARCHITECTURE_EXPORT_FRIENDLY.md -o diagrams/

# Single diagram to SVG
mmdc -i diagram.mmd -o output.svg

# High quality PDF
mmdc -i diagram.mmd -o output.pdf -s 3

# With custom theme
mmdc -i diagram.mmd -o output.png -t forest
