# Integrated School Security Systems UK | Fyrfly Systems

**Fyrfly Systems** delivers **integrated school security systems** for the UK education and public sectors — combining AI-driven CCTV, intelligent access control, and a dedicated wireless network backbone into a unified campus safeguarding ecosystem. Our **campus access control and CCTV integration** platform is built for IT Directors, MAT estate managers, and system integrators who need **school safeguarding technology** that satisfies KCSiE, Martyn's Law, and UK GDPR under a single managed service.

[![UK GDPR Compliant](https://img.shields.io/badge/UK%20GDPR-Compliant-10B981?style=flat-square&logo=shield)](https://www.fyrflysystems.com)
[![NSI NACOSS Gold](https://img.shields.io/badge/NSI-NACOSS%20Gold-C8102E?style=flat-square)](https://www.fyrflysystems.com)
[![SSAIB Approved](https://img.shields.io/badge/SSAIB-Approved-E85D04?style=flat-square)](https://www.fyrflysystems.com)
[![ISO 9001:2015](https://img.shields.io/badge/ISO-9001%3A2015-F5A623?style=flat-square)](https://www.fyrflysystems.com)
[![Martyn's Law Ready](https://img.shields.io/badge/Martyn's%20Law-Ready%20April%202027-10B981?style=flat-square)](https://www.fyrflysystems.com)
[![Surveillance Camera Code](https://img.shields.io/badge/Surveillance%20Camera%20Code-Compliant-blue?style=flat-square)](https://www.fyrflysystems.com)

---

**Fyrfly Systems** designs, installs, and maintains **integrated school security systems across the UK** — combining AI-driven CCTV, intelligent access control, and a secure wireless network backbone into a single, unified ecosystem for education and public sector campuses. Unlike siloed hardware deployments, Fyrfly's campus access control and CCTV integration operates as a coordinated platform: one management interface, one data governance framework, one accountable supplier. Built for IT Directors and estate managers who need school safeguarding technology that satisfies KCSiE, Martyn's Law, and UK GDPR simultaneously — without managing five separate contractor relationships.

> 🔗 **Website:** [www.fyrflysystems.com](https://www.fyrflysystems.com) &nbsp;|&nbsp; **Education:** [/education.html](https://www.fyrflysystems.com/education.html) &nbsp;|&nbsp; **Public Sector:** [/public-sector.html](https://www.fyrflysystems.com/public-sector.html) &nbsp;|&nbsp; **Technical Enquiries:** hello@fyrflysystems.com

---

## Table of Contents

- [System Architecture Overview](#system-architecture-overview)
  - [Pillar 1 — AI-Driven CCTV](#pillar-1--ai-driven-cctv)
  - [Pillar 2 — Intelligent Access Control](#pillar-2--intelligent-access-control)
  - [Pillar 3 — Secure Wireless Networks](#pillar-3--secure-wireless-networks)
  - [Integration Matrix](#integration-matrix)
- [Emergency Protocols & Dynamic Lockdown](#emergency-protocols--dynamic-lockdown)
  - [Trigger Mechanisms](#trigger-mechanisms)
  - [Martyn's Law Compliance](#martyns-law-compliance)
  - [Rapid-Deployment Solar CCTV Tower](#rapid-deployment-solar-cctv-tower)
- [VMS & API Integrations](#vms--api-integrations)
  - [ONVIF & RTSP Compatibility](#onvif--rtsp-compatibility)
  - [Active Directory & Identity Sync](#active-directory--identity-sync)
  - [Lockdown API Reference](#lockdown-api-reference)
  - [Webhook Event Schema](#webhook-event-schema)
- [Data Security & UK GDPR](#data-security--uk-gdpr)
  - [Edge-Encrypted Storage](#edge-encrypted-storage)
  - [Role-Based Access Control](#role-based-access-control)
  - [Retention, SARs & ICO Compliance](#retention-sars--ico-compliance)
- [Deployment & Installation](#deployment--installation)
  - [Network Prerequisites](#network-prerequisites)
  - [Server & NVR Requirements](#server--nvr-requirements)
  - [Pre-Installation Checklist](#pre-installation-checklist)
- [Supported Standards & Certifications](#supported-standards--certifications)
- [Contact & Technical Support](#contact--technical-support)

---

## System Architecture Overview

Fyrfly's integrated campus security architecture eliminates the failure modes introduced by siloed systems — separate maintenance contracts, incompatible protocols, and network contention between learning infrastructure and security-critical traffic.

![Fyrfly Systems — Integrated School Security Architecture: AI CCTV, Access Control and Secure Network Backbone for UK Campus Environments](https://www.fyrflysystems.com/assets/architecture-diagram.png)

The three pillars communicate over a dedicated, logically separated security VLAN. Access control events trigger CCTV responses. CCTV anomaly detections trigger access control alerts. Both report in real time to the Fyrfly VMS dashboard and, where ARC monitoring is enabled, to the Alarm Receiving Centre. The network layer ensures that none of this competes with classroom or administrative traffic.

```
┌─────────────────────────────────────────────────────────────┐
│                   FYRFLY UNIFIED PLATFORM                    │
├──────────────────┬──────────────────┬───────────────────────┤
│   AI CCTV Layer  │  Access Control  │   Network Backbone    │
│                  │      Layer       │                        │
│  • Edge AI       │  • Smart creds   │  • Dedicated VLAN     │
│  • ONVIF/RTSP    │  • Visitor mgmt  │  • QoS enforcement    │
│  • ANPR          │  • Dynamic lock  │  • 5G failover        │
│  • Thermal       │  • AD sync       │  • Device monitoring  │
│  • 4K recording  │  • Audit trail   │  • Encrypted mesh     │
├──────────────────┴──────────────────┴───────────────────────┤
│              UNIFIED MANAGEMENT INTERFACE (VMS)              │
│         REST API  •  RBAC  •  SIEM integration               │
├─────────────────────────────────────────────────────────────┤
│   ARC MONITORING  •  DSL ALERTS  •  EMERGENCY SERVICES       │
└─────────────────────────────────────────────────────────────┘
```

---

### Pillar 1 — AI-Driven CCTV

![Fyrfly AI CCTV System for UK Schools: Edge Processing, Loitering Detection and Thermal Imaging for Campus Safeguarding](https://www.fyrflysystems.com/assets/cctv-ai-campus-diagram.png)

Fyrfly deploys IP cameras with edge-based AI analytics — processing occurs on the camera or a local GPU node, not via cloud round-trip. This eliminates latency in alert generation and keeps footage processing within the school's data boundary, simplifying UK GDPR compliance.

#### Camera Technologies

| Technology | Use Case | Resolution | AI Capability |
|---|---|---|---|
| PTZ (Pan-Tilt-Zoom) | Perimeter, car parks, open grounds | Up to 4K / 30fps | Target tracking, auto-follow |
| Static Bullet | Fixed zones, entrance corridors | 4MP–8MP | Loitering, direction violation |
| 360° Panoramic | Open-plan spaces, dining areas | 8MP fisheye, dewarped | Crowd density, abandoned objects |
| Thermal Imaging | Perimeter, out-of-hours monitoring | 400×300 thermal + optical | Person detection in darkness/fog |

#### Edge AI Analytics Capabilities

- **Loitering detection** — configurable dwell-time thresholds per zone; alert escalation to DSL device via push notification
- **Perimeter breach** — virtual tripwire on boundary cameras with person/vehicle classification to suppress false positives
- **Crowd formation** — density monitoring in high-risk areas; dynamic alert when threshold exceeded
- **ANPR** — plate capture at entry/exit with PNC and permit database matching; integration with council enforcement systems
- **Abandoned object** — detection of stationary unattended items against a scene baseline
- **Behavioural anomaly** — running in restricted areas, prohibited zone entry, directional violations
- **Thermal body detection** — out-of-hours intrusion detection unaffected by lighting or weather conditions

#### CCTV Technical Specifications

```
Camera Network Requirements:
  Bandwidth per camera (4K H.265):    ~6 Mbps sustained
  30-camera estate (typical secondary): ~200 Mbps dedicated
  Encoding standard:                  H.265+ / H.264 (ONVIF Profile S/G/T)
  Streaming protocol:                 RTSP, WebRTC (live view)
  Storage format:                     NVR / NAS with RAID-6
  Retention (standard):               31 days at full resolution
  Edge processing latency:            <500ms alert generation
  Minimum illumination (optical):     0.001 lux (with IR)
  Minimum illumination (thermal):     N/A (passive infrared)
```

---

### Pillar 2 — Intelligent Access Control

![Fyrfly Intelligent Access Control System for Schools: Dynamic Lockdown, Visitor Management and KCSIE-Compliant Entry for UK Campuses](https://www.fyrflysystems.com/assets/access-control-campus.png)

Campus access control and CCTV integration at the credential layer means access events and camera views are unified — a door forced open automatically directs the nearest PTZ camera and generates a correlated alert in the VMS, not two separate notifications in two separate systems.

#### Credential Technologies Supported

| Credential Type | Standard | Notes |
|---|---|---|
| Smart card (ISO 14443) | MIFARE DESFire EV3 | AES-128 encrypted; cloning-resistant |
| Mobile credential | BLE / NFC | iOS & Android; no physical card required |
| PIN + card (2FA) | Wiegand / OSDP v2 | For high-security zones |
| Biometric (fingerprint) | ISO/IEC 19794-2 | Special category data; Article 9 UK GDPR applies |
| QR code (visitor) | Proprietary | Time-limited, single-use; visitor management integration |

#### Reader & Controller Architecture

```
Reader Protocol:    OSDP v2 (preferred) / Wiegand (legacy support)
Controller OS:      Embedded Linux, TLS 1.3 encrypted comms
Offline capability: 72-hour local cache (no server dependency for access decisions)
Door interface:     Fail-secure / fail-safe selectable per door
Tamper detection:   Hardware tamper + connectivity loss alert
Power:              PoE+ (802.3at) primary; 12V DC secondary
```

#### Visitor Management Workflow

```
1. Visitor arrival → receptionist initiates check-in on VMS terminal
2. Photo capture (webcam/IP camera integration)
3. ID scan + optional barred-list check (DBS, council register)
4. Time-limited QR badge generated and printed (30-second process)
5. Badge scanned at access reader → entry logged with timestamp
6. Auto-expiry: credential invalidated at pre-set departure time
7. Record retained per site retention policy (default: 12 months)
8. SAR/FOI export: one-click export with third-party data redacted
```

---

### Pillar 3 — Secure Wireless Networks

![Fyrfly Secure Wireless Network Infrastructure for Campus Security: Dedicated VLAN Mesh Backbone for UK School and Public Sector Sites](https://www.fyrflysystems.com/assets/network-architecture-campus.png)

School safeguarding technology is only as reliable as the network carrying it. Fyrfly designs and deploys a physically and logically separate security network — dedicated VLAN, QoS-enforced, with automatic 5G failover — that never contends with classroom or administrative Wi-Fi traffic.

#### Network Architecture Principles

- **Separation of concerns** — security VLAN is logically isolated at the managed switch layer; no broadcast domain overlap with learning network
- **QoS enforcement** — DSCP EF (Expedited Forwarding) marking on all security traffic; lockdown commands are prioritised above all other traffic classes
- **Zero-trust device posture** — 802.1X port-based authentication; unauthenticated devices cannot join the security VLAN
- **Automatic failover** — primary fibre/ethernet uplink monitored via ICMP and BGP keepalive; 5G SIM failover activates within 30 seconds of primary failure
- **Proactive device monitoring** — SNMP/ICMP polling of every camera and access reader at 60-second intervals; alert generated within 2 minutes of device loss
- **Encrypted mesh (multi-building sites)** — WPA3-Enterprise wireless bridges for buildings without structured cabling; AES-256 over-the-air encryption

---

### Integration Matrix

| System A | System B | Integration Type | Trigger |
|---|---|---|---|
| AI CCTV (loitering alert) | Access Control | API event | Door to nearest zone locks |
| Access Control (lockdown) | CCTV | API event | All cameras → max resolution + ARC feed |
| Access Control (forced door) | CCTV | API event | Nearest PTZ auto-directs + alert |
| CCTV (perimeter breach) | Staff mobile app | Push notification | DSL/SLT alerted with camera snapshot |
| Access Control | Active Directory | LDAP/S sync | Credential provision/revocation on account change |
| VMS | SIEM (Splunk/QRadar) | Syslog / CEF | All security events forwarded for central logging |
| Lockdown trigger | ARC | Encrypted TCP | Live camera feed + event data to monitoring operator |
| Visitor management | Barred list | API lookup | Real-time check on visitor registration |

---

## Emergency Protocols & Dynamic Lockdown

### Trigger Mechanisms

A Fyrfly lockdown can be initiated through multiple authenticated channels, each producing an identical system response within under two seconds of trigger:

| Trigger Method | Authenticated By | Typical User |
|---|---|---|
| VMS dashboard (web/desktop) | RBAC role + MFA | Control room operator |
| Mobile app (iOS/Android) | Biometric + PIN | Headteacher, DSL, SLT |
| Physical panic button | Hardware tamper-evident | Reception, key staff locations |
| Automated AI trigger | Configurable threshold + human confirm | Unattended out-of-hours mode |
| API call | Bearer token + IP allowlist | Integration with third-party emergency systems |

#### Lockdown Sequence (automated, sub-2-second execution)

```
T+0.0s   Trigger authenticated (operator, mobile, button, or API)
T+0.1s   Lockdown command broadcast over security VLAN (DSCP EF priority)
T+0.3s   All OSDP-controlled access doors receive lock command
T+0.5s   Fail-secure doors confirm locked state via OSDP status response
T+0.6s   CCTV system switches all cameras to maximum resolution
T+0.7s   AI analytics profiles set to maximum sensitivity
T+0.8s   ARC notification dispatched (encrypted TCP, camera feed included)
T+1.0s   Staff mobile push notification sent (iOS APNs / Android FCM)
T+1.2s   Audit log entry written (tamper-evident, timestamped to NTP)
T+1.5s   VMS dashboard updates: all door states, camera feeds, active alerts
T+2.0s   Optional: automated 999 alert pre-configured per site policy
```

#### Lockdown States

```
NORMAL          → Standard access rules apply; all systems nominal
SOFT_LOCKDOWN   → Visitors and unknown credentials rejected; staff unaffected
FULL_LOCKDOWN   → All controlled doors locked; no credential overrides active
EMERGENCY       → Full lockdown + ARC + 999 alert; manual release only (dual auth)
DRILL           → Full lockdown sequence executed; no ARC/999 notification sent
```

---

### Martyn's Law Compliance

The Terrorism (Protection of Premises) Act 2025 — Martyn's Law — requires venues of 100+ capacity to have documented emergency procedures supported by proportionate physical security measures, with enforcement commencing **April 2027**.

Fyrfly's integrated system directly addresses the Act's technical requirements:

| Martyn's Law Requirement | Fyrfly Technical Provision |
|---|---|
| Documented emergency communication procedure | Automated cascade: push notification → ARC → emergency services, logged with full audit trail |
| Staff training records | VMS audit log captures drill activations, participation timestamps, and outcome reports |
| Lockdown capability (Enhanced Tier) | Dynamic lockdown: all access doors secured in <2 seconds from single authenticated trigger |
| Monitoring during events | Real-time CCTV + AI anomaly detection across permanent and temporary (solar tower) coverage |
| Evidence of periodic testing | Drill mode: full sequence executed without ARC/999 notification; results logged automatically |

> **Enhanced Tier note (800+ capacity):** Fyrfly's system architecture satisfies the physical measures requirements of the Enhanced Tier. A site-specific Martyn's Law compliance document is produced as part of every installation, suitable for submission to the SIA (Security Industry Authority) inspectorate.

---

### Rapid-Deployment Solar CCTV Tower

For temporary events — Christmas markets, school fetes, civic festivals, construction sites — Fyrfly's solar-powered mobile CCTV tower extends the integrated platform to any location without civil infrastructure.

![Fyrfly Rapid Deployment Solar CCTV Tower for UK Events and Construction Sites: Off-Grid AI Surveillance with 5G Connectivity and ARC Integration](https://www.fyrflysystems.com/assets/solar-cctv-tower.png)

```
Technical Specifications — Fyrfly Solar CCTV Tower
─────────────────────────────────────────────────────
Mast height:          5m or 6m (pneumatic or manual raise)
Solar array:          800W / 1000W / 1200W monocrystalline
Battery system:       440Ah @ 24V (LiFePO4 or lead-acid)
Usable battery:       ~8.45 kWh (80% DoD)
Daily system draw:    ~1.0 kWh (cameras, NVR, 5G, analytics)
Battery autonomy:     ~8.5 days at full load, zero solar input
Connectivity:         Dual-SIM 4G/5G primary; Starlink optional
Camera payload:       PTZ, bullet, 360° panoramic, thermal (configurable)
Deployment time:      <90 minutes (single engineer)
Operating temp:       -20°C to +55°C
IP rating:            IP66 (mast head); IP54 (battery/electronics enclosure)
Trailer option:       Road-legal, pump-truck slots, forklift points
Integration:          Full VMS integration; ARC-connected; AI analytics active
```

---

## VMS & API Integrations

### ONVIF & RTSP Compatibility

Fyrfly's VMS is built on an open integration architecture. Cameras and access control hardware conforming to published standards integrate without proprietary lock-in.

**Supported ONVIF Profiles:**

| Profile | Capability |
|---|---|
| Profile S | Basic streaming, PTZ control, event handling |
| Profile G | Edge recording, storage management |
| Profile T | H.265 streaming, metadata, analytics events |
| Profile A | Access control device management |
| Profile C | Door control and monitoring |

```python
# Example: Registering an ONVIF camera with Fyrfly VMS SDK
from fyrfly_sdk import VMSClient, CameraConfig

vms = VMSClient(
    host="https://vms.yourschool.ac.uk",
    api_key="YOUR_API_KEY"
)

# Discover and register an ONVIF-compliant camera
camera = vms.cameras.register(
    CameraConfig(
        onvif_host="192.168.10.45",
        onvif_port=80,
        rtsp_uri="rtsp://192.168.10.45:554/Streaming/Channels/101",
        username="admin",
        password="CAMERA_PASSWORD",   # Stored in Fyrfly secrets vault
        analytics_profile="LOITERING_DETECTION",
        zone_assignments=["main-entrance", "perimeter-east"],
        retention_days=31,
        resolution="4K"
    )
)

print(f"Camera registered: {camera.id} — {camera.name}")
# Output: Camera registered: CAM-00142 — Main Entrance East PTZ
```

---

### Active Directory & Identity Sync

Access credentials are provisioned and revoked automatically via LDAP/S sync with your existing Active Directory or Azure AD (Entra ID) instance.

```yaml
# /etc/fyrfly/ad-sync.yml
# Active Directory integration configuration

active_directory:
  provider: "microsoft_ad"          # microsoft_ad | azure_entra | openldap
  domain: "school.local"
  ldap_host: "ldaps://dc01.school.local:636"
  base_dn: "DC=school,DC=local"
  service_account: "svc_fyrfly@school.local"
  service_account_secret: "${AD_SERVICE_SECRET}"   # Injected from secrets vault
  sync_interval_minutes: 15
  tls_verify: true
  tls_ca_cert: "/etc/fyrfly/certs/school-ca.pem"

  group_to_role_mappings:
    "SG_Security_Admins":    "FYRFLY_ADMIN"
    "SG_Senior_Leadership":  "FYRFLY_SITE_MANAGER"
    "SG_Teaching_Staff":     "FYRFLY_VIEWER"
    "SG_Support_Staff":      "FYRFLY_VIEWER"
    "SG_Contractors":        "FYRFLY_TEMP_ACCESS"
    "SG_Governors":          "FYRFLY_AUDIT_ONLY"

  credential_provisioning:
    auto_provision_on_add: true
    auto_revoke_on_disable: true     # Immediate revocation on AD account disable
    auto_revoke_on_delete: true
    credential_types:
      - type: "SMART_CARD"
        pin_required: false
      - type: "MOBILE_CREDENTIAL"
        pin_required: false
        platforms: ["ios", "android"]

  audit:
    log_all_sync_events: true
    log_destination: "syslog"        # syslog | splunk | azure_sentinel
    alert_on_bulk_revocation: true   # Alert if >10 credentials revoked in one sync
```

---

### Lockdown API Reference

The Fyrfly REST API allows authenticated third-party systems — emergency management platforms, building management systems, panic button integrations — to trigger and manage lockdown states programmatically.

**Base URL:** `https://api.fyrflysystems.com/v1`

**Authentication:** Bearer token (OAuth 2.0 client credentials flow). Lockdown-scope tokens require IP allowlist restriction and MFA confirmation on issuance.

#### Initiate Site Lockdown

```bash
POST /sites/{site_id}/lockdown
```

```bash
curl -X POST https://api.fyrflysystems.com/v1/sites/SCH-001-MAIN/lockdown \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -H "X-Fyrfly-Request-ID: $(uuidgen)" \
  -d '{
    "lockdown_type": "FULL_LOCKDOWN",
    "initiated_by": "control-room-01@school.ac.uk",
    "reason": "Unconfirmed threat reported at main entrance",
    "notify_arc": true,
    "notify_staff": true,
    "staff_message": "Lockdown in effect. Follow emergency procedures.",
    "drill_mode": false
  }'
```

**Response (200 OK):**

```json
{
  "status": "LOCKDOWN_INITIATED",
  "lockdown_id": "LKD-20260415-142307-001",
  "site_id": "SCH-001-MAIN",
  "lockdown_type": "FULL_LOCKDOWN",
  "initiated_by": "control-room-01@school.ac.uk",
  "initiated_at": "2026-04-15T14:23:07.441Z",
  "doors_locked": 24,
  "doors_failed": 0,
  "cameras_escalated": 40,
  "arc_notified": true,
  "arc_notification_id": "ARC-20260415-98312",
  "staff_alerts_sent": 87,
  "audit_id": "AUD-20260415-142307",
  "estimated_completion_ms": 1500,
  "_links": {
    "status": "/v1/sites/SCH-001-MAIN/lockdown/LKD-20260415-142307-001",
    "release": "/v1/sites/SCH-001-MAIN/lockdown/LKD-20260415-142307-001/release",
    "audit_log": "/v1/audit/LKD-20260415-142307-001"
  }
}
```

#### Release Lockdown (requires dual authorisation)

```bash
POST /sites/{site_id}/lockdown/{lockdown_id}/release
```

```bash
curl -X POST https://api.fyrflysystems.com/v1/sites/SCH-001-MAIN/lockdown/LKD-20260415-142307-001/release \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "released_by": "headteacher@school.ac.uk",
    "second_authorisation": "slt-02@school.ac.uk",
    "reason": "All-clear confirmed by emergency services",
    "police_incident_ref": "MPS/2026/041234"
  }'
```

#### Get Site Status

```bash
GET /sites/{site_id}/status
```

```json
{
  "site_id": "SCH-001-MAIN",
  "site_name": "Maidstone Grammar School — Main Site",
  "lockdown_state": "NORMAL",
  "last_lockdown": "2026-04-15T14:23:07Z",
  "cameras_online": 40,
  "cameras_offline": 0,
  "doors_online": 24,
  "doors_offline": 0,
  "network_status": "PRIMARY",
  "last_sync": "2026-05-23T09:15:02Z"
}
```

---

### Webhook Event Schema

Subscribe to real-time security events via HTTPS webhook. All webhook deliveries are signed with HMAC-SHA256.

```json
{
  "event_id": "EVT-20260415-142305-7712",
  "event_type": "CCTV_LOITERING_ALERT",
  "severity": "HIGH",
  "site_id": "SCH-001-MAIN",
  "timestamp": "2026-04-15T14:23:05.112Z",
  "payload": {
    "camera_id": "CAM-00142",
    "camera_name": "Main Entrance East PTZ",
    "zone": "main-entrance",
    "dwell_seconds": 187,
    "confidence": 0.94,
    "snapshot_url": "https://vms.yourschool.ac.uk/snapshots/EVT-20260415-142305-7712.jpg",
    "clip_url": "https://vms.yourschool.ac.uk/clips/EVT-20260415-142305-7712.mp4"
  },
  "signature": "sha256=a4b8c2d1e5f9..."
}
```

**Available event types:**

```
CCTV_LOITERING_ALERT         ACCESS_DOOR_FORCED
CCTV_PERIMETER_BREACH        ACCESS_DOOR_HELD_OPEN
CCTV_CROWD_FORMATION         ACCESS_TAILGATE_DETECTED
CCTV_ABANDONED_OBJECT        ACCESS_INVALID_CREDENTIAL
CCTV_CAMERA_OFFLINE          ACCESS_LOCKDOWN_INITIATED
CCTV_ANPR_MATCH              ACCESS_LOCKDOWN_RELEASED
CCTV_THERMAL_DETECTION       NETWORK_DEVICE_OFFLINE
VISITOR_BARRED_LIST_MATCH    NETWORK_FAILOVER_ACTIVATED
SYSTEM_HEALTH_DEGRADED       AUDIT_SAR_EXPORT_REQUESTED
```

---

## Data Security & UK GDPR

### Edge-Encrypted Storage

All footage is processed and encrypted at the edge. No raw video is transmitted unencrypted at any point.

```
Encryption at rest:    AES-256-GCM (camera SD card, NVR, NAS)
Encryption in transit: TLS 1.3 (camera → NVR, NVR → VMS, VMS → client)
Key management:        Per-site HSM (Hardware Security Module) or cloud KMS
                       (AWS KMS / Azure Key Vault) — customer-managed keys available
Footage hashing:       SHA-256 hash generated on write; verified on read
                       (tamper-evident chain of custody for evidential footage)
Secure deletion:       DoD 5220.22-M 3-pass overwrite on retention expiry
                       NIST 800-88 compliant media sanitisation on hardware disposal
```

### Role-Based Access Control

```
FYRFLY_ADMIN          Full system access; user management; audit log export
FYRFLY_SITE_MANAGER   Site-level configuration; lockdown authority; viewer access
FYRFLY_OPERATOR       Live view; playback within permitted zones; alert management
FYRFLY_VIEWER         Live view only; no playback; no export
FYRFLY_AUDIT_ONLY     Audit log and compliance report access; no footage access
FYRFLY_TEMP_ACCESS    Time-limited credential access; no VMS access

All access events logged:  User, action, resource, timestamp, source IP
Session management:        MFA enforced for ADMIN and SITE_MANAGER roles
Inactivity timeout:        Configurable per role (default: 15 minutes)
Concurrent session limit:  Configurable per role (default: 3 sessions)
```

### Retention, SARs & ICO Compliance

| Data Type | Default Retention | Extension Trigger | Deletion Method |
|---|---|---|---|
| CCTV footage (general) | 31 days | Incident flag / ongoing investigation | Secure overwrite (AES-256) |
| CCTV footage (evidential) | Indefinite (flagged) | Manual flag by ADMIN | Manual deletion with audit log entry |
| Access control logs | 12 months | Legal hold | Secure deletion |
| Visitor records | 12 months | SAR / legal hold | Right-to-erasure workflow |
| ANPR data | 30 days (standard) | Enforcement action | Secure deletion |
| Audit logs | 7 years | Regulatory requirement | Immutable; deletion requires dual ADMIN auth |

#### Subject Access Request (SAR) Workflow

```
1. SAR received by Data Controller (council, school, MAT)
2. Operator searches VMS by date range, camera, or access credential
3. Relevant footage identified and clipped
4. Automated third-party face-blurring applied (configurable: manual review option)
5. Clip exported to encrypted ZIP with SHA-256 manifest
6. Export logged in audit trail (requestor, date, scope, exporting officer)
7. Delivered to requestor via secure link (expiring 7-day download URL)
```

#### DPIA Support

Fyrfly provides a completed Data Protection Impact Assessment template for each deployment type (school CCTV estate, town centre surveillance, access control with biometric). These are maintained against current ICO guidance and are available to Data Protection Officers on request.

---

## Deployment & Installation

### Network Prerequisites

```
┌─────────────────────────────────────────────────────────────────┐
│               FYRFLY NETWORK PREREQUISITES                       │
├─────────────────────┬───────────────────────────────────────────┤
│ Security VLAN       │ Dedicated /24 subnet minimum               │
│                     │ DSCP EF marking on all security ports      │
│                     │ 802.1X port authentication enforced        │
│                     │ No NAT between camera subnet and NVR       │
├─────────────────────┼───────────────────────────────────────────┤
│ Bandwidth           │ 200 Mbps+ dedicated (30x 4K cameras)       │
│                     │ 10 Mbps per access control cluster (20 rdr)│
│                     │ Physically separate from learning network  │
├─────────────────────┼───────────────────────────────────────────┤
│ WAN / Uplink        │ 50 Mbps minimum for ARC feed + remote mgmt │
│                     │ Static IP or dynamic DNS for VMS access    │
│                     │ Firewall: outbound 443, 554 (RTSP), 8883   │
├─────────────────────┼───────────────────────────────────────────┤
│ Failover            │ Secondary 4G/5G SIM (dual-SIM router)      │
│                     │ Auto-switchover <30s on primary link loss  │
├─────────────────────┼───────────────────────────────────────────┤
│ DNS                 │ Internal resolution for VMS hostname        │
│                     │ NTP sync required (stratum 2 or better)    │
├─────────────────────┼───────────────────────────────────────────┤
│ Switching           │ Managed PoE+ switches (802.3at minimum)    │
│                     │ VLAN trunking on all uplinks                │
│                     │ SNMP v3 for Fyrfly network monitoring       │
└─────────────────────┴───────────────────────────────────────────┘
```

### Server & NVR Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│              NVR / VMS SERVER SPECIFICATIONS                     │
├─────────────────────┬───────────────────────────────────────────┤
│ CPU                 │ Intel Xeon E-2300 / AMD EPYC 7003 or equiv │
│                     │ (8 cores minimum for 30+ camera estates)   │
├─────────────────────┼───────────────────────────────────────────┤
│ RAM                 │ 32GB ECC minimum                           │
│                     │ 64GB recommended (>30 cameras + analytics) │
├─────────────────────┼───────────────────────────────────────────┤
│ GPU (AI analytics)  │ NVIDIA T400 or better for edge offload     │
│                     │ (Required for >20 camera AI estates)       │
├─────────────────────┼───────────────────────────────────────────┤
│ Storage             │ RAID-6 NAS minimum                         │
│                     │ 4TB per camera per 31 days (4K H.265)      │
│                     │ ~120TB raw for 30-camera 31-day estate     │
├─────────────────────┼───────────────────────────────────────────┤
│ OS                  │ Ubuntu 22.04 LTS (hardened, recommended)   │
│                     │ Windows Server 2022 Standard (supported)   │
├─────────────────────┼───────────────────────────────────────────┤
│ Network             │ Dual 10GbE NICs                            │
│                     │ NIC 1: security VLAN (camera traffic)      │
│                     │ NIC 2: management VLAN (VMS access)        │
├─────────────────────┼───────────────────────────────────────────┤
│ UPS                 │ 2kVA minimum; network-managed shutdown      │
│                     │ Runtime: 30 minutes at full load minimum   │
└─────────────────────┴───────────────────────────────────────────┘
```

### Pre-Installation Checklist

```markdown
Infrastructure
  [ ] Security VLAN created and documented on network topology
  [ ] PoE+ switches provisioned with VLAN trunk configuration
  [ ] Structured cabling survey completed (CAT6A minimum recommended)
  [ ] UPS units installed at all IDF/MDF locations
  [ ] NVR/server rack space allocated with adequate ventilation

Network
  [ ] IP addressing scheme documented for all cameras and readers
  [ ] DHCP reservations or static assignments confirmed
  [ ] DNS entries created for VMS hostname
  [ ] NTP server confirmed (stratum 2 or better)
  [ ] Firewall rules: outbound 443, 554, 8883 permitted from security VLAN
  [ ] 4G/5G failover SIMs active and tested

Access Control
  [ ] Door hardware survey completed (frame type, lock type, cable run)
  [ ] Power supply to each door confirmed (PoE+ or 12V DC)
  [ ] Active Directory service account created with read access to relevant OUs
  [ ] Credential policy agreed (card only, card+PIN, mobile)
  [ ] Door schedules documented per zone

Governance
  [ ] DPIA completed and signed by DPO/SIRO
  [ ] Retention periods documented per data type
  [ ] Signage specification agreed (ICO-compliant)
  [ ] CCTV policy drafted and approved by governing body / council committee
  [ ] ARC monitoring contract in place (if applicable)
  [ ] Martyn's Law responsible person designated (if applicable)
```

---

## Supported Standards & Certifications

| Standard / Certification | Scope | Status |
|---|---|---|
| NSI NACOSS Gold | CCTV & access control design and installation | ✅ Certified |
| SSAIB Approved | Intruder and fire systems installation | ✅ Approved |
| ISO 9001:2015 | Quality management system | ✅ Certified |
| BAFE SP203 | Fire detection design and installation | ✅ Registered |
| BS EN 62676 | CCTV systems for security applications | ✅ Compliant |
| BS 8243 | Intruder and hold-up alarm systems | ✅ Compliant |
| ONVIF Profile S/G/T/A/C | Open camera and access control interoperability | ✅ Supported |
| Surveillance Camera Code of Practice (PoFA 2012) | Public space and school CCTV governance | ✅ Compliant |
| UK GDPR & Data Protection Act 2018 | All personal data processing | ✅ Compliant |
| Data (Use and Access) Act 2025 | Data governance obligations | ✅ Aligned |
| Terrorism (Protection of Premises) Act 2025 | Martyn's Law — Standard & Enhanced Tier | ✅ Ready |
| KCSiE (Keeping Children Safe in Education) | School safeguarding technology obligations | ✅ Aligned |
| Crown Commercial Service (CCS) | Public sector direct award procurement | ✅ Available |
| Constructionline Gold | Supply chain and financial pre-qualification | ✅ Qualified |
| G-Cloud Framework | Digital marketplace (network & managed services) | ✅ Listed |

---

## Contact & Technical Support

### Technical Assessment

IT Directors, MAT Estate Managers, and system integrators can request a no-obligation **Campus Infrastructure & Technical Assessment**, which includes:

- Network architecture review and security VLAN design consultation
- Camera coverage and blind spot analysis
- Access control hardware survey and OSDP compatibility assessment
- Martyn's Law compliance gap analysis with documented output
- UK GDPR / ICO readiness review with DPIA template

### Support Channels

| Channel | Contact | Response SLA |
|---|---|---|
| Technical pre-sales | hello@fyrflysystems.com | Next business day |
| Installation enquiries | hello@fyrflysystems.com | Next business day |
| Existing customer support | support@fyrflysystems.com | 4 hours (P1) / Next business day (P2/P3) |
| Emergency out-of-hours | 01234 567 890 | 2 hours (P1 contract customers) |

### Links

| Resource | URL |
|---|---|
| Main website | [www.fyrflysystems.com](https://www.fyrflysystems.com) |
| Education sector | [fyrflysystems.com/education.html](https://www.fyrflysystems.com/education.html) |
| Public sector | [fyrflysystems.com/public-sector.html](https://www.fyrflysystems.com/public-sector.html) |
| CCTV systems | [fyrflysystems.com/cctv.html](https://www.fyrflysystems.com/cctv.html) |
| Access control | [fyrflysystems.com/access-control.html](https://www.fyrflysystems.com/access-control.html) |
| Wireless networks | [fyrflysystems.com/wireless-networks.html](https://www.fyrflysystems.com/wireless-networks.html) |
| Solar CCTV Tower | [fyrflysystems.com/cctv-tower.html](https://www.fyrflysystems.com/cctv-tower.html) |

---

<div align="center">

**Fyrfly Systems Ltd** &nbsp;|&nbsp; NSI NACOSS Gold &nbsp;|&nbsp; SSAIB Approved &nbsp;|&nbsp; ISO 9001:2015 &nbsp;|&nbsp; CCS Framework

*Integrated school security systems designed, installed and maintained across the UK*

[www.fyrflysystems.com](https://www.fyrflysystems.com) &nbsp;&nbsp; hello@fyrflysystems.com &nbsp;&nbsp; 01234 567 890

</div>
