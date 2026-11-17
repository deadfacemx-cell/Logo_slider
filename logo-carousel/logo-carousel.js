(() => {
  const defaultSpeed = 18;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  for (const carousel of document.querySelectorAll("[data-logo-carousel]")) {
    const viewport = carousel.querySelector(".logo-carousel__viewport");
    const track = carousel.querySelector(".logo-carousel__track");
    const logos = track.firstElementChild;
    const controls = carousel.querySelector(".logo-carousel__controls");
    const speedControl = carousel.querySelector("[data-speed-control]");
    const speedValue = carousel.querySelector("[data-speed-value]");
    const motionToggle = carousel.querySelector("[data-motion-toggle]");

    if (!track.animate || !window.ResizeObserver) continue;

    const configuredSpeed = Number(carousel.dataset.speed);
    speedControl.value = configuredSpeed > 0 && Number.isFinite(configuredSpeed)
      ? configuredSpeed
      : defaultSpeed;

    let animation;
    let distance = 0;
    let paused = false;

    function updateSpeed() {
      const speed = speedControl.valueAsNumber;
      speedValue.textContent = `${speed} px/s`;
      speedControl.setAttribute("aria-valuetext", `${speed} píxeles por segundo`);
      animation?.updatePlaybackRate(speed / defaultSpeed);
    }

    function updateLayout() {
      const canAnimate = !reducedMotion.matches && viewport.clientWidth > 0;
      carousel.toggleAttribute("data-animated", canAnimate);
      const groupWidth = canAnimate
        ? Number.parseFloat(window.getComputedStyle(logos).width)
        : 0;

      if (!groupWidth) {
        carousel.removeAttribute("data-animated");
        controls.hidden = true;
        animation?.cancel();
        animation = undefined;
        while (track.lastElementChild !== logos) {
          track.lastElementChild.remove();
        }
        return;
      }

      controls.hidden = false;
      const groupCount = 1 + Math.ceil(viewport.clientWidth / groupWidth);

      while (track.childElementCount < groupCount) {
        const copy = logos.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.append(copy);
      }
      while (track.childElementCount > groupCount) {
        track.lastElementChild.remove();
      }

      if (animation && groupWidth === distance) return;

      // Conserva el punto del recorrido al redimensionar el carrusel.
      const progress = animation?.effect.getComputedTiming().progress ?? 0;
      animation?.cancel();
      distance = groupWidth;
      const duration = 1000 * distance / defaultSpeed;

      animation = track.animate(
        [
          { transform: "translateX(0)" },
          { transform: `translateX(-${distance}px)` },
        ],
        { duration, easing: "linear", iterations: Infinity },
      );

      animation.currentTime = progress * duration;
      updateSpeed();

      if (paused) animation.pause();
    }

    motionToggle.addEventListener("click", () => {
      if (!animation) return;

      paused = !paused;
      motionToggle.dataset.paused = String(paused);
      motionToggle.textContent = paused ? "Reanudar" : "Pausar";

      if (paused) {
        animation.pause();
      } else {
        animation.play();
      }
    });

    speedControl.addEventListener("input", updateSpeed);
    reducedMotion.addEventListener("change", updateLayout);

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(viewport);
    resizeObserver.observe(logos);
    updateLayout();
  }
})();
