// Campus Pulse — Realistic Organization-Neutral Mock Seed Data

export const INITIAL_ORGANIZATION = {
  id: 'org-1',
  name: 'Acme Corp',
  campusName: 'Tech Park Campus',
  emergencyHotline: {
    number: '4444',
    label: 'Campus Emergency Hotline',
    note: 'Dial 4444 for immediate medical or security support.'
  },
  categories: [
    { id: 'water', name: 'Water', icon: 'Droplets', avgResolutionHours: 3 },
    { id: 'wifi', name: 'Wi-Fi / Network', icon: 'Wifi', avgResolutionHours: 2 },
    { id: 'cleanliness', name: 'Cleanliness', icon: 'Sparkles', avgResolutionHours: 4 },
    { id: 'facilities', name: 'Facilities', icon: 'Building2', avgResolutionHours: 8 },
    { id: 'food', name: 'Food / Cafeteria', icon: 'Utensils', avgResolutionHours: 2 },
    { id: 'transport', name: 'Transport', icon: 'Bus', avgResolutionHours: 6 },
    { id: 'parking', name: 'Parking', icon: 'SquareParking', avgResolutionHours: 12 },
    { id: 'safety', name: 'Safety', icon: 'ShieldAlert', avgResolutionHours: 1 },
    { id: 'equipment', name: 'Equipment', icon: 'Wrench', avgResolutionHours: 5 },
    { id: 'infrastructure', name: 'Infrastructure', icon: 'Hammer', avgResolutionHours: 24 },
    { id: 'other', name: 'Other Issue', icon: 'MoreHorizontal', subtitle: 'General inquiries or multi-category needs', avgResolutionHours: 12 }
  ],
  zones: [
    'Block A, Ground Floor Lobby',
    'Block B, 2nd Floor Pantry',
    'Block B, 2nd Floor, Room 204',
    'West Wing, Room 302',
    'Floor 4, Open Workspace',
    'Print Station C',
    'Central Dining Hall, Ground Floor',
    'North Parking Garage, Gate 2',
    'Innovation Lab 1, Basement',
    'Executive Boardroom, Floor 5'
  ]
};

export const INITIAL_USERS = [
  {
    id: 'user-vk',
    name: 'Viraj K.',
    initials: 'VK',
    role: 'member', // 'member' | 'handler' | 'admin'
    roleLabel: 'General Member',
    email: 'viraj.k@acmecorp.internal',
    department: 'Engineering & Product'
  },
  {
    id: 'user-alex',
    name: 'Alex Martinez',
    initials: 'AM',
    role: 'handler',
    roleLabel: 'Campus Operations Specialist',
    email: 'operations@acmecorp.internal',
    department: 'Facilities & Infrastructure'
  },
  {
    id: 'user-sarah',
    name: 'Sarah Patel',
    initials: 'SP',
    role: 'admin',
    roleLabel: 'Operations & Facilities Director',
    email: 'sarah.p@acmecorp.internal',
    department: 'Operations Leadership'
  }
];

export const INITIAL_ISSUES = [
  {
    id: 'CP-1042',
    title: 'Water cooler leaking & low pressure',
    description: 'Continuous leak on the right dispenser tap, pooling onto floor near the main stairs. Water pressure is extremely low.',
    category: 'water',
    location: {
      zone: 'Block B',
      area: '2nd Floor Pantry',
      fullText: 'Block B, 2nd Floor Pantry'
    },
    urgency: 'medium', // 'low' | 'medium' | 'high'
    status: 'in_progress', // 'reported' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'reopened'
    reportedBy: {
      id: 'user-vk',
      name: 'Viraj K.',
      initials: 'VK',
      isAnonymous: false
    },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    affectedCount: 14,
    confirmedUserIds: ['user-vk', 'user-2', 'user-3', 'user-4'],
    assignedTo: {
      id: 'user-alex',
      name: 'Alex Martinez',
      role: 'Plumbing & Facilities Specialist'
    },
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    history: [
      {
        id: 'h1',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        status: 'reported',
        actor: 'Viraj K.',
        note: 'Issue submitted with photo of puddle.'
      },
      {
        id: 'h2',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'assigned',
        actor: 'Sarah Patel',
        note: 'Dispatched to Campus Operations Plumbing Team.'
      },
      {
        id: 'h3',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        status: 'in_progress',
        actor: 'Alex Martinez',
        note: 'Main shutoff valve inspected. Replacement ceramic gasket being installed.'
      }
    ]
  },
  {
    id: 'CP-1041',
    title: 'Wi-Fi connectivity drop in Lab 3 / Conference Room',
    description: 'High packet loss and random SSID disconnection affecting all attendees in video conferences and testing benches.',
    category: 'wifi',
    location: {
      zone: 'West Wing',
      area: 'Room 302',
      fullText: 'West Wing, Room 302'
    },
    urgency: 'high',
    status: 'under_review',
    reportedBy: {
      id: 'user-elena',
      name: 'Elena Rostova',
      initials: 'ER',
      isAnonymous: false
    },
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    affectedCount: 23,
    confirmedUserIds: ['user-vk', 'user-5', 'user-6'],
    history: [
      {
        id: 'h4',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'reported',
        actor: 'Elena Rostova',
        note: 'Reported during all-hands team sync.'
      },
      {
        id: 'h5',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'under_review',
        actor: 'IT Network NOC',
        note: 'Triaged by Network Operations. AP-West-302 showing channel 36 congestion.'
      }
    ]
  },
  {
    id: 'CP-1039',
    title: 'AC cooling unit making rattling noise',
    description: 'Overhead ceiling HVAC vent vibrates loudly when compressor engages, making work calls difficult.',
    category: 'facilities',
    location: {
      zone: 'Floor 4',
      area: 'Open Workspace',
      fullText: 'Floor 4, Open Workspace'
    },
    urgency: 'low',
    status: 'reported',
    reportedBy: {
      id: 'user-marcus',
      name: 'Marcus Chen',
      initials: 'MC',
      isAnonymous: true
    },
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    affectedCount: 6,
    confirmedUserIds: ['user-7', 'user-8'],
    history: [
      {
        id: 'h6',
        timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        status: 'reported',
        actor: 'Anonymous Member',
        note: 'Logged under routine facilities maintenance.'
      }
    ]
  },
  {
    id: 'CP-1035',
    title: 'Printer paper jam & toner replacement',
    description: 'Black toner faded with error code E-04; multiple jams in manual feed tray C.',
    category: 'equipment',
    location: {
      zone: 'East Wing',
      area: 'Print Station C',
      fullText: 'Print Station C'
    },
    urgency: 'medium',
    status: 'resolved',
    reportedBy: {
      id: 'user-priya',
      name: 'Priya Sharma',
      initials: 'PS',
      isAnonymous: false
    },
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    affectedCount: 8,
    confirmedUserIds: ['user-9', 'user-10'],
    assignedTo: {
      id: 'user-alex',
      name: 'Alex Martinez',
      role: 'IT & Hardware Support'
    },
    resolutionEvidence: {
      resolvedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      resolvedBy: 'Alex Martinez',
      note: 'Replaced high-capacity black toner cartridge (TN-450) and cleaned roller sensor assembly. Test diagnostic prints run smoothly.',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
      verifiedCount: 5,
      reopenCount: 0
    },
    history: [
      {
        id: 'h7',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        status: 'reported',
        actor: 'Priya Sharma',
        note: 'Ticket created.'
      },
      {
        id: 'h8',
        timestamp: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
        status: 'in_progress',
        actor: 'Alex Martinez',
        note: 'New toner procured from supply closet.'
      },
      {
        id: 'h9',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        status: 'resolved',
        actor: 'Alex Martinez',
        note: 'Verified print queue test.'
      }
    ]
  },
  {
    id: 'CP-1043',
    title: 'Cafeteria food counter sanitizer dispenser empty',
    description: 'Hand hygiene dispenser at entrance to dining hall has been empty since lunch hour.',
    category: 'cleanliness',
    location: {
      zone: 'Dining Commons',
      area: 'Central Dining Hall, Ground Floor',
      fullText: 'Central Dining Hall, Ground Floor'
    },
    urgency: 'medium',
    status: 'assigned',
    reportedBy: {
      id: 'user-vk',
      name: 'Viraj K.',
      initials: 'VK',
      isAnonymous: false
    },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    affectedCount: 19,
    confirmedUserIds: ['user-vk', 'user-11', 'user-12', 'user-13'],
    assignedTo: {
      id: 'user-alex',
      name: 'Alex Martinez',
      role: 'Janitorial & Sanitation Lead'
    },
    history: [
      {
        id: 'h10',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'reported',
        actor: 'Viraj K.',
        note: 'Reported during afternoon coffee break.'
      },
      {
        id: 'h11',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        status: 'assigned',
        actor: 'Sarah Patel',
        note: 'Assigned to Janitorial inventory reload queue.'
      }
    ]
  },
  {
    id: 'CP-1038',
    title: 'North Parking Garage Gate 2 RFID scanner failing',
    description: 'RFID reader requires 3-4 badge scans before arm gate lifts, causing vehicle backups during morning peak hours.',
    category: 'parking',
    location: {
      zone: 'Parking Lot',
      area: 'North Parking Garage, Gate 2',
      fullText: 'North Parking Garage, Gate 2'
    },
    urgency: 'high',
    status: 'in_progress',
    reportedBy: {
      id: 'user-david',
      name: 'David Wilson',
      initials: 'DW',
      isAnonymous: false
    },
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    affectedCount: 31,
    confirmedUserIds: ['user-14', 'user-15', 'user-16', 'user-17'],
    assignedTo: {
      id: 'user-alex',
      name: 'Alex Martinez',
      role: 'Access Control Systems'
    },
    history: [
      {
        id: 'h12',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        status: 'reported',
        actor: 'David Wilson',
        note: 'Reported after delay entering garage.'
      },
      {
        id: 'h13',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'in_progress',
        actor: 'Alex Martinez',
        note: 'Firmware reset performed; optical sensor align underway.'
      }
    ]
  }
];
