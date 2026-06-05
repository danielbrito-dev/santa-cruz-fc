'use client';

import { useEffect } from 'react';

/**
 * FooterParallax — sets body padding-bottom = footer height on ≥901px viewports
 * so that the fixed footer is revealed as the user scrolls.
 * Resets to 0 on ≤900px (mobile: footer is position:static, no spacer needed).
 * Cleans up listeners and resets padding on unmount.
 */
export function FooterParallax() {
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');

    function setFooterSpacer() {
      const footer = document.querySelector<HTMLElement>('.site-footer');
      if (!footer) return;
      if (!mq.matches) {
        document.body.style.paddingBottom = '0';
        return;
      }
      document.body.style.paddingBottom = footer.offsetHeight + 'px';
    }

    setFooterSpacer();
    window.addEventListener('resize', setFooterSpacer);
    window.addEventListener('load', setFooterSpacer);
    mq.addEventListener('change', setFooterSpacer);

    return () => {
      window.removeEventListener('resize', setFooterSpacer);
      window.removeEventListener('load', setFooterSpacer);
      mq.removeEventListener('change', setFooterSpacer);
      document.body.style.paddingBottom = '0';
    };
  }, []);

  return null;
}
