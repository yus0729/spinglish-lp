/* UI interaction events and the existing App Store outbound-click conversion. */
(() => {
  'use strict';
  const page = document.body.dataset.page || 'home';
  const track = (event, properties = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, page, lp_version: 'editorial-20261002', ...properties });
  };
  track('lp_view');

  // An outbound click is a micro-conversion, never a subscription/trial event.
  document.querySelectorAll('a[data-store]').forEach(link => {
    link.addEventListener('click', event => {
      track('app_store_click', {
        placement: link.dataset.store,
        plan: link.dataset.plan || 'not_selected'
      });
      // Retain the live site's outbound-click conversion and 800ms navigation fallback.
      // A store click is not a free-trial start. Modified clicks keep native behavior.
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
      if (typeof window.gtag_report_conversion === 'function') {
        event.preventDefault();
        window.gtag_report_conversion(link.href);
      }
    });
  });
  document.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) track(detail.classList.contains('faq') ? 'faq_open' : 'plan_comparison_open', { item: detail.id });
    });
  });

  const samples = {
    daily: {
      ja: '昨日は家で仕事をしました。',
      answer: 'I worked from home yesterday.',
      explanation: '「昨日」のことなので、work を過去形の worked に。from home は「在宅で働く」ときによく使う表現です。',
      variant: 'I was working from home yesterday.',
      variantLabel: '昨日の状況を説明するなら'
    },
    travel: {
      ja: '搭乗はいつ始まりますか？',
      answer: 'When does boarding start?',
      explanation: 'boarding は「搭乗」。When does ... start? で、予定されている開始時刻を尋ねられます。',
      variant: 'What time does boarding begin?',
      variantLabel: '時刻を尋ねる、別の言い方'
    },
    soccer: {
      ja: '僕、フリーだよ！',
      answer: "I'm open!",
      explanation: 'ピッチ上で、マークがついていないことを味方に伝える短い声かけです。短く言える表現から練習しましょう。',
      variant: 'Over here!',
      variantLabel: '「こっち！」と呼びかけるなら'
    },
    bjj: {
      ja: 'もう一度見せてもらえますか？',
      answer: 'Could you show me that again?',
      explanation: '技の説明をもう一度見たいときの表現。Could you ...? で、相手に丁寧にお願いできます。',
      variant: 'Could you show me that a little more slowly?',
      variantLabel: '少しゆっくり見せてほしいなら'
    }
  };
  const question = document.getElementById('demo-question');
  const reveal = document.getElementById('demo-reveal');
  let selected = 'daily';
  if (question && reveal) {
    const placeholder = document.getElementById('demo-placeholder');
    const result = document.getElementById('demo-feedback');
    document.querySelectorAll('[data-sample]').forEach(button => {
      button.addEventListener('click', () => {
        selected = button.dataset.sample;
        if (!samples[selected]) return;
        document.querySelectorAll('[data-sample]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        question.textContent = samples[selected].ja;
        result.hidden = true;
        placeholder.hidden = false;
        delete reveal.dataset.revealed;
        reveal.setAttribute('aria-expanded', 'false');
        reveal.textContent = '回答・添削の例を見る →';
        track('demo_category_select', { category: selected });
      });
    });
    reveal.addEventListener('click', () => {
      const sample = samples[selected];
      document.getElementById('demo-answer').textContent = sample.answer;
      document.getElementById('demo-explanation').textContent = sample.explanation;
      document.getElementById('demo-variant-label').textContent = sample.variantLabel;
      document.getElementById('demo-variant').textContent = sample.variant;
      placeholder.hidden = true;
      result.hidden = false;
      reveal.setAttribute('aria-expanded', 'true');
      reveal.textContent = 'もう一度、声に出してみる ↺';
      // A second click hides the sample, so visitors can recall it unaided.
      if (reveal.dataset.revealed === selected) {
        result.hidden = true;
        placeholder.hidden = false;
        reveal.setAttribute('aria-expanded', 'false');
        reveal.textContent = '回答・添削の例を見る →';
        delete reveal.dataset.revealed;
      } else {
        reveal.dataset.revealed = selected;
        track('demo_answer_view', { category: selected });
      }
    });
  }

  let lastDialogOpener = null;
  document.querySelectorAll('[data-dialog]').forEach(button => {
    const dialog = document.getElementById(button.dataset.dialog);
    if (!dialog || typeof dialog.showModal !== 'function') {
      button.hidden = true;
      return;
    }
    button.addEventListener('click', () => {
      lastDialogOpener = button;
      dialog.showModal();
      document.body.classList.add('dialog-open');
      track(dialog.id === 'qr-dialog' ? 'qr_open' : 'app_screenshot_open');
    });
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      lastDialogOpener?.focus();
    });
  });

  const heroCta = document.getElementById('hero-cta');
  const closingCta = document.getElementById('closing-cta');
  const sticky = document.getElementById('sticky-cta');
  if (heroCta && sticky && 'IntersectionObserver' in window) {
    let afterHero = false;
    let closingVisible = false;
    const update = () => { sticky.hidden = !afterHero || closingVisible; };
    new IntersectionObserver(entries => {
      const entry = entries[0];
      afterHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 76;
      update();
    }, { rootMargin: '-76px 0px 0px 0px', threshold: 0 }).observe(heroCta);
    if (closingCta) new IntersectionObserver(entries => {
      closingVisible = entries[0].isIntersecting;
      update();
    }, { threshold: 0 }).observe(closingCta);
  }
})();
