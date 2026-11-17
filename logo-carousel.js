(() => {
  const defaultSpeed = 18; // Velocidad fija en píxeles por segundo
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  for (const carousel of document.querySelectorAll("[data-logo-carousel]")) {
    const viewport = carousel.querySelector(".logo-carousel__viewport");
    const track = carousel.querySelector(".logo-carousel__track");
    const logos = track.firstElementChild;

    if (!track.animate || !window.ResizeObserver) continue;

    let animation;
    let distance = 0;

    function updateLayout() {
      const canAnimate = !reducedMotion.matches && viewport.clientWidth > 0;
      carousel.toggleAttribute("data-animated", canAnimate);
      const groupWidth = canAnimate
        ? Number.parseFloat(window.getComputedStyle(logos).width)
        : 0;

      if (!groupWidth) {
        carousel.removeAttribute("data-animated");
        animation?.cancel();
        animation = undefined;
        while (track.lastElementChild !== logos) {
          track.lastElementChild.remove();
        }
        return;
      }

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
    }

    reducedMotion.addEventListener("change", updateLayout);

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(viewport);
    resizeObserver.observe(logos);
    updateLayout();
  }
})();
