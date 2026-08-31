export function initCardAnimation() {
  const radioInputs = document.querySelectorAll('input[name="lang"]');
  const englishCard = document.querySelector('img[alt="English invite card"]');
  const arabicCard = document.querySelector('img[alt="Arabic invite card"]');

  // The lines adding classes and removing display:none have been deleted.
  // The initial state is now safely handled by the HTML.

  // Listen for language toggle changes
  radioInputs.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.value === 'ar') {
        englishCard.classList.add('flipped');
        arabicCard.classList.add('flipped');
      } else {
        englishCard.classList.remove('flipped');
        arabicCard.classList.remove('flipped');
      }
    });
  });
}
