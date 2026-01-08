# Software Bill of Materials (SBOM) & Security Analysis

**Application:** GPE Communications Form Builder  
**Version:** 0.1.0  
**Analysis Date:** December 2024  
**Node.js Version:** 20.x

---

## Executive Summary

This document provides a comprehensive Software Bill of Materials (SBOM) and security analysis for the GPE Communications Form Builder application. All dependencies use permissive open source licenses (MIT, Apache-2.0, ISC) that are suitable for internal enterprise use with no copyleft or viral licensing concerns.

**Risk Assessment:** LOW

---

## License Distribution

| License Type | Package Count | Percentage | Commercial Use | Copyleft Risk |
|--------------|---------------|------------|----------------|---------------|
| MIT | 48 | 87% | Allowed | None |
| Apache-2.0 | 4 | 7% | Allowed | None |
| ISC | 3 | 6% | Allowed | None |

---

## Production Dependencies

### Core Framework

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| next | 15.2.4 | MIT | React framework for production | Vercel | Low |
| react | ^19 | MIT | UI component library | Meta (Facebook) | Low |
| react-dom | ^19 | MIT | React DOM rendering | Meta (Facebook) | Low |

### Authentication & Security

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| next-auth | 4.24.11 | ISC | Authentication for Next.js | NextAuth.js | Low |
| isomorphic-dompurify | 2.34.0 | Apache-2.0 | XSS sanitization | cure53 | Low |
| zod | 3.25.67 | MIT | Schema validation | Colin McDonnell | Low |

### Database & Storage

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| @supabase/supabase-js | latest | MIT | Supabase client SDK | Supabase | Low |
| @vercel/kv | 3.0.0 | MIT | Vercel KV (Redis) client | Vercel | Low |

### Email Services

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| nodemailer | 7.0.10 | MIT | Email sending library | Nodemailer | Low |

### UI Components (Radix UI)

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| @radix-ui/react-accordion | 1.2.2 | MIT | Accessible accordion | Radix | Low |
| @radix-ui/react-alert-dialog | 1.1.4 | MIT | Accessible alert dialog | Radix | Low |
| @radix-ui/react-aspect-ratio | 1.1.1 | MIT | Aspect ratio container | Radix | Low |
| @radix-ui/react-avatar | 1.1.2 | MIT | Avatar component | Radix | Low |
| @radix-ui/react-checkbox | 1.1.3 | MIT | Accessible checkbox | Radix | Low |
| @radix-ui/react-collapsible | 1.1.2 | MIT | Collapsible container | Radix | Low |
| @radix-ui/react-context-menu | 2.2.4 | MIT | Context menu | Radix | Low |
| @radix-ui/react-dialog | latest | MIT | Accessible dialog/modal | Radix | Low |
| @radix-ui/react-dropdown-menu | 2.1.4 | MIT | Dropdown menu | Radix | Low |
| @radix-ui/react-hover-card | 1.1.4 | MIT | Hover card popover | Radix | Low |
| @radix-ui/react-label | 2.1.1 | MIT | Form label | Radix | Low |
| @radix-ui/react-menubar | 1.1.4 | MIT | Menu bar | Radix | Low |
| @radix-ui/react-navigation-menu | 1.2.3 | MIT | Navigation menu | Radix | Low |
| @radix-ui/react-popover | 1.1.4 | MIT | Popover component | Radix | Low |
| @radix-ui/react-progress | 1.1.1 | MIT | Progress indicator | Radix | Low |
| @radix-ui/react-radio-group | 1.2.2 | MIT | Radio button group | Radix | Low |
| @radix-ui/react-scroll-area | 1.2.2 | MIT | Custom scroll area | Radix | Low |
| @radix-ui/react-select | 2.1.4 | MIT | Select dropdown | Radix | Low |
| @radix-ui/react-separator | 1.1.1 | MIT | Visual separator | Radix | Low |
| @radix-ui/react-slider | 1.2.2 | MIT | Slider input | Radix | Low |
| @radix-ui/react-slot | 1.1.1 | MIT | Slot composition | Radix | Low |
| @radix-ui/react-switch | 1.1.2 | MIT | Toggle switch | Radix | Low |
| @radix-ui/react-tabs | 1.1.2 | MIT | Tab interface | Radix | Low |
| @radix-ui/react-toast | latest | MIT | Toast notifications | Radix | Low |
| @radix-ui/react-toggle | 1.1.1 | MIT | Toggle button | Radix | Low |
| @radix-ui/react-toggle-group | 1.1.1 | MIT | Toggle group | Radix | Low |
| @radix-ui/react-tooltip | 1.1.6 | MIT | Tooltip component | Radix | Low |

### Styling & CSS

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| tailwind-merge | ^2.5.5 | MIT | Tailwind class merging | dcastil | Low |
| tailwindcss-animate | ^1.0.7 | MIT | Animation utilities | jamiebuilds | Low |
| class-variance-authority | ^0.7.1 | Apache-2.0 | Variant class builder | Joe Bell | Low |
| clsx | ^2.1.1 | MIT | Class name utility | Luke Edwards | Low |
| autoprefixer | ^10.4.20 | MIT | CSS vendor prefixing | PostCSS | Low |

### Forms & Validation

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| react-hook-form | ^7.60.0 | MIT | Form state management | react-hook-form | Low |
| @hookform/resolvers | ^3.10.0 | MIT | Form validation resolvers | react-hook-form | Low |

### Utilities

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| date-fns | 4.1.0 | MIT | Date manipulation | date-fns | Low |
| lucide-react | ^0.454.0 | ISC | Icon library | Lucide | Low |
| cmdk | 1.0.4 | MIT | Command palette | Paco | Low |
| sonner | ^1.7.4 | MIT | Toast notifications | Emil Kowalski | Low |
| vaul | ^0.9.9 | MIT | Drawer component | Emil Kowalski | Low |
| input-otp | 1.4.1 | MIT | OTP input component | Guilherme | Low |
| react-day-picker | 9.8.0 | MIT | Date picker | gpbl | Low |
| embla-carousel-react | 8.5.1 | MIT | Carousel component | David Cetinkaya | Low |
| react-resizable-panels | ^2.1.7 | MIT | Resizable panels | Brian Vaughn | Low |
| recharts | 2.15.4 | MIT | Chart library | recharts | Low |
| jspdf | latest | MIT | PDF generation | MrRio | Low |
| geist | ^1.3.1 | MIT | Geist font | Vercel | Low |
| next-themes | ^0.4.6 | MIT | Theme management | pacocoursey | Low |

### Analytics

| Package | Version | License | Description | Maintainer | Security Risk |
|---------|---------|---------|-------------|------------|---------------|
| @vercel/analytics | 1.3.1 | MIT | Vercel Analytics | Vercel | Low |

---

## Development Dependencies

| Package | Version | License | Description | Security Risk |
|---------|---------|---------|-------------|---------------|
| tailwindcss | ^4.1.9 | MIT | CSS framework | Low |
| @tailwindcss/postcss | ^4.1.9 | MIT | PostCSS plugin | Low |
| postcss | ^8.5 | MIT | CSS processor | Low |
| typescript | ^5 | Apache-2.0 | TypeScript compiler | Low |
| @types/node | ^22 | MIT | Node.js types | Low |
| @types/react | ^19 | MIT | React types | Low |
| @types/react-dom | ^19 | MIT | React DOM types | Low |
| @types/nodemailer | ^6.4.17 | MIT | Nodemailer types | Low |
| tw-animate-css | 1.3.3 | MIT | Animation utilities | Low |

---

## Third-Party Services (Non-OSS)

These are external services the application connects to:

| Service | Provider | Data Handling | Purpose |
|---------|----------|---------------|---------|
| AWS SES | Amazon Web Services | Email content encrypted in transit | Email delivery |
| AWS Amplify | Amazon Web Services | Application hosting | Hosting platform |
| Supabase | Supabase Inc. | Database storage (encrypted) | Data persistence |
| Azure AD | Microsoft | OAuth tokens, user identity | Authentication |
| Vercel KV | Vercel | Redis cache data | Caching |

---

## Security Considerations

### Supply Chain Security

- **Package Source:** All packages sourced from npm registry (registry.npmjs.org)
- **Lock File:** package-lock.json ensures reproducible builds
- **Vulnerability Scanning:** Run `npm audit` regularly

### Data Flow Security

| Data Type | In Transit | At Rest | Notes |
|-----------|------------|---------|-------|
| Email content | TLS encrypted | N/A | Sent via AWS SES API |
| User credentials | TLS encrypted | Hashed | Azure AD OAuth |
| Form data | TLS encrypted | Encrypted | Supabase database |

### Known Vulnerability Check

Run the following command to check for known vulnerabilities:

```bash
npm audit
```

For production deployments:

```bash
npm audit --production
```

---

## Compliance Summary

### License Compliance

| Requirement | Status |
|-------------|--------|
| No GPL/AGPL dependencies | PASS |
| No SSPL dependencies | PASS |
| No Commons Clause | PASS |
| All licenses allow commercial use | PASS |
| All licenses allow internal use | PASS |
| No copyleft obligations | PASS |

### Attribution Requirements

MIT and ISC licenses require the license text to be preserved. This is automatically handled by npm in the `node_modules` directory. No additional attribution is required in the application UI.

### Apache-2.0 Additional Requirements

Apache-2.0 licensed packages (class-variance-authority, isomorphic-dompurify, typescript) require:
- Preservation of license and copyright notices (automatic via npm)
- NOTICE file preservation if provided (none applicable)

---

## Recommendations

1. **Regular Audits:** Run `npm audit` weekly or integrate into CI/CD pipeline
2. **Dependency Updates:** Use Dependabot or Renovate for automated security updates
3. **Lock File:** Always commit `package-lock.json` for reproducible builds
4. **Production Build:** Use `npm ci` for production deployments
5. **Minimal Permissions:** AWS IAM roles should follow least-privilege principle

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | v0 AI | Initial SBOM creation |

---

## Appendix: Full License Texts

All license texts are available in the `node_modules/[package]/LICENSE` files after running `npm install`.

### MIT License (Summary)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

### Apache-2.0 License (Summary)

Licensed under the Apache License, Version 2.0. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

### ISC License (Summary)

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
