# Architecture Decision Record (ADR)
## GPE Communications Hub

**Project Name:** GPE Communications Hub (Form Builder)  
**Last Updated:** February 10, 2025  
**Status:** Active Development  
**Deployment:** AWS Amplify & Vercel

---

## Executive Summary

The GPE Communications Hub is a Next.js-based web application designed to streamline the creation, formatting, and distribution of professional branded email communications for Group Platform Engineering teams. The application provides a rich text editor with formatting capabilities, file uploads, and direct email sending through Microsoft Azure Graph API.

---

## 1. Context & Problem Statement

### Business Problem
- Teams need to create consistent, professionally branded email communications
- Manual email formatting is time-consuming and error-prone
- No centralized tool for creating Sky-branded communications
- Need for multiple export formats (PDF, Image, HTML, Email)

### User Needs
- Quick creation of formatted communications
- Rich text editing with bullet points, formatting, and file attachments
- Direct email sending without leaving the application
- Export options for various use cases
- Preview before sending

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

## 6. Design System

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

## 7. Key Technical Decisions

### 7.1 Why Next.js App Router?
- Modern routing patterns
- Server components for better performance
- API routes for backend logic
- Built-in optimization
- Vercel/Amplify deployment support

### 7.2 Why Microsoft Graph API for Email?
- Enterprise-grade email delivery
- Azure AD integration
- Supports shared mailboxes
- Better deliverability than SMTP
- Audit trail and compliance

### 7.3 Why Canvas for Image Generation?
- No external dependencies for basic images
- Full control over rendering
- Works in browser
- High-quality output
- Gradient support

### 7.4 Why jsPDF for PDF Export?
- Lightweight library
- Client-side generation
- Clickable links support
- Good documentation
- Active maintenance

### 7.5 Why shadcn/ui?
- Accessible components
- Customizable
- TypeScript support
- Radix UI primitives
- Copy-paste approach (no npm bloat)

---

## 8. File Structure

\`\`\`
├── app/
│   ├── api/
│   │   └── send-email/
│   │       └── route.ts          # Email sending API endpoint
│   ├── communications/
│   │   └── page.tsx               # Communications builder page
│   ├── globals.css                # Global styles & Tailwind config
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── auth/                      # Authentication components (unused)
│   ├── communications-template.tsx # Main communications editor
│   ├── rich-text-editor.tsx       # Rich text editing component
│   ├── ui/                        # shadcn/ui components
│   └── ...
├── lib/
│   ├── microsoft-graph.ts         # Microsoft Graph API service
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

## 9. Dependencies

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

---

## 10. Environment Configuration

### Required Environment Variables
\`\`\`env
# Microsoft Graph API (Email Sending)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret

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

## 11. Known Limitations & Future Improvements

### Current Limitations
1. No user authentication implemented
2. No communication history/storage
3. No template library
4. Single-user mode only
5. No draft saving
6. Limited to email sending (no SMS, Slack direct integration)

### Planned Improvements
1. **User Authentication**
   - Implement Supabase auth
   - User profiles and permissions
   
2. **Communication Storage**
   - Save drafts to database
   - Communication history
   - Template library
   
3. **Enhanced Editor**
   - Table support
   - Image editing
   - More formatting options
   
4. **Collaboration**
   - Multi-user editing
   - Comments and approvals
   - Version control
   
5. **Analytics**
   - Email open tracking
   - Click tracking
   - Engagement metrics

---

## 12. Security Considerations

### Current Security Measures
1. **API Route Protection**
   - Server-side only email sending
   - Environment variables for secrets
   
2. **Input Validation**
   - Email format validation
   - File type restrictions
   
3. **Authentication**
   - Microsoft Graph OAuth 2.0
   - Client credentials flow

### Future Security Enhancements
1. Implement user authentication
2. Rate limiting on email sending
3. CSRF protection
4. Content sanitization
5. Audit logging

---

## 13. Performance Considerations

### Current Optimizations
1. **Next.js Optimizations**
   - Server-side rendering
   - Image optimization
   - Code splitting
   
2. **Caching**
   - Build cache in Amplify
   - Static asset caching
   
3. **Bundle Size**
   - Dynamic imports for jsPDF
   - Tree shaking
   - Minimal dependencies

### Performance Metrics
- Lighthouse Score: Target 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

---

## 14. Testing Strategy

### Current State
**Status:** No automated tests implemented

### Recommended Testing Approach
1. **Unit Tests**
   - Rich text editor formatting
   - Email HTML generation
   - Utility functions
   
2. **Integration Tests**
   - Email sending flow
   - Export functionality
   - API routes
   
3. **E2E Tests**
   - Complete communication creation
   - Email sending workflow
   - Export workflows

### Testing Tools (Recommended)
- Jest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

---

## 15. Monitoring & Observability

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

## 16. Compliance & Accessibility

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

## 17. Maintenance & Support

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

## 18. Conclusion

The GPE Communications Hub successfully provides a streamlined solution for creating professional branded email communications. The architecture leverages modern web technologies (Next.js, React, Tailwind) with enterprise-grade email delivery (Microsoft Graph API) to deliver a robust, user-friendly application.

### Key Strengths
- Modern, maintainable codebase
- Rich feature set for communication creation
- Multiple export formats
- Professional branding integration
- Scalable architecture

### Next Steps
1. Implement user authentication
2. Add communication storage
3. Build template library
4. Enhance collaboration features
5. Add analytics and tracking

---

**Document Version:** 1.0  
**Last Reviewed:** February 10, 2025  
**Next Review:** May 10, 2025
