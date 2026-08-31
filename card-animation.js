export function initCardAnimation() {
  const radioInputs = document.querySelectorAll('input[name="lang"]');
  const englishCard = document.querySelector('img[alt="English invite card"]');
  const arabicCard = document.querySelector('img[alt="Arabic invite card"]');

  // Remove the hardcoded inline style so CSS can manage the visibility
  arabicCard.style.display = '';
  
  // Assign initial CSS classes for the front (English) and back (Arabic)
  englishCard.classList.add('card-front');
  arabicCard.classList.add('card-back');

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
