    const crest = document.querySelector('.crest');
    const stickyNav = document.querySelector('.sticky-nav');
  
    // The distance in pixels over which the animation completes.
    // Increase this number to make the shrinking happen over a longer scroll distance.
    const maxScroll = 350; 
  
    // A flag to ensure we don't overwhelm the browser with scroll events
    let ticking = false;

    function updateAnimation() {
        // Calculate progress between 0 and 1
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / maxScroll, 1);

        // --- Crest Calculations ---
        // Width shrinks from 350px to 60px (Difference: 290px)
        const currentWidth = 350 - (progress * 290);
        // Y-Axis moves from 30px up to -30px to center it (Difference: 60px)
        const currentY = 30 - (progress * 60);

        // --- Nav Bar Calculations ---
        // Width expands from 90% to 100% (Difference: 10%)
        const currentNavWidth = 90 + (progress * 10);
        // Border Radius sharpens from 20px to 0px (Difference: 20px)
        const currentRadius = 20 - (progress * 20);

        // Apply the exact frame-by-frame styles
        crest.style.width = `${currentWidth}px`;
        crest.style.transform = `translate(-50%, ${currentY}px)`;
    
        //stickyNav.style.width = `${currentNavWidth}%`;
        //stickyNav.style.borderRadius = `${currentRadius}px`;

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


