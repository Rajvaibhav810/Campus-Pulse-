import React from 'react';
import { 
  Droplets, Wifi, Sparkles, Building2, Utensils, 
  Bus, SquareParking, ShieldAlert, Wrench, Hammer, MoreHorizontal 
} from 'lucide-react';

const CATEGORY_MAP = {
  water: { name: 'Water', icon: Droplets },
  wifi: { name: 'Wi-Fi / Network', icon: Wifi },
  cleanliness: { name: 'Cleanliness', icon: Sparkles },
  facilities: { name: 'Facilities', icon: Building2 },
  food: { name: 'Food / Cafeteria', icon: Utensils },
  transport: { name: 'Transport', icon: Bus },
  parking: { name: 'Parking', icon: SquareParking },
  safety: { name: 'Safety', icon: ShieldAlert },
  equipment: { name: 'Equipment', icon: Wrench },
  infrastructure: { name: 'Infrastructure', icon: Hammer },
  other: { name: 'Other', icon: MoreHorizontal }
};

export function CategoryPill({ categoryId }) {
  const cat = CATEGORY_MAP[categoryId] || { name: categoryId || 'General', icon: MoreHorizontal };
  const Icon = cat.icon;

  return (
    <span className="category-tag">
      <span>{cat.name}</span>
    </span>
  );
}

export { CATEGORY_MAP };
