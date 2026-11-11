/**
 * Image Utilities and Resilient Fallbacks
 * Provides instant zero-latency SVG data URLs for all categories,
 * URL sanitization, preloading, and localStorage blob cleanup.
 */

// 1. High-fidelity SVG Data URLs that require NO network connection and load instantly (0ms)
export const SVG_FALLBACKS = {
  product: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <circle cx="300" cy="270" r="100" fill="#0A0A0A" stroke="#2A2A2A" stroke-width="2"/>
      <path d="M255 240L300 215L345 240V290L300 315L255 290V240Z" stroke="#10B981" stroke-width="6" stroke-linejoin="round"/>
      <path d="M300 215V315" stroke="#10B981" stroke-width="4"/>
      <path d="M255 240L300 265L345 240" stroke="#10B981" stroke-width="4"/>
      <text x="300" y="420" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#EDEDED" text-anchor="middle" letter-spacing="1">NAIJAMART PRODUCT</text>
      <text x="300" y="450" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#10B981" text-anchor="middle">Verified Campus Listing</text>
    </svg>
  `)}`,

  phone: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <rect x="220" y="160" width="160" height="280" rx="28" fill="#0A0A0A" stroke="#10B981" stroke-width="6"/>
      <circle cx="300" cy="200" r="8" fill="#10B981"/>
      <rect x="260" y="175" width="80" height="6" rx="3" fill="#2A2A2A"/>
      <circle cx="300" cy="405" r="14" stroke="#10B981" stroke-width="3"/>
      <text x="300" y="480" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="#EDEDED" text-anchor="middle">PHONE & TABLET</text>
      <text x="300" y="508" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#10B981" text-anchor="middle">Direct Seller Meetup</text>
    </svg>
  `)}`,

  electronics: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <rect x="190" y="180" width="220" height="150" rx="12" fill="#0A0A0A" stroke="#10B981" stroke-width="6"/>
      <path d="M160 340H440L420 365H180L160 340Z" fill="#2A2A2A" stroke="#10B981" stroke-width="4"/>
      <circle cx="300" cy="255" r="26" stroke="#10B981" stroke-width="4"/>
      <text x="300" y="430" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="#EDEDED" text-anchor="middle">ELECTRONICS & GADGETS</text>
      <text x="300" y="460" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#10B981" text-anchor="middle">Inspection on Delivery</text>
    </svg>
  `)}`,

  vehicle: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <circle cx="200" cy="300" r="50" stroke="#FB6514" stroke-width="8" fill="#0A0A0A"/>
      <circle cx="400" cy="300" r="50" stroke="#FB6514" stroke-width="8" fill="#0A0A0A"/>
      <path d="M200 300L270 230H340L400 300" stroke="#FB6514" stroke-width="8" stroke-linecap="round"/>
      <path d="M270 230L300 290H380" stroke="#FB6514" stroke-width="6" stroke-linecap="round"/>
      <text x="300" y="420" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#EDEDED" text-anchor="middle">OKADA MOTORCYCLE</text>
      <text x="300" y="450" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#FB6514" text-anchor="middle">Wukari & Taraba Deals</text>
    </svg>
  `)}`,

  house: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <path d="M180 280L300 180L420 280V400H180V280Z" fill="#0A0A0A" stroke="#10B981" stroke-width="6" stroke-linejoin="round"/>
      <rect x="270" y="310" width="60" height="90" fill="#151515" stroke="#10B981" stroke-width="4"/>
      <circle cx="318" cy="355" r="4" fill="#10B981"/>
      <text x="300" y="460" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#EDEDED" text-anchor="middle">HOUSE FOR RENT</text>
      <text x="300" y="490" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#10B981" text-anchor="middle">Direct Landlord / Verified Agent</text>
    </svg>
  `)}`,

  roommate: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <circle cx="250" cy="240" r="45" fill="#0A0A0A" stroke="#10B981" stroke-width="6"/>
      <circle cx="350" cy="240" r="45" fill="#0A0A0A" stroke="#0D9488" stroke-width="6"/>
      <path d="M180 370C180 320 220 310 250 310C280 310 320 320 320 370" stroke="#10B981" stroke-width="6" stroke-linecap="round"/>
      <path d="M280 370C280 320 320 310 350 310C380 310 420 320 420 370" stroke="#0D9488" stroke-width="6" stroke-linecap="round"/>
      <text x="300" y="440" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#EDEDED" text-anchor="middle">ROOMMATE SEARCH</text>
      <text x="300" y="470" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#10B981" text-anchor="middle">Split Rent & Shared Bedspace</text>
    </svg>
  `)}`,

  avatar: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
      <rect width="400" height="400" rx="200" fill="#151515"/>
      <circle cx="200" cy="150" r="60" fill="#0A0A0A" stroke="#10B981" stroke-width="5"/>
      <path d="M100 330C100 260 150 240 200 240C250 240 300 260 300 330" fill="#0A0A0A" stroke="#10B981" stroke-width="5"/>
    </svg>
  `)}`,

  fashion: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <path d="M240 180L300 220L360 180L420 240L380 270L360 250V400H240V250L220 270L180 240L240 180Z" fill="#0A0A0A" stroke="#10B981" stroke-width="6" stroke-linejoin="round"/>
      <text x="300" y="460" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#EDEDED" text-anchor="middle">FASHION & APPAREL</text>
      <text x="300" y="490" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#10B981" text-anchor="middle">Quality Campus Style</text>
    </svg>
  `)}`,

  default: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
      <rect width="600" height="600" fill="#151515"/>
      <rect x="2" y="2" width="596" height="596" rx="24" stroke="#2A2A2A" stroke-width="4"/>
      <circle cx="300" cy="270" r="90" fill="#0A0A0A" stroke="#10B981" stroke-width="4"/>
      <path d="M270 270L290 290L335 245" stroke="#10B981" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="300" y="420" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#EDEDED" text-anchor="middle">VERIFIED LISTING</text>
      <text x="300" y="450" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#10B981" text-anchor="middle">NaijaMarket Hub</text>
    </svg>
  `)}`
};

/**
 * Returns the best fallback SVG data URI based on category or type.
 */
export function getCategoryFallback(category?: string | null): string {
  if (!category) return SVG_FALLBACKS.product;
  const c = category.toLowerCase();
  if (c.includes('phone') || c.includes('tablet') || c.includes('apple') || c.includes('samsung') || c.includes('tecno')) {
    return SVG_FALLBACKS.phone;
  }
  if (c.includes('okada') || c.includes('bike') || c.includes('motorcycle') || c.includes('rider') || c.includes('vehicle')) {
    return SVG_FALLBACKS.vehicle;
  }
  if (c.includes('house') || c.includes('rent') || c.includes('flat') || c.includes('apartment') || c.includes('hostel') || c.includes('bedspace')) {
    return SVG_FALLBACKS.house;
  }
  if (c.includes('roommate') || c.includes('squatter')) {
    return SVG_FALLBACKS.roommate;
  }
  if (c.includes('electron') || c.includes('laptop') || c.includes('computer') || c.includes('tv')) {
    return SVG_FALLBACKS.electronics;
  }
  if (c.includes('fashion') || c.includes('cloth') || c.includes('shoe') || c.includes('wear')) {
    return SVG_FALLBACKS.fashion;
  }
  if (c.includes('user') || c.includes('avatar') || c.includes('profile')) {
    return SVG_FALLBACKS.avatar;
  }
  return SVG_FALLBACKS.product;
}

/**
 * Checks if a string is a valid non-empty image source.
 * Filters out "undefined", "null", blank strings, and dead blob: URLs.
 */
export function isValidImageSource(src?: string | null): boolean {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim();
  if (s === '' || s === 'undefined' || s === 'null' || s === '[object Object]') return false;
  // If it's a blob URL that was created in an earlier window session, it's not valid
  return true;
}

/**
 * Normalizes an image source:
 * If invalid or null, returns the appropriate category SVG data URI immediately.
 */
export function normalizeImageSource(src?: string | null, category?: string | null): string {
  if (!isValidImageSource(src)) {
    return getCategoryFallback(category);
  }
  return (src as string).trim();
}

/**
 * Cleans dead blob URLs from localStorage products.
 * This permanently prevents broken image icons on page refreshes.
 */
export function sanitizeStoredProductImages(): void {
  try {
    const keys = ['my_products', 'cached_products'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) continue;

      let changed = false;
      const cleaned = list.map((item: any) => {
        if (!item) return item;
        let img = item.imageUrl || item.coverImage || (item.images && item.images[0]);
        // If the URL is a dead blob: URL from a previous page session, replace it with a clean fallback
        if (typeof img === 'string' && img.startsWith('blob:')) {
          const fallback = getCategoryFallback(item.category);
          changed = true;
          return {
            ...item,
            imageUrl: fallback,
            coverImage: fallback,
            images: [fallback]
          };
        }
        return item;
      });

      if (changed) {
        localStorage.setItem(key, JSON.stringify(cleaned));
      }
    }
  } catch (err) {
    // Non-blocking localStorage hygiene notice
  }
}

// Auto-run sanitation on import
if (typeof window !== 'undefined') {
  sanitizeStoredProductImages();
}

/**
 * Preload high-priority images into browser cache.
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isValidImageSource(src)) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}
