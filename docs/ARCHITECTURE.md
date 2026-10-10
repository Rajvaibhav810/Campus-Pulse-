# Campus Pulse — System Architecture & Modular Design

## 1. Architectural Philosophy
Campus Pulse is designed with strict separation of concerns, decoupling presentation components, client-side business logic (clustering, scoring), and persistence/networking layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                       Presentation Layer                        │
│   Navbar / BottomNav | Issue Cards | Interactive Multi-step Form│
│   Analytics Graphs   | Management Triage Matrix | Timeline View │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                   Context & State Controllers                   │
│   AuthContext (Active Persona, Roles, Tenant Configuration)     │
│   IssueContext (CRUD, Upvotes, Filters, Reactive Clustering)    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                     Domain Engines & Services                   │
│  priorityEngine.js      duplicateDetector.js    storageService  │
│  (Multi-factor scoring) (Text similarity & zone) (Local/API sync)│
└─────────────────────────────────┬───────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                        Data Layer & Mock                        │
│   LocalStorage Adapter ──► REST API Client (Ready for Backend)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Data Models

### 2.1 Issue Entity
```typescript
interface Issue {
  id: string;                      // e.g. "CP-1042"
  title: string;                   // e.g. "Water cooler leaking & low pressure"
  description: string;             // Detailed observations
  category: CategoryKey;           // 'water' | 'wifi' | 'cleanliness' | 'facilities' | ...
  location: {
    buildingOrZone: string;        // "Block B"
    floorOrRoom: string;           // "2nd Floor Pantry"
    fullText: string;              // "Block B, 2nd Floor Pantry"
  };
  urgency: 'low' | 'medium' | 'high'; // Reporter assessment
  status: 'reported' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'reopened';
  reportedBy: {
    id: string;
    name: string;
    initials: string;
    isAnonymous: boolean;
  };
  createdAt: string;               // ISO 8601
  updatedAt: string;
  affectedCount: number;           // Initial 1 + number of confirmations
  confirmedUserIds: string[];      // List of member IDs who pressed "I'm facing this too"
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  priorityScore: number;           // Computed 0 - 100 via priorityEngine
  priorityTier: 'critical' | 'high' | 'medium' | 'low';
  photoUrl?: string;               // Before photo
  resolutionEvidence?: {
    resolvedAt: string;
    resolvedBy: string;
    note: string;
    afterPhotoUrl?: string;
    verifiedCount: number;         // Users confirming fix worked
    reopenCount: number;           // Users flagging still broken
  };
  history: Array<{
    timestamp: string;
    status: string;
    actor: string;
    comment?: string;
  }>;
  duplicateGroupKey?: string;      // Cluster ID if grouped
}
```

### 2.2 Organization & Tenant Model
```typescript
interface OrganizationConfig {
  id: string;
  name: string;
  campusName: string;
  emergencyHotline: {
    number: string;
    label: string;
    note: string;
  };
  categories: Array<{ id: string; name: string; icon: string; avgResolutionHours: number }>;
  zones: string[];
}
```

---

## 3. Priority Engine Algorithm
Priority is dynamically computed to reward collective reporting and penalize stagnation:
- Base Urgency:
  - Low: 15 pts
  - Medium / Needs Attention: 35 pts
  - High / Urgent: 60 pts
- Affected Crowd Weight:
  - $\min(affectedCount \times 5, 25)$ pts
- Latency Penalty:
  - Issues open > 12h add +10 pts
  - Issues open > 48h add +20 pts
- Status Factor:
  - Resolved: score scaled to 0
  - In Progress: slightly decremented to reflect active mitigation

---

## 4. Smart Duplicate Detection
The duplicate engine compares user inputs against active open issues using:
1. Category exact match (+30%)
2. Zone / location token overlap (+35%)
3. Text n-gram and keyword similarity on Title (+35%)
If confidence exceeds 60%, the reporting wizard shows the matching issue with an inline one-click confirmation button.
