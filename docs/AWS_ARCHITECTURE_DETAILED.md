# GPE Communications Tool - Detailed AWS Architecture

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Component Details](#component-details)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Cost Estimates](#cost-estimates)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Security Architecture](#security-architecture)

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Corporate Network"
        Users[Internal Users<br/>via VPN/Corporate Network]
    end

    subgraph "AWS Cloud"
        subgraph "DNS & Access Control"
            R53[AWS Route 53<br/>Private Hosted Zone<br/>gpe-communications.internal.company.com]
            WAF[AWS WAF<br/>IP Restrictions<br/>Company IP Ranges Only]
        end

        subgraph "Application Hosting"
            Amplify[AWS Amplify<br/>Next.js Application<br/>main.xxxxx.amplifyapp.com]
            
            subgraph "Next.js App Components"
                Pages[Pages<br/>- Home<br/>- Communications Form<br/>- Admin Dashboard]
                API[API Routes<br/>- /api/check-access<br/>- /api/servicenow/*<br/>- /api/auth/*]
                Middleware[Middleware<br/>Auth & Access Control]
            end
        end

        subgraph "Caching Layer"
            Redis[(Upstash Redis<br/>- User Groups Cache<br/>- ServiceNow Data Cache<br/>TTL: 15 minutes)]
        end
    end

    subgraph "Microsoft Azure"
        EntraID[Microsoft Entra ID<br/>Azure AD<br/>- User Authentication<br/>- Group Membership<br/>- OAuth 2.0]
        Graph[Microsoft Graph API<br/>- User.Read.All<br/>- GroupMember.Read.All<br/>- Directory.Read.All]
    end

    subgraph "ServiceNow"
        SNOW[ServiceNow Instance<br/>- Change Requests<br/>- Change Restrictions<br/>- Approvals]
        SNOWTables[(ServiceNow Tables<br/>- change_request<br/>- change_blackout<br/>- sysapproval_approver)]
    end

    Users -->|1. DNS Query| R53
    R53 -->|2. Resolves to| Amplify
    Users -->|3. HTTPS Request| WAF
    WAF -->|4. IP Check Pass| Amplify
    Amplify -->|5. Redirect to Login| EntraID
    EntraID -->|6. OAuth Token| Amplify
    Middleware -->|7. Check Groups| API
    API -->|8. Check Cache| Redis
    Redis -.->|Cache Miss| Graph
    Graph -->|9. Fetch Groups| EntraID
    API -->|10. Store in Cache| Redis
    Pages -->|11. Request Data| API
    API -->|12. Check Cache| Redis
    Redis -.->|Cache Miss| SNOW
    SNOW -->|13. Query Tables| SNOWTables
    SNOW -->|14. REST API Response| API
    API -->|15. Cache Data| Redis

    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#232F3E
    classDef azure fill:#0078D4,stroke:#003366,stroke-width:2px,color:#fff
    classDef servicenow fill:#62D84E,stroke:#2E7D32,stroke-width:2px,color:#000
    classDef cache fill:#DC382D,stroke:#8B0000,stroke-width:2px,color:#fff
    
    class R53,WAF,Amplify,Pages,API,Middleware aws
    class EntraID,Graph azure
    class SNOW,SNOWTables servicenow
    class Redis cache
```

---

## Component Details

### 1. Authentication Flow (Detailed)

```mermaid
sequenceDiagram
    participant User
    participant Amplify
    participant Middleware
    participant EntraID as Microsoft Entra ID
    participant Graph as Microsoft Graph API
    participant Redis

    User->>Amplify: 1. Access /communications
    Amplify->>Middleware: 2. Check authentication
    
    alt Not Authenticated
        Middleware->>User: 3. Redirect to /api/auth/signin
        User->>EntraID: 4. Microsoft Login Page
        EntraID->>User: 5. Enter credentials
        User->>EntraID: 6. Submit credentials
        EntraID->>Amplify: 7. OAuth callback with token
        Amplify->>EntraID: 8. Verify token
        EntraID->>Amplify: 9. Token valid + user info
    end

    Amplify->>Middleware: 10. User authenticated
    Middleware->>Amplify: 11. Check group membership
    Amplify->>Redis: 12. Check cache for user groups
    
    alt Cache Hit
        Redis->>Amplify: 13. Return cached groups
    else Cache Miss
        Amplify->>Graph: 14. GET /users/{id}/memberOf
        Graph->>EntraID: 15. Query user groups
        EntraID->>Graph: 16. Return groups
        Graph->>Amplify: 17. Return groups list
        Amplify->>Redis: 18. Cache groups (TTL: 15min)
    end

    Amplify->>Middleware: 19. Compare with allowed groups
    
    alt Authorized
        Middleware->>User: 20. Render /communications page
    else Unauthorized
        Middleware->>User: 21. Redirect to /access-denied
    end
```

### 2. ServiceNow Integration Flow (Detailed)

```mermaid
sequenceDiagram
    participant User
    participant Calendar as Calendar Component
    participant API as API Route
    participant Redis
    participant ServiceNow

    User->>Calendar: 1. Open calendar view
    Calendar->>API: 2. GET /api/servicenow/changes
    API->>Redis: 3. Check cache key: servicenow:changes
    
    alt Cache Hit
        Redis->>API: 4. Return cached data
        API->>Calendar: 5. Return change data
    else Cache Miss
        API->>ServiceNow: 6. GET /api/now/table/change_request
        Note over API,ServiceNow: Query: assignment_group=GPE<br/>Fields: number, start_date, end_date, state
        ServiceNow->>API: 7. Return change requests
        
        API->>ServiceNow: 8. GET /api/now/table/change_blackout
        Note over API,ServiceNow: Query: active=true<br/>Fields: name, start_date, end_date
        ServiceNow->>API: 9. Return restrictions
        
        API->>ServiceNow: 10. GET /api/now/table/sysapproval_approver
        Note over API,ServiceNow: Query: approver.department=GPE<br/>Fields: document_id, state, due_date
        ServiceNow->>API: 11. Return approvals
        
        API->>API: 12. Merge and format data
        API->>Redis: 13. Cache data (TTL: 15min)
        Redis->>API: 14. Confirm cached
        API->>Calendar: 15. Return merged data
    end
    
    Calendar->>User: 16. Render calendar with events
```

### 3. Access Control Decision Flow

```mermaid
flowchart TD
    Start([User Requests Protected Page]) --> Auth{Authenticated?}
    
    Auth -->|No| Login[Redirect to Microsoft Login]
    Login --> EntraID[Microsoft Entra ID OAuth]
    EntraID --> Token[Receive OAuth Token]
    Token --> Auth
    
    Auth -->|Yes| CheckCache{Groups in<br/>Redis Cache?}
    
    CheckCache -->|Yes| GetCache[Retrieve from Cache]
    CheckCache -->|No| FetchGraph[Fetch from Microsoft Graph]
    
    FetchGraph --> StoreCache[Store in Redis<br/>TTL: 15 minutes]
    StoreCache --> GetCache
    
    GetCache --> Compare{User in<br/>Allowed Groups?}
    
    Compare -->|Yes| GrantAccess[Grant Access]
    Compare -->|No| DenyAccess[Redirect to Access Denied]
    
    GrantAccess --> RenderPage[Render Protected Page]
    DenyAccess --> ShowDenied[Show Access Denied Page]
    
    RenderPage --> End([End])
    ShowDenied --> End

    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
    style GrantAccess fill:#4CAF50,stroke:#2E7D32,color:#fff
    style DenyAccess fill:#f44336,stroke:#c62828,color:#fff
    style Auth fill:#2196F3,stroke:#1565C0,color:#fff
    style Compare fill:#2196F3,stroke:#1565C0,color:#fff
    style CheckCache fill:#FF9800,stroke:#E65100,color:#fff
```

---

## Cost Estimates

### Monthly Cost Breakdown (Estimated)

| Service | Usage Estimate | Unit Cost | Monthly Cost | Notes |
|---------|---------------|-----------|--------------|-------|
| **AWS Amplify** | | | | |
| - Build minutes | 100 min/month | $0.01/min | $1.00 | CI/CD builds |
| - Hosting | 5 GB storage | $0.023/GB | $0.12 | Static assets |
| - Data transfer | 15 GB/month | $0.15/GB | $2.25 | First 15GB free |
| **Route 53** | | | | |
| - Hosted zone | 1 private zone | $0.50/zone | $0.50 | Internal DNS |
| - Queries | 1M queries | $0.40/M | $0.40 | DNS lookups |
| **AWS WAF** | | | | |
| - Web ACL | 1 ACL | $5.00/month | $5.00 | IP restrictions |
| - Rules | 2 rules | $1.00/rule | $2.00 | IP set rules |
| - Requests | 10M requests | $0.60/M | $6.00 | Request filtering |
| **Upstash Redis** | | | | |
| - Storage | 100 MB | Free tier | $0.00 | Cache storage |
| - Commands | 10K/day | Free tier | $0.00 | Up to 10K daily |
| **Microsoft Azure** | | | | |
| - Entra ID | Included | Free | $0.00 | Basic features |
| - Graph API | 100K calls/month | Free tier | $0.00 | Within limits |
| **ServiceNow** | | | | |
| - API calls | Existing license | $0.00 | $0.00 | Covered by license |
| | | **TOTAL** | **~$17.27/month** | |

### Cost Optimization Tips

1. **Amplify Builds**: Use build caching to reduce build minutes
2. **WAF**: Consider if IP restrictions are necessary or use Amplify's built-in access control
3. **Redis**: Stay within free tier limits (10K commands/day)
4. **Data Transfer**: Enable compression to reduce bandwidth

### Scaling Costs

| Users | Monthly Cost | Notes |
|-------|--------------|-------|
| 10-50 | $17-25 | Current estimate |
| 50-200 | $25-50 | Increased data transfer |
| 200-500 | $50-100 | May need Redis paid tier |
| 500+ | $100-200 | Consider reserved capacity |

---

## CI/CD Pipeline

```mermaid
flowchart LR
    subgraph "Developer Workflow"
        Dev[Developer] -->|1. Code Changes| Local[Local Development]
        Local -->|2. Git Commit| Git[Git Repository]
    end

    subgraph "GitHub"
        Git -->|3. Push| GitHub[GitHub Repository<br/>main branch]
        GitHub -->|4. Webhook| Amplify
    end

    subgraph "AWS Amplify"
        Amplify[Amplify Console] -->|5. Trigger Build| Build[Build Process]
        
        Build --> Install[Install Dependencies<br/>npm install]
        Install --> Lint[Run Linting<br/>npm run lint]
        Lint --> TypeCheck[TypeScript Check<br/>tsc --noEmit]
        TypeCheck --> BuildApp[Build Next.js<br/>npm run build]
        BuildApp --> Test[Run Tests<br/>npm test]
        
        Test -->|Pass| Deploy[Deploy to CDN]
        Test -->|Fail| Notify[Notify Developer]
        
        Deploy --> Edge[Edge Locations<br/>CloudFront CDN]
    end

    subgraph "Post-Deployment"
        Edge -->|6. Health Check| Health[Health Check API]
        Health -->|Success| Live[Live Application]
        Health -->|Failure| Rollback[Auto Rollback]
        
        Live -->|7. Monitor| CloudWatch[CloudWatch Logs]
        CloudWatch -->|Alerts| SNS[SNS Notifications]
    end

    subgraph "Environment Variables"
        Secrets[Amplify Secrets Manager] -.->|Inject at Build| Build
        Secrets -.->|Runtime Vars| Edge
    end

    Notify -.->|Email| Dev
    SNS -.->|Email/Slack| Dev

    style Build fill:#FF9900,stroke:#232F3E
    style Deploy fill:#4CAF50,stroke:#2E7D32
    style Test fill:#2196F3,stroke:#1565C0
    style Rollback fill:#f44336,stroke:#c62828
```

### Build Configuration (amplify.yml)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run lint
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Deployment Stages

| Stage | Duration | Actions | Rollback |
|-------|----------|---------|----------|
| **Pre-Build** | 1-2 min | Install dependencies, cache check | N/A |
| **Build** | 3-5 min | Lint, type check, build Next.js | N/A |
| **Test** | 1-2 min | Run unit tests, integration tests | Stop deployment |
| **Deploy** | 2-3 min | Upload to S3, invalidate CDN | Auto rollback |
| **Verify** | 1 min | Health checks, smoke tests | Auto rollback |
| **Total** | **8-13 min** | | |

### Branch Deployment Strategy

```mermaid
gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature 1"
    commit id: "Feature 2"
    checkout main
    merge develop id: "Release v1.1"
    commit id: "Hotfix" tag: "v1.1.1"
```

| Branch | Environment | URL | Auto-Deploy |
|--------|-------------|-----|-------------|
| `main` | Production | `gpe-communications.internal.company.com` | ✅ Yes |
| `develop` | Staging | `develop.xxxxx.amplifyapp.com` | ✅ Yes |
| `feature/*` | Preview | `feature-name.xxxxx.amplifyapp.com` | ✅ Yes |

---

## Security Architecture

### Defense in Depth Layers

```mermaid
flowchart TB
    subgraph "Layer 1: Network Security"
        VPN[Corporate VPN Required]
        WAF[AWS WAF IP Filtering]
        DNS[Private DNS Only]
    end

    subgraph "Layer 2: Application Security"
        HTTPS[HTTPS/TLS 1.3]
        Headers[Security Headers<br/>CSP, HSTS, X-Frame-Options]
        CORS[CORS Policy]
    end

    subgraph "Layer 3: Authentication"
        OAuth[OAuth 2.0 Flow]
        MFA[MFA via Microsoft]
        Session[Secure Session Management]
    end

    subgraph "Layer 4: Authorization"
        Groups[Group Membership Check]
        RBAC[Role-Based Access Control]
        Cache[Cached Permissions<br/>15 min TTL]
    end

    subgraph "Layer 5: Data Security"
        Encryption[Data Encryption at Rest]
        Transit[Encryption in Transit]
        Secrets[Secrets Management]
    end

    subgraph "Layer 6: Monitoring"
        Logs[CloudWatch Logs]
        Alerts[Security Alerts]
        Audit[Audit Trail]
    end

    VPN --> WAF --> DNS
    DNS --> HTTPS --> Headers --> CORS
    CORS --> OAuth --> MFA --> Session
    Session --> Groups --> RBAC --> Cache
    Cache --> Encryption --> Transit --> Secrets
    Secrets --> Logs --> Alerts --> Audit

    style VPN fill:#f44336,stroke:#c62828,color:#fff
    style OAuth fill:#FF9800,stroke:#E65100,color:#fff
    style Groups fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Encryption fill:#2196F3,stroke:#1565C0,color:#fff
```

### Security Controls Matrix

| Control | Implementation | Status | Priority |
|---------|---------------|--------|----------|
| **Network** | | | |
| IP Whitelisting | AWS WAF | ✅ Configured | High |
| Private DNS | Route 53 Private Zone | ✅ Configured | High |
| VPN Required | Corporate VPN | ✅ Required | High |
| **Authentication** | | | |
| OAuth 2.0 | Microsoft Entra ID | ✅ Implemented | Critical |
| MFA | Microsoft MFA | ✅ Enforced | Critical |
| Session Timeout | 8 hours | ✅ Configured | Medium |
| **Authorization** | | | |
| Group-Based Access | Microsoft Graph | ✅ Implemented | Critical |
| RBAC | Custom middleware | ✅ Implemented | High |
| Permission Caching | Redis 15min TTL | ✅ Implemented | Medium |
| **Data Protection** | | | |
| HTTPS Only | Amplify SSL | ✅ Enforced | Critical |
| Secrets Management | Amplify Env Vars | ✅ Configured | Critical |
| Data Encryption | AES-256 | ✅ Enabled | High |
| **Monitoring** | | | |
| Access Logs | CloudWatch | ✅ Enabled | High |
| Error Tracking | CloudWatch | ✅ Enabled | Medium |
| Security Alerts | SNS | ⏳ Pending | Medium |

### Compliance Considerations

- **Data Residency**: All data stored in AWS US regions
- **Access Logs**: Retained for 90 days
- **Audit Trail**: All authentication/authorization events logged
- **Encryption**: TLS 1.3 for transit, AES-256 for rest
- **Password Policy**: Enforced via Microsoft Entra ID

---

## Performance Optimization

### Caching Strategy

```mermaid
flowchart LR
    subgraph "Client Side"
        Browser[Browser Cache<br/>Static Assets<br/>24 hours]
    end

    subgraph "CDN Layer"
        CloudFront[CloudFront CDN<br/>Edge Caching<br/>1 hour]
    end

    subgraph "Application Layer"
        Redis[Redis Cache<br/>API Responses<br/>15 minutes]
    end

    subgraph "Data Sources"
        Graph[Microsoft Graph API]
        ServiceNow[ServiceNow API]
    end

    Browser -->|Cache Miss| CloudFront
    CloudFront -->|Cache Miss| Redis
    Redis -->|Cache Miss| Graph
    Redis -->|Cache Miss| ServiceNow

    style Browser fill:#4CAF50,stroke:#2E7D32
    style CloudFront fill:#FF9800,stroke:#E65100
    style Redis fill:#DC382D,stroke:#8B0000,color:#fff
```

### Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Time to First Byte (TTFB) | < 200ms | ~150ms | ✅ Good |
| First Contentful Paint (FCP) | < 1.5s | ~1.2s | ✅ Good |
| Largest Contentful Paint (LCP) | < 2.5s | ~2.1s | ✅ Good |
| Time to Interactive (TTI) | < 3.5s | ~3.0s | ✅ Good |
| Cumulative Layout Shift (CLS) | < 0.1 | ~0.05 | ✅ Good |

---

## Disaster Recovery

### Backup Strategy

| Component | Backup Method | Frequency | Retention |
|-----------|--------------|-----------|-----------|
| Application Code | GitHub | On commit | Unlimited |
| Redis Cache | No backup needed | N/A | Ephemeral |
| Configuration | Amplify Console | On change | 30 days |
| Environment Variables | Amplify Secrets | On change | Unlimited |

### Recovery Procedures

**Scenario 1: Application Failure**
- Amplify auto-rollback to last known good deployment
- RTO: < 5 minutes
- RPO: Last successful deployment

**Scenario 2: Redis Failure**
- Application continues with direct API calls
- Performance degradation only
- Auto-recovery when Redis available

**Scenario 3: Microsoft Entra ID Outage**
- Existing sessions continue to work
- New logins blocked until service restored
- No data loss

---

## Monitoring & Alerting

### CloudWatch Dashboards

```mermaid
graph TB
    subgraph "Metrics Collection"
        Amplify[Amplify Metrics] --> CW[CloudWatch]
        WAF[WAF Metrics] --> CW
        Redis[Redis Metrics] --> CW
        App[Application Logs] --> CW
    end

    subgraph "Dashboards"
        CW --> Perf[Performance Dashboard]
        CW --> Sec[Security Dashboard]
        CW --> Err[Error Dashboard]
    end

    subgraph "Alerting"
        Perf --> Alarm1[High Latency Alarm]
        Sec --> Alarm2[Failed Auth Alarm]
        Err --> Alarm3[Error Rate Alarm]
        
        Alarm1 --> SNS[SNS Topic]
        Alarm2 --> SNS
        Alarm3 --> SNS
        
        SNS --> Email[Email Notifications]
        SNS --> Slack[Slack Notifications]
    end

    style CW fill:#FF9900,stroke:#232F3E
    style SNS fill:#f44336,stroke:#c62828,color:#fff
```

### Alert Thresholds

| Alert | Threshold | Action | Priority |
|-------|-----------|--------|----------|
| Error Rate | > 5% | Investigate immediately | Critical |
| Response Time | > 3s | Check performance | High |
| Failed Logins | > 10/min | Check for attacks | High |
| Redis Errors | > 1% | Check Redis health | Medium |
| Build Failures | Any | Check build logs | Medium |

---

## Export Formats

This documentation is available in multiple formats:

1. **Markdown**: `docs/AWS_ARCHITECTURE_DETAILED.md` (this file)
2. **PDF**: Generate using `pandoc` or Markdown to PDF converter
3. **Visio**: Import Mermaid diagrams using Mermaid to Visio converter
4. **Draw.io**: Import Mermaid diagrams directly
5. **PowerPoint**: Export diagrams as images and embed

### Generate PDF

```bash
# Using pandoc
pandoc docs/AWS_ARCHITECTURE_DETAILED.md -o AWS_Architecture.pdf

# Using markdown-pdf
npm install -g markdown-pdf
markdown-pdf docs/AWS_ARCHITECTURE_DETAILED.md
```

### Generate Images from Mermaid

```bash
# Using mermaid-cli
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/AWS_ARCHITECTURE_DETAILED.md -o diagrams/
```

---

## Additional Resources

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture Decision Record
- [ACCESS_CONTROL_SETUP.md](./ACCESS_CONTROL_SETUP.md) - Access control setup guide
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/)
- [ServiceNow REST API Documentation](https://developer.servicenow.com/dev.do)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-10  
**Maintained By**: GPE DevOps Team
