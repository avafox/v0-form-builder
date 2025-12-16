# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-12

### Added
- Initial release
- Communication form builder with rich text editor
- AWS SES email sending via custom fetch implementation
- Azure AD authentication with Sky UK SSO
- Priority levels (Urgent, Important, Notice)
- Email preview functionality
- CC/BCC support
- Mobile-responsive design

### Technical
- Next.js 15 App Router with SSR
- Tailwind CSS v4
- shadcn/ui component library
- Custom AWS SES implementation (fetch-based, no SDK)
- Supabase database with RLS
- Upstash Redis caching
- AWS Amplify hosting with Node.js 20

### Security
- Row Level Security enabled on all database tables
- Environment variables managed through Amplify
- NextAuth session encryption
- IAM least-privilege for SES access

---

## How to Update This File

When making changes, add entries under the appropriate version:

### Format
```md
## [Version] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Removed
- Removed features

### Security
- Security updates
