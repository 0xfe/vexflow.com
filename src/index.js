import './playground/editor.js';
import { renderScore, scores } from './scores.js';

const carousel = document.querySelector('.score-carousel');
const stage = carousel.querySelector('.score-stage');
const caption = carousel.querySelector('.score-caption');
const title = caption.querySelector('.score-title');
const credit = caption.querySelector('.score-credit');
const count = carousel.querySelector('.score-count');
const demo = caption.querySelector('.score-demo');
const pdf = caption.querySelector('.score-pdf');
const loading = carousel.querySelector('.score-loading');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const slides = scores.map((score, index) => {
  const slide = document.createElement('div');
  slide.id = 'score-' + index;
  slide.className = 'score-sheet';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-label', score.title + ' · ' + score.credit);
  slide.hidden = true;
  slide.inert = true;
  slide.setAttribute('aria-hidden', 'true');
  stage.append(slide);
  return { sheet: slide, ready: false };
});

// SVG text metrics need a laid-out sheet even when it is being prepared off screen.
function prepare(index) {
  const entry = slides[index];
  const sheet = entry.sheet;
  sheet.hidden = false;
  sheet.style.visibility = 'hidden';
  try {
    entry.player = renderScore(scores[index], sheet);
  } catch (error) {
    console.error('Unable to render ' + scores[index].title, error);
    sheet.textContent = 'This score could not be loaded.';
  } finally {
    sheet.hidden = true;
    sheet.style.removeProperty('visibility');
    entry.ready = true;
  }
}

let current;
let requested = 0;
let direction = 0;
function showScore(index, direction = 0) {
  const previous = slides[current]?.sheet;
  const slide = slides[index].sheet;
  const score = scores[index];
  // Finish any partial transition before handling another quick key press.
  for (const { sheet } of slides) {
    for (const animation of sheet.getAnimations()) animation.cancel();
    sheet.hidden = sheet !== slide;
    sheet.inert = sheet !== slide;
    sheet.setAttribute('aria-hidden', String(sheet !== slide));
  }
  current = index;
  title.textContent = score.title;
  credit.textContent = score.credit;
  demo.href = score.demo;
  pdf.hidden = !score.pdf;
  if (score.pdf) {
    pdf.href = score.pdf;
    pdf.textContent = score.pdfLabel ?? 'Score (PDF)';
  } else pdf.removeAttribute('href');
  count.textContent = (index + 1) + ' / ' + scores.length;

  if (!previous || previous === slide || !direction || reducedMotion.matches) return;
  const options = { duration: 380, easing: 'cubic-bezier(.25,.75,.25,1)' };
  const offset = (step) => ({ transform: 'translateX(' + step * 100 + '%)' });
  previous.hidden = false;
  const exit = previous.animate([offset(0), offset(-direction)], options);
  exit.onfinish = () => { if (slides[current].sheet !== previous) previous.hidden = true; };
  slide.animate([offset(direction), offset(0)], options);
}

function step(delta) {
  slides[current]?.player?.stop();
  requested = (requested + delta + scores.length) % scores.length;
  direction = delta;
  if (slides[requested].ready) showScore(requested, delta);
}

// Prepare one score per idle turn. A navigation request goes to the front of the queue.
function preload() {
  // Give an active transition the main thread unless the reader asks for a new sheet.
  if (requested !== current || !slides[current].sheet.getAnimations().length) {
    const index = slides[requested].ready ? slides.findIndex(slide => !slide.ready) : requested;
    prepare(index);
    if (requested === index) showScore(index, direction);
    if (slides.every(slide => slide.ready)) {
      loading.hidden = true;
      return;
    }
  }
  if (window.requestIdleCallback) window.requestIdleCallback(preload, { timeout: 180 });
  else setTimeout(preload, 32);
}

document.fonts.ready.then(() => {
  // Let the header paint before the first engraving starts.
  requestAnimationFrame(() => setTimeout(preload, 0));
  carousel.querySelector('.score-controls').hidden = false;
  carousel.querySelector('#score-previous').addEventListener('click', () => step(-1));
  carousel.querySelector('#score-next').addEventListener('click', () => step(1));
  carousel.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });
});
