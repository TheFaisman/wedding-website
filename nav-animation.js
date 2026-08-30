export function initNavAnimation() {

    const crest = document.querySelector('.crest');
    const stickyNav = document.querySelector('.sticky-nav');
    const mainContent = document.querySelector('.content');
  
    // The distance in pixels over which the animation completes.
    // Increase this number to make the shrinking happen over a longer scroll distance.
    const maxScroll = 500; 
  
    // A flag to ensure we don't overwhelm the browser with scroll events
    let ticking = false;

    function updateAnimation() {
        // Calculate progress between 0 and 1
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / maxScroll, 1);

        // --- Crest Calculations ---
        // Width shrinks from 350px to 60px (Difference: 290px)
        const currentWidth = 350 - (progress * 300);
        // Y-Axis moves from initial to -35px (center of banner)
        const currentY = 75 - (progress * 110);

        // Apply the exact frame-by-frame styles
        crest.style.width = `${currentWidth}px`;
        crest.style.transform = `translate(-50%, ${currentY}px)`;

        mainContent.style.opacity = progress; 
    
        // Reset the flag so the next frame can run
        ticking = false;
    }

    // The optimized scroll listener
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateAnimation);
            ticking = true;
        }
    });


}
