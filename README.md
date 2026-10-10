# Campus Pulse — Organizational Issue Intelligence & Resolution Platform

**Campus Pulse** is an organization-neutral issue reporting, collective tracking, impact prioritization, and verified resolution platform designed for colleges, universities, corporate offices, companies, and shared residential facilities.

Rather than acting as a static complaint box, Campus Pulse functions as a **collaborative problem-intelligence system** that transforms individual experiences into actionable priorities, eliminates duplicate tickets, and provides verified proof of resolution.

---

## 📸 Visual Design & Wireframe Fidelity
The interface was crafted according to the design specification and reference wireframes in `Image_references/`:
- **Light Theme & Restrained Palette**: Soft neutral surfaces (`#f8fafc`, `#ffffff`), primary blue (`#1d4ed8`), with calibrated status accents.
- **Enterprise-Grade Typography**: Rendered with modern Google Fonts (*Plus Jakarta Sans*).
- **Responsive Layout**: Adapts between full desktop widescreen command centers and mobile smartphone views.
- **Organization Neutral**: Adaptable to corporate offices, university campuses, or co-working spaces with general terms (*members*, *staff*, *handlers*, *management*).

---

## 🚀 Key Features Implemented

### 1. Frictionless Issue Reporting (Multi-Step Form)
- Category selection grid (Water, Wi-Fi, Cleanliness, Facilities, Food, Transport, Parking, Safety, Equipment, Infrastructure, Other).
- Concise title input with live character counter (max 80 chars).
- Location selector with quick-fill zone pills.
- Urgency tiers: *Not Urgent*, *Needs Attention*, *Urgent*.
- Identity visibility options: *With my identity* (showing initials & name) or *Anonymously*.
- Photo evidence upload with live thumbnail preview.
- Category-specific SLA indicator (e.g., *Campus Operations Team • Avg resolution ~3 hrs*).

### 2. Live Duplicate Detection & Interception
- While typing the title and selecting category/location, an intelligent similarity algorithm analyzes active issues in real time.
- If a match is detected (e.g., reporting a leaking water cooler in Block B), an alert banner immediately invites the user to **"Confirm Existing Issue"** instead of flooding the team with duplicates.

### 3. Collective Impact Confirmation ("I'm facing this too")
- Any member can click the affected counter on an issue card or details screen.
- Increments the affected-person count and links the user's session to status updates.

### 4. Dynamic Priority Impact Engine
- Automatically scores every issue from 0 to 100 based on:
  - Base urgency (Low: 20 pts, Needs Attention: 40 pts, Urgent: 60 pts)
  - Collective impact weight ($\text{affectedCount} \times 2.5$)
  - Stagnation / aging penalty (+10 to +15 pts for unresolved tickets past SLA)
  - Reopened modifier (+20 pts escalation)
- Categorizes issues into visual priority tiers: **Critical**, **High**, **Medium**, **Low**.

### 5. Transparent Multi-Stage Status Workflow
Progresses through defined lifecycle stages:
- `Reported` ➔ `Acknowledged / Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Reopened`

### 6. Resolution Verification & Re-open Mechanism
- When marked resolved, handlers submit resolution notes and an "after" photo.
- Affected members are presented with a verification prompt:
  - **"Yes, it is fixed"**: Records satisfaction count.
  - **"No, problem persists (Reopen)"**: Escalates the issue back to `Reopened` with high urgency.

### 7. Multi-Role Perspective Switcher
An in-app switcher allows exploring all 3 core personas:
1. **Member (Viraj K.)**: Report issues, track reports, confirm active issues, verify resolutions.
2. **Staff / Handler (Alex Martinez)**: View assigned work queue, post progress notes, complete resolutions with proof.
3. **Management / Admin (Sarah Patel)**: Full organization-wide view, ticket assignment, and executive analytics.

### 8. Management Analytics & Recurrence Detection
- Executive KPI summary cards (Total reported, Unresolved, In Progress, Resolved, Mean Time to Resolution).
- Top issues affecting the most people.
- Category frequency distribution breakdown.
- Location hotspots & recurrence detection (identifies repeating infrastructure failures across spatial zones).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite 6, Vanilla CSS design system.
- **Icons**: Lucide Icons.
- **State Management**: React Context (`AuthContext`, `IssueContext`).
- **Data Persistence**: `storageService.js` (LocalStorage engine with realistic mock seed data).
- **Domain Engines**:
  - `src/services/priorityEngine.js`: Impact calculation algorithm.
  - `src/services/duplicateDetector.js`: Text token & location similarity heuristics.
- **Documentation**:
  - [`docs/REQUIREMENTS.md`](file:///c:/projects/DT_project/Campus%20Pulse/docs/REQUIREMENTS.md): Formal requirements specification.
  - [`docs/ARCHITECTURE.md`](file:///c:/projects/DT_project/Campus%20Pulse/docs/ARCHITECTURE.md): Modular design & backend contract specification.

---

## 💻 Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.
