# Campus Pulse — System Requirements Specification (SRS)

## 1. Executive Summary & Purpose
**Campus Pulse** is an organization-neutral issue reporting, tracking, prioritization, and resolution platform. It is engineered to capture everyday operational and facility friction points across diverse organizations—including corporate offices, research institutions, colleges, multi-facility enterprises, co-working hubs, and managed residential properties.

By shifting organizational grievance handling from isolated complaint forms into a **collaborative problem-intelligence system**, Campus Pulse:
1. Provides frictionless, multi-channel reporting for low-barrier submissions.
2. Crowdsources real-time confirmation ("I am experiencing this too") to eliminate duplicate tickets and accurately gauge collective impact.
3. Employs intelligent heuristic clustering to group related incidents across zones.
4. Computes a dynamic Priority Impact Score to help facility managers and operations teams triage urgent risks versus routine maintenance.
5. Implements transparent multi-stage status workflows with closure verification and re-open capability.
6. Delivers high-level operational intelligence and recurrence trend analysis.

---

## 2. Organization-Neutral Terminology & Scope
To ensure universal applicability without domain bias:
- **Tenant / Organization**: The entity utilizing the instance (e.g., Tech Park, University, Corporate Headquarters, Co-working Hub).
- **Locations / Zones**: Spatial areas (e.g., Building A, Floor 2, Pantry, Conference Wing, Room 302, Parking Bay).
- **Users / Members**: Any individual within the facility (employees, researchers, students, residents, visitors).
- **Issue Handlers / Operations Staff**: Field responders and departmental technicians (HVAC, Electrical, IT/Network, Janitorial, Security).
- **Management / Administrators**: Operations directors, facility managers, and safety compliance leads.

---

## 3. Functional Requirements

### FR-1: Frictionless Issue Reporting
- **Category Taxonomy**: Quick selection grid with standard high-frequency categories:
  - Water & Plumbing
  - Wi-Fi & Network Infrastructure
  - Cleanliness & Sanitation
  - Facilities & HVAC
  - Food & Cafeteria
  - Transportation & Shuttles
  - Parking & EV Stations
  - Safety & Security
  - Equipment & Appliances
  - General Infrastructure
  - Other / Cross-category
- **Reporting Parameters**:
  - Title (mandatory, concise, max 80 characters, live count indicator)
  - Detailed Description (optional if title is descriptive)
  - Location / Affected Area (structured zone / room selector with freeform text)
  - Urgency Assessment:
    - *Not urgent*: Minor inconvenience, normal turnaround (~24-48h)
    - *Needs attention*: Disrupting normal productivity/use (~3-6h)
    - *Urgent*: Safety hazard or severe disruption (< 1h)
  - Identity Visibility:
    - *With identity*: Shows reporter's verified avatar and name to authorized handlers.
    - *Anonymous*: Suppresses personal identifiers on public feeds and handler tickets while recording cryptographic audit hashes internally.
  - Media Attachment: Photo or file upload support with preview and size checking.
- **Smart Duplicate Interception**:
  - As the user types the title and selects the category/location, the system queries active reports in the vicinity.
  - If a matching open report is detected (e.g., "Water cooler leaking in 2nd floor pantry"), the UI proactively presents: *"Are you experiencing this existing issue? Confirm it now instead of submitting a duplicate ticket."*

### FR-2: Existing Issue Confirmation & Impact Amplification
- Any authenticated member can click **"I'm facing this too"** on an active report.
- Toggling confirmation increments the affected-person count (+1).
- Members can subscribe to status updates and resolution notifications for that issue.
- Eliminates ticket flood while providing statistical proof of impact magnitude to dispatchers.

### FR-3: Priority & Triage Engine (Dynamic Impact Score)
Each issue is scored using a multi-factor weighting formula:
$$\text{Priority Score} = w_s \cdot S + w_u \cdot U + w_a \cdot \min(N_{\text{affected}}, 20) + w_t \cdot T_{\text{elapsed}}$$
- **Severity & Urgency Base**: Low (10), Needs Attention (25), Urgent (50).
- **Collective Impact Weight**: Amplified as more unique members confirm the issue.
- **Time Escalation**: Incremental weight added as unassigned or unresolved tickets age past SLA thresholds.
- **Visual Tier**: Prioritization tiers displayed clearly: Critical / High / Medium / Low.

### FR-4: Lifecycle & Tracking Workflow
Issues progress through a strict, transparent finite state machine:
1. `Reported`: Freshly logged ticket awaiting initial triage.
2. `Under Review`: Operations team assessing validity, duplicates, and resource requirements.
3. `Assigned`: Dispatched to a designated staff member or vendor.
4. `In Progress`: Active physical or technical work underway on-site.
5. `Resolved`: Handler logged resolution notes with before/after evidence photos.
6. `Reopened`: Members flag that the problem persists or has recurred within the verification window.

### FR-5: Resolution Verification & Re-open Mechanism
- Handlers provide a mandatory resolution summary and optional "after" photo.
- Affected members receive a verification prompt: *"Was this problem resolved satisfactorily?"*
  - **Yes, it's fixed**: Increments resolution confidence rating; closes ticket permanently after verification window.
  - **No, still broken**: Prompts member for feedback and transitions the ticket status to `Reopened` with elevated urgency.

### FR-6: Analytics & Operational Intelligence
- **High-level KPI Cards**: Total Reported, Active/Open, In Progress, Resolved Today, Average MTTR (Mean Time to Resolution).
- **Recurrence Detection**: Flags repeat failures in the same location or equipment within 30 days.
- **Distribution Visualizations**:
  - Category breakdown
  - Hotspot locations / zones
  - Resolution speed by category
  - Top 5 issues affecting the most people

### FR-7: Search, Filter & Quick Discovery
- Multi-dimensional filtering by Category, Zone/Location, Urgency, Status, and Date Range.
- Search with keyword auto-complete across titles, descriptions, and locations.
- Sort options: Highest Priority, Most Affected People, Newest First, Oldest First.

### FR-8: Role-Based Access Control (RBAC)
- **Member (General User)**: Report issues, browse public issues, confirm existing issues, view "My Reports", verify resolution.
- **Staff / Issue Handler**: Access "Assigned Issues" queue, update status, log work notes, upload resolution photos, mark resolved.
- **Administrator / Management**: Full organization-wide visibility, manual ticket assignment, SLA config, priority override, analytics dashboard, organization settings.
- **Demo Quick Switcher**: Integrated in-app switcher permitting instant role swapping for seamless demonstration of all 3 user journeys.

---

## 4. Non-Functional Requirements
- **Design Aesthetic**: Professional enterprise light-mode UI inspired by modern design systems.
- **Color Palette**: Primary Blue (`#1d4ed8`), slate neutral surfaces (`#f8fafc`, `#ffffff`), with calibrated, accessible semantic accents (amber, emerald, crimson).
- **Responsive Adaptability**: Flawless experience across mobile touchscreens (matching reference wireframes) and wide-screen desktop displays.
- **Data Persistence**: Local storage persistence engine with full mock fallback and plug-and-play architecture for REST/GraphQL/Firebase backends.
- **Zero Mock Contamination**: Explicit labelling showing system state, data sources, and operational health.
