/**
 * config.js
 * Central configuration for Paws & Preferences.
 * Changing values here affects the whole app — no magic numbers scattered
 * throughout the codebase.
 */

const CONFIG = Object.freeze({
  /** Number of cat cards per session (API recommends 10–20) */
  TOTAL_CATS: 15,

  /**
   * Minimum horizontal drag distance (px) to register a swipe.
   * Below this the card snaps back to centre.
   */
  SWIPE_THRESHOLD: 85,

  /**
   * Cat image source.
   * https://cataas.com/cat returns a random cat image on every request.
   * We append ?v=<unique> so the browser treats each card as a separate
   * network request and does not serve the same cached image for all cards.
   */
  CATAAS_BASE_URL: 'https://cataas.com/cat',

  /** Fallback tag labels shown in the card footer */
  CAT_TAGS: [
    'tabby', 'kitten', 'fluffy', 'ginger', 'black',
    'white',  'orange', 'cute',   'sleepy', 'playful',
    'grumpy', 'tiny',   'chonk',  'void',   'calico',
  ],

  /** How long (ms) to wait for each image before giving up */
  IMAGE_TIMEOUT_MS: 8000,
});
