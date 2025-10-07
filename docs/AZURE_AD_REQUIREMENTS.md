# Azure AD Application Requirements
## GPE Communications Tool

**Application Name:** GPE Communications Tool  
**Purpose:** Internal communications management with email sending and access control  
**Environment:** Production  
**Date:** [Current Date]

---

## Executive Summary

This application requires minimal Azure AD permissions to:
1. Send emails from a **specific shared mailbox** (not any mailbox)
2. Check if signed-in users belong to authorized groups
3. Authenticate users via Microsoft login

**Security Principle:** Least privilege - only what's needed, nothing more.

---

## Required Permissions

### 1. Email Sending (Application Permission)

**Permission:** `Mail.Send.Shared`  
**Type:** Application  
**Justification:** Send emails from designated shared mailbox only  
**Scope:** Limited to specific shared mailbox (configured below)

**Alternative (if Mail.Send.Shared not available):**  
**Permission:** `Mail.Send`  
**Type:** Application  
**Justification:** Send emails as application  
**Mitigation:** Will be restricted to specific shared mailbox via "Send As" permissions

---

### 2. User Authentication (Delegated Permissions)

**Permission:** `User.Read`  
**Type:** Delegated  
**Justification:** Read signed-in user's profile (name, email, ID)  
**Scope:** User can only read their own profile

**Permission:** `GroupMember.Read.All`  
**Type:** Delegated  
**Justification:** Check if signed-in user belongs to authorized groups  
**Scope:** User can only read their own group memberships

---

## Shared Mailbox Configuration

**Shared Mailbox Email:** `gpe-communications@yourcompany.com` *(replace with actual)*

**Required Setup:**
1. Grant application service principal "Send As" permission on this mailbox only
2. Do NOT grant access to any other mailboxes
3. Restrict to this single shared mailbox

**PowerShell Command (for AD team):**
```powershell
# Grant Send As permission to specific shared mailbox only
Add-RecipientPermission -Identity "gpe-communications@yourcompany.com" `
  -Trustee "<Application-Service-Principal-Name>" `
  -AccessRights SendAs -Confirm:$false

# Verify permission
Get-RecipientPermission -Identity "gpe-communications@yourcompany.com" | 
  Where-Object {$_.Trustee -like "*<Application-Name>*"}
