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
const playback = window.VexTabAudio.scoreOptions(carousel).playback;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const slides = scores.map((score, index) => {
  const slide = document.createElement('div');
  slide.id = 'score-' + index;
  slide.className = 'score-sheet';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-label', score.title + ' · ' + score.credit);
  slide.hidden = true;
  stage.append(slide);
  return { sheet: slide };
});

let current = 0;
function showScore(index, direction = 0) {
  slides[current].player?.stop();
  const previous = slides[current].sheet;
  const entry = slides[index];
  const slide = entry.sheet;
  const score = scores[index];
  // Finish any partial transition before handling another quick key press.
  for (const { sheet } of slides) {
    for (const animation of sheet.getAnimations()) animation.cancel();
    sheet.hidden = sheet !== slide;
    sheet.inert = sheet !== slide;
    sheet.setAttribute('aria-hidden', String(sheet !== slide));
  }
  if (!slide.hasChildNodes()) {
    try {
      entry.player = renderScore(score, slide, playback);
    } catch (error) {
      console.error('Unable to render ' + score.title, error);
      slide.textContent = 'This score could not be loaded.';
    }
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

  if (!direction || reducedMotion.matches) return;
  const options = { duration: 380, easing: 'cubic-bezier(.25,.75,.25,1)' };
  const offset = (step) => ({ transform: 'translateX(' + step * 100 + '%)' });
  previous.hidden = false;
  const exit = previous.animate([offset(0), offset(-direction)], options);
  exit.onfinish = () => { if (slides[current].sheet !== previous) previous.hidden = true; };
  slide.animate([offset(direction), offset(0)], options);
}

function step(direction) {
  showScore((current + direction + scores.length) % scores.length, direction);
}

document.fonts.ready.then(() => {
  showScore(0);
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
