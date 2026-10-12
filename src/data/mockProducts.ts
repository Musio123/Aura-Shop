import { Product } from '../types/store';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-nordic-kettle',
    name: 'Nordic Precision Gooseneck Kettle',
    subtitle: 'Variable temperature control with matte finish',
    description: 'Engineered for pour-over connoisseurs. Features ultra-precise 1-degree temperature regulation, balanced counterweight walnut handle, and a leak-free precision spout for an even extraction bloom.',
    price: 135,
    originalPrice: 160,
    category: 'Coffee & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 142,
    stock: 18,
    featured: true,
    tags: ['Artisanal', 'Bestseller', 'Kitchen'],
    specs: {
      'Capacity': '0.9 Liters',
      'Material': '304 Stainless Steel & Walnut',
      'Power': '1200W Fast Heat',
      'Warranty': '2 Years'
    }
  },
  {
    id: 'prod-acoustic-speaker',
    name: 'Walnut Acoustic Hi-Fi Speaker',
    subtitle: 'Handcrafted solid timber enclosure with custom drivers',
    description: 'Immerse your living space in rich, natural warmth. Dual custom Kevlar drivers and tuned bass reflex port deliver studio fidelity wrapped in sustainably sourced American black walnut.',
    price: 280,
    originalPrice: 320,
    category: 'Audio & Tech',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewCount: 96,
    stock: 9,
    featured: true,
    tags: ['Hi-Fi', 'Audio', 'Limited'],
    specs: {
      'Frequency Response': '42Hz - 22kHz',
      'Connectivity': 'Bluetooth 5.3 & 3.5mm Aux',
      'Battery Life': '18 Hours playback',
      'Weight': '2.4 kg'
    }
  },
  {
    id: 'prod-desk-lamp',
    name: 'Lumio Architectural Task Lamp',
    subtitle: 'Linear dimmable brass & matte black arm',
    description: 'Sculptural lighting designed for focus. Features warm 2700K-4000K touch-sensitive dimming with a 360-degree swivel arm counterbalanced with machined brass weights.',
    price: 185,
    originalPrice: 210,
    category: 'Desk & Work',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.7,
    reviewCount: 68,
    stock: 14,
    featured: false,
    tags: ['Minimalist', 'Workplace', 'Brass'],
    specs: {
      'CRI Rating': '95+ True Color',
      'Brightness': '800 Lumens',
      'Base': 'Heavyweight Cast Steel',
      'Cord': 'Braided Cotton 2m'
    }
  },
  {
    id: 'prod-linen-throw',
    name: 'Washed Belgian Linen Throw',
    subtitle: 'Woven from European flax with raw fringe edge',
    description: 'Pure, breathable comfort for every season. Stonewashed for immediate cloud-soft drape that softens with every wash, bringing effortless tactile warmth to any room.',
    price: 95,
    category: 'Living & Decor',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 114,
    stock: 22,
    featured: false,
    tags: ['Cozy', 'Sustainable', 'Linen'],
    specs: {
      'Dimensions': '140 cm × 200 cm',
      'Fabric': '100% Belgian Certified Flax',
      'Care': 'Machine wash cold, tumble dry low'
    }
  },
  {
    id: 'prod-split-keyboard',
    name: 'Corne Ergonomic Split Keyboard',
    subtitle: 'Gateron Oil King linear switches & anodized aluminum',
    description: 'Engineered for developers and power typists. Features hot-swappable sockets, OLED layer indicator screens, per-key RGB backlighting, and customized low-profile ortholinear layout.',
    price: 245,
    originalPrice: 275,
    category: 'Desk & Work',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 5.0,
    reviewCount: 53,
    stock: 6,
    featured: true,
    tags: ['Ergonomics', 'Custom', 'Developer'],
    specs: {
      'Layout': '42-Key Ortholinear Split',
      'Firmware': 'QMK / VIA Programmable',
      'Cable': 'Coiled TRRS & Aviator USB-C'
    }
  },
  {
    id: 'prod-ceramic-mug-set',
    name: 'Artisan Speckled Ceramic Set (Pair)',
    subtitle: 'Wheel-thrown stoneware with reactive matte glaze',
    description: 'Each mug is individually thrown by master ceramicists in small batches. The tactile stoneware body retains heat while fitting ergonomically into cupped hands.',
    price: 48,
    category: 'Coffee & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewCount: 88,
    stock: 30,
    featured: false,
    tags: ['Handcrafted', 'Ceramics'],
    specs: {
      'Volume': '320 ml per mug',
      'Dishwasher Safe': 'Yes',
      'Microwave Safe': 'Yes'
    }
  },
  {
    id: 'prod-ambient-clock',
    name: 'Chronos Minimalist Desk Clock',
    subtitle: 'Silent quartz movement set in milled brass and basalt',
    description: 'A serene timepiece that rejects digital distraction. Completely silent sweep second hand allows uninterrupted flow state while anchoring your workspace.',
    price: 78,
    originalPrice: 90,
    category: 'Desk & Work',
    imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.7,
    reviewCount: 39,
    stock: 12,
    featured: false,
    tags: ['Minimalist', 'Timeless'],
    specs: {
      'Movement': 'Japanese Silent Sweep Quartz',
      'Power': '1x AA Battery (included)',
      'Diameter': '12 cm'
    }
  },
  {
    id: 'prod-botanical-candle',
    name: 'Hinoki & Cedarwood Botanical Candle',
    subtitle: 'Hand-poured 100% natural soy wax with wooden wick',
    description: 'Evoke the tranquility of Kyoto forest shrines. Scented with wild harvested hinoki cypress, smoky cedar, and crisp green pine needles. Features a soft crackling wooden wick.',
    price: 36,
    category: 'Living & Decor',
    imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewCount: 167,
    stock: 45,
    featured: true,
    tags: ['Aromatherapy', 'Natural', 'Soy'],
    specs: {
      'Burn Time': '65+ Hours',
      'Weight': '280g / 10 oz',
      'Vessel': 'Matte Amber Glass'
    }
  }
];
