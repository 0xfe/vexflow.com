// Slide between engraved scores. Manual navigation pauses until Play is selected.
import { renderScore, scores } from './scores.js';

const carousel = document.querySelector('.score-carousel');
const stage = carousel.querySelector('.score-stage');
const caption = carousel.querySelector('.score-caption');
const title = caption.querySelector('.score-title');
const credit = caption.querySelector('.score-credit');
const count = carousel.querySelector('.score-count');
const playback = carousel.querySelector('#score-playback');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const slides = scores.map((score, index) => {
  const slide = document.createElement('div');
  slide.id = 'score-' + index;
  slide.className = 'score-sheet';
  slide.setAttribute('role', 'img');
  slide.setAttribute('aria-label', score.title + ' · ' + score.credit);
  slide.hidden = true;
  stage.append(slide);
  return slide;
});

let current = 0;
let playing = !reducedMotion.matches;
let onScreen = false;
let timer;

function showScore(index, direction = 0) {
  const previous = slides[current];
  const slide = slides[index];
  const score = scores[index];
  // Finish any partial transition before handling another quick key press.
  for (const sheet of slides) {
    for (const animation of sheet.getAnimations()) animation.cancel();
    sheet.hidden = sheet !== slide;
    sheet.setAttribute('aria-hidden', String(sheet !== slide));
  }
  if (!slide.hasChildNodes()) {
    try {
      renderScore(score, slide);
    } catch (error) {
      console.error('Unable to render ' + score.title, error);
      slide.textContent = 'This score could not be loaded.';
    }
  }
  current = index;
  title.textContent = score.title;
  credit.textContent = score.credit;
  count.textContent = (index + 1) + ' / ' + scores.length;

  if (!direction || reducedMotion.matches) return;
  const options = { duration: 380, easing: 'cubic-bezier(.25,.75,.25,1)' };
  const offset = (step) => ({ transform: 'translateX(' + step * 100 + '%)' });
  previous.hidden = false;
  const exit = previous.animate([offset(0), offset(-direction)], options);
  exit.onfinish = () => { if (slides[current] !== previous) previous.hidden = true; };
  slide.animate([offset(direction), offset(0)], options);
}

function step(direction) {
  showScore((current + direction + scores.length) % scores.length, direction);
}

function updatePlayback() {
  clearInterval(timer);
  if (playing && onScreen && !document.hidden) timer = setInterval(() => step(1), 3000);
  playback.classList.toggle('is-paused', !playing);
  playback.title = playing ? 'Pause slideshow' : 'Play slideshow';
  playback.setAttribute('aria-label', playback.title);
  caption.setAttribute('aria-live', playing ? 'off' : 'polite');
}

function navigate(direction) {
  playing = false;
  updatePlayback();
  step(direction);
}

document.fonts.ready.then(() => {
  showScore(0);
  carousel.querySelector('.score-controls').hidden = false;
  carousel.querySelector('#score-previous').addEventListener('click', () => navigate(-1));
  carousel.querySelector('#score-next').addEventListener('click', () => navigate(1));
  playback.addEventListener('click', () => {
    playing = !playing;
    updatePlayback();
  });
  carousel.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    navigate(event.key === 'ArrowLeft' ? -1 : 1);
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) playing = false;
    updatePlayback();
  });
  document.addEventListener('visibilitychange', updatePlayback);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    updatePlayback();
  }).observe(carousel.querySelector('.score-header'));
  updatePlayback();
});
