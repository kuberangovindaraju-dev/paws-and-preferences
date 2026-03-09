// ─── App Configuration ───────────────────────────────────────────────────────

export const CONFIG = {
  // How many cats to load
  TOTAL_CATS: 15,

  // Cataas base URL
  CATAAS_BASE: 'https://cataas.com',

  // Swipe threshold (px) to register a decision
  SWIPE_THRESHOLD: 80,

  // Rotation max degrees during drag
  MAX_ROTATION: 18,

  // How many cards to render in the visible stack
  STACK_SIZE: 3,

  // Card tilt offsets for stack effect
  STACK_OFFSETS: [
    { y: 0,  scale: 1,    rotate: 0,   zIndex: 10 },
    { y: 10, scale: 0.96, rotate: 2,   zIndex: 9  },
    { y: 18, scale: 0.92, rotate: -1,  zIndex: 8  },
  ],
};

// Cat tags to cycle through for variety
export const CAT_TAGS = [
  'cute', 'funny', 'orange', 'black', 'fluffy',
  'kitten', 'tabby', 'white', 'grey', 'sleeping',
  'playing', 'grumpy', 'tiny', 'big', 'striped',
];
