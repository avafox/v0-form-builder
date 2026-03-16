# Architecture Decision Record (ADR)
## GPE Communications Hub

**Project Name:** GPE Communications Hub (Form Builder)  
**Last Updated:** February 10, 2025  
**Status:** Active Development  
**Deployment:** AWS Amplify & Vercel

---

## Executive Summary

The GPE Communications Hub is a Next.js-based web application designed to streamline the creation, formatting, and distribution of professional branded email communications for Group Platform Engineering teams. The application provides a rich text editor with formatting capabilities, file uploads, direct email sending through Microsoft Azure Graph API, and planned integration with ServiceNow for change management visibility.

---

## 1. Context & Problem Statement

### Business Problem
- Teams need to create consistent, professionally branded email communications
- Manual email formatting is time-consuming and error-prone
- No centralized tool for creating Sky-branded communications
- Need for multiple export formats (PDF, Image, HTML, Email)
- Lack of visibility into change management data

### User Needs
- Quick creation of formatted communications
- Rich text editing with bullet points, formatting, and file attachments
- Direct email sending without leaving the application
- Export options for various use cases
- Preview before sending
- Visibility into change management data

---

## 2. Technical Stack

### Frontend Framework
**Decision:** Next.js 15.2.4 (App Router)  
**Rationale:**
- Server-side rendering for better performance
- App Router for modern routing patterns
- Built-in API routes for backend functionality
- Excellent TypeScript support
- Vercel deployment optimization

### UI Framework
**Decision:** React 19 with shadcn/ui components  
**Rationale:**
- Modern component library with Radix UI primitives
- Tailwind CSS v4 for styling
- Accessible components out of the box
- Customizable and themeable
- Consistent design system

### Styling
**Decision:** Tailwind CSS v4  
**Rationale:**
- Utility-first CSS framework
- Inline theme configuration
- Responsive design patterns
- Small bundle size
- Easy customization

### State Management
**Decision:** React Hooks (useState, useRef, useEffect)  
**Rationale:**
- Simple state requirements
- No need for complex global state
- Component-level state sufficient
- Reduced complexity and dependencies

---

## 3. Core Features & Architecture

### 3.1 Rich Text Editor
**Location:** `components/rich-text-editor.tsx`

**Capabilities:**
- Text formatting (Bold, Italic, Underline)
- Bullet lists and numbered lists
- File upload support (images, PDFs, documents)
- Plain text and rich text modes
- Markdown-style formatting syntax

**Technical Implementation:**
- ContentEditable div for rich text mode
- Textarea for plain text mode
- File handling with local URLs
- Format conversion between HTML and markdown

### 3.2 Communications Template
**Location:** `components/communications-template.tsx`

**Features:**
- Multi-section editor (Greeting, Details, Action, Contact)
- Priority levels (Low, Medium, High)
- Live preview panel
- Full-screen preview mode
- Sky branding integration

**Data Structure:**
\`\`\`typescript
interface CommunicationData {
  title: string
  greeting: string
  details: string
  action: string
  contactEmail: string
  slackChannel: string
  priority: "low" | "medium" | "high"
  department: string
}
\`\`\`

### 3.3 Email Sending System
**Location:** `app/api/send-email/route.ts`, `lib/microsoft-graph.ts`

**Integration:** Microsoft Graph API  
**Authentication:** OAuth 2.0 Client Credentials Flow

**Environment Variables Required:**
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_SECRET`

**Email Features:**
- HTML email generation
- To, CC, BCC support
- Custom subject lines
- Sender email configuration
- Styled email templates with gradients and branding

**Technical Flow:**
1. User configures email settings in dialog
2. Frontend generates HTML email content
3. API route authenticates with Microsoft Graph
4. Email sent via Graph API `/sendMail` endpoint
5. Success/error feedback to user

### 3.4 Export Capabilities

#### PDF Export
**Library:** jsPDF  
**Features:**
- A4 format with proper scaling
- Clickable links (email, Slack)
- Sky logo integration
- Gradient headers
- Professional formatting

#### Image Export
**Technology:** HTML5 Canvas  
**Features:**
- PNG format
- High-resolution (2x scale)
- Gradient rendering
- Logo embedding
- Text wrapping

#### Clipboard Copy
**Features:**
- Direct image copy to clipboard
- Fallback to download if clipboard blocked
- Browser compatibility handling

---

## 4. Deployment Architecture

### Current Deployment
**Platform:** AWS Amplify  
**Configuration:** `amplify.yml`

**Build Settings:**
\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install --legacy-peer-deps
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
\`\`\`

**Key Decisions:**
- Use npm instead of pnpm (Amplify compatibility)
- `--legacy-peer-deps` flag for dependency resolution
- Cache node_modules and Next.js build cache
- Output directory: `.next`

### Alternative Deployment
**Platform:** Vercel (Original)  
**URL:** https://vercel.com/avafoxwell-4565s-projects/v0-form-builder

---

## 5. Authentication & Authorization

### Current State
**Status:** Supabase integration available but not implemented

**Available Components:**
- `components/auth/auth-provider.tsx`
- `components/auth/protected-route.tsx`
- `lib/supabase/middleware.ts`

**Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Future Consideration:**
- Implement user authentication for multi-user scenarios
- Role-based access control for different departments
- Communication history and templates storage

---

## 6. ServiceNow Integration Architecture

### 6.1 Overview
**Status:** Planned Feature  
**Purpose:** Integrate ServiceNow Change Management data to provide visibility into change restrictions and GPE manager change approvals within the communications tool.

### 6.2 Data Sources

**ServiceNow Tables:**
- **Change Requests** (`change_request`) - Upcoming team changes requiring approval
- **Change Restrictions** (`change_blackout` or custom table) - Blackout periods and restriction windows
- **Approvals** (`sysapproval_approver`) - GPE manager approval queue

**Data Requirements:**
- Change request details (number, description, dates, status, assigned to)
- Change restriction periods (start date, end date, type, description)
- Approval status (pending, approved, rejected, approver, due date)
- GPE manager identification (department, assignment group)

### 6.3 Integration Architecture Decision

**Decision:** Use Upstash Redis for ServiceNow data caching instead of Supabase

**Context:**
The application needs to fetch and display ServiceNow change management data including:
- Change restrictions (blackout periods)
- GPE manager change approvals
- Upcoming team changes

This data needs to be:
- Refreshed periodically (every 15-30 minutes)
- Shared across all users
- Fast to retrieve
- Cached to avoid ServiceNow API rate limits

**Alternatives Considered:**

1. **Supabase PostgreSQL Database**
   - Pros: Relational data model, complex queries, already integrated
   - Cons: Overkill for simple caching, requires schema management, slower than in-memory
   - Rejected: User preference to avoid Supabase for this use case

2. **Direct API Calls (No Caching)**
   - Pros: Always fresh data, simple implementation
   - Cons: Slow, may hit rate limits, higher ServiceNow load
   - Rejected: Performance concerns and rate limiting risks

3. **Client-Side Caching Only**
   - Pros: No backend storage, simple
   - Cons: Not shared between users, lost on refresh, each user hits API
   - Rejected: Inefficient and poor user experience

4. **Upstash Redis (Selected)**
   - Pros: Fast in-memory storage, TTL support, serverless-friendly, shared cache
   - Cons: Requires additional integration setup
   - **Selected:** Best balance of performance, simplicity, and scalability

**Decision Rationale:**
- **Performance:** Redis provides sub-millisecond response times for cached data
- **Serverless-Friendly:** Works seamlessly with Vercel/Amplify deployments
- **TTL Support:** Automatic cache expiration ensures data freshness
- **Shared Cache:** All users benefit from cached data, reducing ServiceNow API calls
- **Integration Available:** Upstash for Redis integration already available in the project
- **Simplicity:** Key-value storage perfect for caching JSON responses

### 6.4 Technical Implementation

**Caching Strategy:**
\`\`\`typescript
// Cache keys structure
servicenow:change_requests     → JSON array of change requests
servicenow:change_restrictions → JSON array of restrictions
servicenow:approvals:gpe       → JSON array of GPE manager approvals
servicenow:last_sync           → ISO timestamp of last sync
\`\`\`

**Cache Flow:**
\`\`\`
User Request → Next.js API Route
    ↓
Check Redis Cache
    ↓
Cache Hit (< 15 min old)?
    ↓ Yes                    ↓ No
Return Cached Data    Fetch from ServiceNow API
                             ↓
                      Store in Redis (TTL: 15 min)
                             ↓
                      Return Fresh Data
\`\`\`

**API Routes:**
- `/api/servicenow/changes` - Fetch change requests
- `/api/servicenow/restrictions` - Fetch change restrictions
- `/api/servicenow/approvals` - Fetch GPE manager approvals
- `/api/servicenow/sync` - Manual sync trigger

**ServiceNow Authentication:**
- Method: OAuth 2.0 or Basic Auth
- Credentials stored in environment variables
- Token refresh handling for OAuth

### 6.5 Calendar Component

**Purpose:** Unified view of change restrictions and approvals

**Features:**
- Full calendar view (month/week/day)
- Color-coded events:
  - 🔴 Change Restrictions (red/orange)
  - 🟢 Approved Changes (green)
  - 🟡 Pending Approvals (yellow)
  - ⚫ Rejected Changes (gray)
- Event details on click
- Filter by type, manager, status
- Export to iCal/Google Calendar
- Date range selection

**Component Location:** `components/servicenow-calendar.tsx`

**Data Structure:**
\`\`\`typescript
interface CalendarEvent {
  id: string
  type: 'restriction' | 'approval' | 'change'
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: 'pending' | 'approved' | 'rejected' | 'active'
  manager?: string
  changeNumber?: string
  priority?: 'low' | 'medium' | 'high'
}
\`\`\`

### 6.6 Environment Variables

**Required for ServiceNow Integration:**
\`\`\`env
# ServiceNow API Configuration
SERVICENOW_INSTANCE_URL=https://yourcompany.service-now.com
SERVICENOW_CLIENT_ID=your-client-id
SERVICENOW_CLIENT_SECRET=your-client-secret
# OR for Basic Auth
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password

# Upstash Redis (for caching)
KV_REST_API_URL=your-upstash-url
KV_REST_API_TOKEN=your-upstash-token
\`\`\`

### 6.7 Sync Mechanism

**Automatic Sync:**
- Background job runs every 15 minutes
- Implemented via Next.js API route with cron trigger
- Updates Redis cache with fresh ServiceNow data

**Manual Sync:**
- Refresh button in UI
- Triggers immediate sync
- Shows last sync timestamp

**Error Handling:**
- Fallback to cached data if ServiceNow unavailable
- User notification of stale data
- Retry logic with exponential backoff

### 6.8 Security Considerations

**API Security:**
- ServiceNow credentials stored as environment variables
- Server-side only API calls (no client exposure)
- Rate limiting on sync endpoints
- Input validation on all ServiceNow responses

**Data Privacy:**
- Only fetch necessary fields
- No sensitive data stored in Redis
- Cache expiration ensures data freshness
- Audit logging of data access

### 6.9 Performance Metrics

**Target Performance:**
- Cache hit response time: < 100ms
- Cache miss (ServiceNow fetch): < 2s
- Calendar render time: < 500ms
- Sync operation: < 5s

**Monitoring:**
- Cache hit/miss ratio
- ServiceNow API response times
- Sync success/failure rates
- Redis connection health

---

## 7. Design System

### Color Palette
**Primary Brand Colors:**
- Orange: `#fb923c` (rgb(251, 146, 60))
- Purple: `#a855f7` (rgb(168, 85, 247))
- Blue: `#3b82f6` (rgb(59, 130, 246))

**Semantic Colors:**
- Red (Urgent): `#dc2626` (rgb(220, 38, 38))
- Green (Success): `#059669` (rgb(5, 150, 105))
- Gray (Text): `#111827`, `#6b7280`

**Gradients:**
- Header: Orange → Purple → Blue (linear gradient)
- Used consistently across all export formats

### Typography
**Fonts:** System fonts (Arial, Helvetica, sans-serif)  
**Rationale:** Email client compatibility

**Hierarchy:**
- H1: 24-28px (Headers)
- H2: 20-22px (Priority labels)
- H3: 16-18px (Section titles)
- Body: 14-16px (Content)

### Layout
**Approach:** Flexbox-first  
**Responsive:** Mobile-first design  
**Grid:** Two-column layout (Editor | Preview)

---

## 8. Key Technical Decisions

### 8.1 Why Next.js App Router?
- Modern routing patterns
- Server components for better performance
- API routes for backend logic
- Built-in optimization
- Vercel/Amplify deployment support

### 8.2 Why Microsoft Graph API for Email?
- Enterprise-grade email delivery
- Azure AD integration
- Supports shared mailboxes
- Better deliverability than SMTP
- Audit trail and compliance

### 8.3 Why Canvas for Image Generation?
- No external dependencies for basic images
- Full control over rendering
- Works in browser
- High-quality output
- Gradient support

### 8.4 Why jsPDF for PDF Export?
- Lightweight library
- Client-side generation
- Clickable links support
- Good documentation
- Active maintenance

### 8.5 Why shadcn/ui?
- Accessible components
- Customizable
- TypeScript support
- Radix UI primitives
- Copy-paste approach (no npm bloat)

### 8.6 Why Upstash Redis for ServiceNow Caching?
**Decision:** Use Upstash Redis instead of Supabase for caching ServiceNow data

**Rationale:**
- **Performance:** In-memory storage provides sub-millisecond response times
- **Serverless-Friendly:** No connection pooling issues, works with edge functions
- **TTL Support:** Automatic cache expiration without manual cleanup
- **Simplicity:** Key-value storage perfect for JSON caching
- **Cost-Effective:** Pay only for what you use
- **Integration Available:** Already supported in the project ecosystem

**Consequences:**
- Positive: Fast data retrieval, reduced ServiceNow API calls, better user experience
- Positive: Automatic cache invalidation via TTL
- Positive: Scales effortlessly with user growth
- Negative: Additional service dependency (Upstash)
- Negative: Data is ephemeral (not suitable for permanent storage)
- Mitigation: ServiceNow remains source of truth, Redis is cache only

---

## 9. File Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── send-email/
│   │   │   └── route.ts          # Email sending API endpoint
│   │   └── servicenow/           # ServiceNow integration (planned)
│   │       ├── changes/
│   │       │   └── route.ts      # Fetch change requests
│   │       ├── restrictions/
│   │       │   └── route.ts      # Fetch change restrictions
│   │       ├── approvals/
│   │       │   └── route.ts      # Fetch GPE approvals
│   │       └── sync/
│   │           └── route.ts      # Manual sync trigger
│   ├── communications/
│   │   └── page.tsx               # Communications builder page
│   ├── calendar/                  # ServiceNow calendar (planned)
│   │   └── page.tsx               # Calendar view page
│   ├── globals.css                # Global styles & Tailwind config
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── auth/                      # Authentication components (unused)
│   ├── communications-template.tsx # Main communications editor
│   ├── rich-text-editor.tsx       # Rich text editing component
│   ├── servicenow-calendar.tsx    # Calendar component (planned)
│   ├── ui/                        # shadcn/ui components
│   └── ...
├── lib/
│   ├── microsoft-graph.ts         # Microsoft Graph API service
│   ├── servicenow.ts              # ServiceNow API service (planned)
│   ├── redis.ts                   # Upstash Redis client (planned)
│   ├── supabase/                  # Supabase integration (unused)
│   └── utils.ts                   # Utility functions
├── public/
│   ├── images/                    # Brand assets
│   └── sky-logo.png               # Sky logo
├── amplify.yml                    # AWS Amplify build config
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
\`\`\`

---

## 10. Dependencies

### Core Dependencies
- `next`: 15.2.4 - Framework
- `react`: 19 - UI library
- `typescript`: 5 - Type safety
- `tailwindcss`: 4.1.9 - Styling
- `lucide-react`: 0.454.0 - Icons

### UI Components
- `@radix-ui/*` - Accessible primitives
- `class-variance-authority` - Component variants
- `tailwind-merge` - Class merging

### Functionality
- `jspdf` - PDF generation
- `@supabase/supabase-js` - Database (available)
- `date-fns` - Date formatting
- `zod` - Schema validation
- `@upstash/redis` - Redis caching (planned)
- `react-big-calendar` or `@fullcalendar/react` - Calendar UI (planned)

---

## 11. Environment Configuration

### Required Environment Variables
\`\`\`env
# Microsoft Graph API (Email Sending)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret

# ServiceNow Integration (Planned)
SERVICENOW_INSTANCE_URL=https://yourcompany.service-now.com
SERVICENOW_CLIENT_ID=your-client-id
SERVICENOW_CLIENT_SECRET=your-client-secret

# Upstash Redis (Planned)
KV_REST_API_URL=your-upstash-url
KV_REST_API_TOKEN=your-upstash-token

# Supabase (Available but not used)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Database (Postgres via Supabase)
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-prisma-url
POSTGRES_URL_NON_POOLING=your-non-pooling-url
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=your-database
POSTGRES_HOST=your-host
\`\`\`

---

## 12. Known Limitations & Future Improvements

### Current Limitations
1. No user authentication implemented
2. No communication history/storage
3. No template library
4. Single-user mode only
5. No draft saving
6. Limited to email sending (no SMS, Slack direct integration)
7. ServiceNow integration not yet implemented

### Planned Improvements
1. **User Authentication**
   - Implement Supabase auth
   - User profiles and permissions
   
2. **Communication Storage**
   - Save drafts to database
   - Communication history
   - Template library

3. **ServiceNow Integration**
   - Change restriction visibility
   - GPE manager approval queue
   - Unified calendar view
   - Automatic sync with Redis caching
   
4. **Enhanced Editor**
   - Table support
   - Image editing
   - More formatting options
   
5. **Collaboration**
   - Multi-user editing
   - Comments and approvals
   - Version control
   
6. **Analytics**
   - Email open tracking
   - Click tracking
   - Engagement metrics

---

## 13. Monitoring & Observability

### Current State
**Status:** Basic logging only

### Recommended Monitoring
1. **Error Tracking**
   - Sentry integration
   - Error boundaries
   
2. **Analytics**
   - Vercel Analytics (available)
   - User behavior tracking
   
3. **Performance Monitoring**
   - Core Web Vitals
   - API response times
   
4. **Email Delivery**
   - Success/failure rates
   - Bounce tracking

---

## 14. Compliance & Accessibility

### Accessibility
- **WCAG 2.1 Level AA** target
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility

### Compliance Considerations
- GDPR compliance (if storing user data)
- Email deliverability best practices
- Data retention policies
- Audit trail requirements

---

## 15. Maintenance & Support

### Code Maintenance
- **Framework Updates:** Quarterly Next.js updates
- **Dependency Updates:** Monthly security patches
- **Breaking Changes:** Test before deploying

### Documentation
- Inline code comments
- Component documentation
- API documentation
- User guides (recommended)

### Support Channels
- GitHub Issues
- Internal support tickets
- User feedback forms (recommended)

---

## 16. Conclusion

The GPE Communications Hub successfully provides a streamlined solution for creating professional branded email communications. The architecture leverages modern web technologies (Next.js, React, Tailwind) with enterprise-grade email delivery (Microsoft Graph API) and planned ServiceNow integration for change management visibility to deliver a robust, user-friendly application.

### Key Strengths
- Modern, maintainable codebase
- Rich feature set for communication creation
- Multiple export formats
- Professional branding integration
- Scalable architecture
- Strategic caching architecture with Upstash Redis for optimal performance

### Next Steps
1. Implement ServiceNow integration with Upstash Redis caching
2. Build calendar component for change visibility
3. Implement user authentication
4. Add communication storage
5. Build template library
6. Enhance collaboration features
7. Add analytics and tracking

---

**Document Version:** 1.1  
**Last Reviewed:** February 10, 2025  
**Next Review:** May 10, 2025
