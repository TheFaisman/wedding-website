import { initNavAnimation } from './nav-animation.js';
import { initRSVP } from './rsvp-db.js';
import { initCardAnimation } from './card-animation.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavAnimation();
    initRSVP();
    initCardAnimation();
});
