/* =========================================================
   INSIGHTS ARTICLE READER
   ========================================================= */
var _activeInsightBtn = null;

function openInsight(btn, articleId) {
  var reader    = document.getElementById('insightReader');
  var content   = document.getElementById('readerContent');
  var catEl     = document.getElementById('readerCat');
  var dateEl    = document.getElementById('readerDate');
  var card      = btn.closest('.insight-card');
  var tpl       = document.getElementById(articleId);

  if (!reader || !tpl) return;

  // Toggle off if same article clicked again
  if (_activeInsightBtn === btn && !reader.hidden) {
    closeInsight();
    return;
  }

  // Reset previous active card/button
  if (_activeInsightBtn && _activeInsightBtn !== btn) {
    _activeInsightBtn.setAttribute('aria-expanded', 'false');
    _activeInsightBtn.innerHTML = 'Read Article <i class="bi bi-arrow-right" aria-hidden="true"></i>';
    var prevCard = _activeInsightBtn.closest('.insight-card');
    if (prevCard) prevCard.classList.remove('is-active');
  }

  // Populate reader
  if (catEl)  catEl.textContent  = card.querySelector('.insight-cat').textContent;
  if (dateEl) dateEl.textContent = card.querySelector('.insight-date-label').textContent;
  content.innerHTML = tpl.innerHTML;

  // Show reader
  reader.hidden = false;
  card.classList.add('is-active');
  btn.setAttribute('aria-expanded', 'true');
  btn.innerHTML = 'Close Article <i class="bi bi-arrow-up" aria-hidden="true"></i>';
  _activeInsightBtn = btn;

  // Smooth scroll to reader
  setTimeout(function() {
    reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

function closeInsight() {
  var reader = document.getElementById('insightReader');
  if (reader) reader.hidden = true;
  if (_activeInsightBtn) {
    _activeInsightBtn.setAttribute('aria-expanded', 'false');
    _activeInsightBtn.innerHTML = 'Read Article <i class="bi bi-arrow-right" aria-hidden="true"></i>';
    var card = _activeInsightBtn.closest('.insight-card');
    if (card) card.classList.remove('is-active');
    _activeInsightBtn = null;
  }
}

/* =========================================================
   SCROLL REVEAL — Intersection Observer
   ========================================================= */
function triggerReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));
}

/* =========================================================
   NAVIGATION — Scroll-based header class + hamburger
   ========================================================= */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen.toString());
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeMobile() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMobile();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobile();
});

/* =========================================================
   ACTIVE NAV LINK — Highlight current page
   ========================================================= */
(function() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .footer-links a').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.style.color = 'var(--teal)';
    }
  });
})();

/* =========================================================
   FAQ ACCORDION
   ========================================================= */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

/* =========================================================
   PRODUCT FILTER
   ========================================================= */
function filterProducts(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  document.querySelectorAll('.product-card').forEach(card => {
    const match = cat === 'all' || card.dataset.cat === cat;
    card.style.display = match ? 'block' : 'none';
  });
}

/* =========================================================
   CONTACT FORM — VALIDATION HELPERS
   ========================================================= */
function cfField(id) { return document.getElementById(id); }
function cfErr(id)   { return document.getElementById('err-' + id); }

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}
function validatePhone(v) {
  return /^[\+]?[0-9][\s\-]?[(]?[0-9]{2,3}[)]?[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,4}$/.test(v.replace(/\s+/g,''));
}

function setFieldError(inputId, hasError) {
  const input = cfField(inputId);
  const err   = cfErr(inputId);
  if (!input || !err) return;
  input.classList.toggle('has-error', hasError);
  err.classList.toggle('visible', hasError);
}

function clearFieldErrors() {
  document.querySelectorAll('.form-control.has-error').forEach(el => el.classList.remove('has-error'));
  document.querySelectorAll('.field-error.visible').forEach(el => el.classList.remove('visible'));
}

function resetContactForm() {
  const form = document.getElementById('contactForm');
  if (form) form.reset();
  clearFieldErrors();
  const panel = document.getElementById('contactSuccessPanel');
  if (panel) panel.classList.remove('visible');
  if (form) form.style.display = '';
}

/* =========================================================
   CONTACT FORM HANDLER — Web3Forms email submission
   ========================================================= */
async function handleContactForm(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  clearFieldErrors();

  // 1. Check honeypot BEFORE any button state change
  const botcheck = form.querySelector('[name="botcheck"]');
  if (botcheck && botcheck.checked) return;

  // 2. Validate required fields
  let valid = true;
  const name    = cfField('cfName');
  const phone   = cfField('cfPhone');
  const email   = cfField('cfEmail');
  const message = cfField('cfMessage');
  if (!name || !name.value.trim()) { setFieldError('cfName', true); valid = false; }
  if (!phone || !validatePhone(phone.value.trim())) { setFieldError('cfPhone', true); valid = false; }
  if (email && email.value.trim() && !validateEmail(email.value.trim())) { setFieldError('cfEmail', true); valid = false; }
  if (!message || !message.value.trim()) { setFieldError('cfMessage', true); valid = false; }
  if (!valid) {
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 400);
    return;
  }

  // 3. Only now disable the submit button and show loading state
  const submitBtn = form.querySelector('[type=submit]');
  if (submitBtn) { submitBtn.classList.add('btn-loading'); submitBtn.disabled = true; }
  const payload = {
    access_key:   'efe0368e-0d20-497c-a657-4171eb0cd781',
    subject:      'New Enquiry — Excellent Services Website',
    from_name:    'Excellent Services Website',
    redirect:     'false',
    name:         name.value.trim(),
    phone:        phone.value.trim(),
    email:        (email && email.value.trim()) || '(not provided)',
    message:      message.value.trim()
  };
  try {
    const res  = await fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      form.style.display = 'none';
      const panel = document.getElementById('contactSuccessPanel');
      if (panel) panel.classList.add('visible');
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'Contact Form', event_label: 'Contact Enquiry' });
    } else {
      showToast('Submission failed — please try again or contact us directly.');
      if (submitBtn) { submitBtn.classList.remove('btn-loading'); submitBtn.disabled = false; }
    }
  } catch (err) {
    showToast('Network error — please check your connection and try again.');
    if (submitBtn) { submitBtn.classList.remove('btn-loading'); submitBtn.disabled = false; }
  }
}

/* =========================================================
   QUOTE MULTI-STEP FORM
   ========================================================= */
let quoteStep = 1;
const quoteTotalSteps = 5;
const stepTitles = [
  'What service do you need?',
  'What type of facility?',
  'How often do you need service?',
  'Your contact details',
  'Review your request'
];

function quoteNav(dir) {
  if (dir === 1) {
    if (quoteStep < quoteTotalSteps) {
      if (!quoteValidate()) return;
      setQuoteStep(quoteStep + 1);
    } else {
      submitQuoteForm();
    }
  } else {
    if (quoteStep > 1) setQuoteStep(quoteStep - 1);
  }
}

function setQuoteStep(n) {
  const prev = document.getElementById('qstep-' + quoteStep);
  if (prev) prev.style.display = 'none';
  const dot_prev = document.getElementById('step-dot-' + quoteStep);
  if (dot_prev) { dot_prev.classList.remove('active'); dot_prev.classList.add('done'); dot_prev.innerHTML = '<i class="bi bi-check2"></i>'; }
  if (quoteStep < n) {
    const line = document.getElementById('step-line-' + quoteStep);
    if (line) line.classList.add('done');
  }
  quoteStep = n;
  const curr = document.getElementById('qstep-' + quoteStep);
  if (curr) curr.style.display = 'block';
  const dot_curr = document.getElementById('step-dot-' + quoteStep);
  if (dot_curr) {
    dot_curr.classList.remove('done');
    dot_curr.classList.add('active');
    dot_curr.textContent = quoteStep;
  }
  document.getElementById('quoteStepTag').textContent   = 'Step ' + quoteStep + ' of ' + quoteTotalSteps;
  document.getElementById('quoteStepTitle').textContent = stepTitles[quoteStep - 1];
  document.getElementById('quotePrev').style.display    = quoteStep > 1 ? 'inline-flex' : 'none';
  const nextBtn = document.getElementById('quoteNext');
  if (quoteStep === quoteTotalSteps) {
    nextBtn.innerHTML = 'Submit Request <i class="bi bi-send" aria-hidden="true"></i>';
    updateQuoteSummary();
  } else {
    nextBtn.innerHTML = 'Next <i class="bi bi-arrow-right" aria-hidden="true"></i>';
  }
}

function getRadioValue(name) {
  const checked = document.querySelector('[name="' + name + '"]:checked');
  return checked ? checked.value : '';
}

function quoteValidate() {
  if (quoteStep === 1 && !getRadioValue('service')) { showToast('Please select a service to continue.'); return false; }
  if (quoteStep === 2 && !getRadioValue('property')) { showToast('Please select your facility type.'); return false; }
  if (quoteStep === 3 && !getRadioValue('frequency')) { showToast('Please select a service frequency.'); return false; }
  if (quoteStep === 4) {
    const name  = document.getElementById('qName').value.trim();
    const phone = document.getElementById('qPhone').value.trim();
    if (!name)  { showToast('Please enter your name.'); return false; }
    if (!phone || !validatePhone(phone)) { showToast('Please enter a valid South African phone number.'); return false; }
  }
  return true;
}

function updateQuoteSummary() {
  const s = document.getElementById('summaryService');
  const p = document.getElementById('summaryProperty');
  const f = document.getElementById('summaryFrequency');
  const c = document.getElementById('summaryContact');
  if (s) s.textContent = getRadioValue('service') || '—';
  if (p) p.textContent = getRadioValue('property') || '—';
  if (f) f.textContent = getRadioValue('frequency') || '—';
  if (c) {
    const name  = document.getElementById('qName').value.trim();
    const phone = document.getElementById('qPhone').value.trim();
    c.textContent = name && phone ? name + ' · ' + phone : (name || phone || '—');
  }
}

async function submitQuoteForm() {
  const name    = document.getElementById('qName').value.trim();
  const phone   = document.getElementById('qPhone').value.trim();
  const email   = document.getElementById('qEmail').value.trim();
  const org     = document.getElementById('qOrg').value.trim();
  const notes   = document.getElementById('qNotes').value.trim();
  const service = getRadioValue('service');
  const prop    = getRadioValue('property');
  const freq    = getRadioValue('frequency');
  const nextBtn = document.getElementById('quoteNext');
  const botcheck = document.querySelector('#quoteForm [name="botcheck"]');
  if (botcheck && botcheck.checked) return;
  if (nextBtn.disabled) return;
  nextBtn.classList.add('btn-loading');
  nextBtn.disabled = true;
  const payload = {
    access_key:        'efe0368e-0d20-497c-a657-4171eb0cd781',
    subject:           'Assessment & Quote Request — Excellent Services Website',
    from_name:         'Excellent Services Website',
    redirect:          'false',
    name, phone,
    email:             email || '(not provided)',
    organisation:      org   || '(not provided)',
    service_required:  service,
    facility_type:     prop,
    service_frequency: freq,
    additional_notes:  notes || '(none)'
  };
  try {
    const res  = await fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      document.querySelector('.quote-wrap > .quote-progress').style.display = 'none';
      document.getElementById('quoteStepTag').style.display = 'none';
      document.getElementById('quoteStepTitle').style.display = 'none';
      for (let i = 1; i <= quoteTotalSteps; i++) {
        const p = document.getElementById('qstep-' + i);
        if (p) p.style.display = 'none';
      }
      document.querySelector('.q-nav').style.display = 'none';
      const ref = 'Service: ' + service + ' · Facility: ' + prop + ' · Frequency: ' + freq;
      document.getElementById('quoteRefDisplay').textContent = ref;
      const panel = document.getElementById('quoteSuccessPanel');
      panel.classList.add('visible');
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'Quote Request', event_label: 'Assessment Quote Request' });
    } else {
      showToast('Submission failed — please try again or contact us directly.');
      nextBtn.classList.remove('btn-loading');
      nextBtn.disabled = false;
    }
  } catch (err) {
    showToast('Network error — please check your connection and try again.');
    nextBtn.classList.remove('btn-loading');
    nextBtn.disabled = false;
  }
}

function resetQuoteForm() {
  document.querySelectorAll('#quoteForm input[type=radio]').forEach(r => r.checked = false);
  ['qName','qPhone','qEmail','qOrg','qNotes'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  quoteStep = 1;
  for (let i = 1; i <= quoteTotalSteps; i++) {
    const p = document.getElementById('qstep-' + i);
    if (p) p.style.display = i === 1 ? 'block' : 'none';
    const dot = document.getElementById('step-dot-' + i);
    if (dot) { dot.classList.remove('active','done'); dot.textContent = i; if (i===1) dot.classList.add('active'); }
    if (i < quoteTotalSteps) {
      const line = document.getElementById('step-line-' + i);
      if (line) line.classList.remove('done');
    }
  }
  document.getElementById('quoteStepTag').textContent   = 'Step 1 of 5';
  document.getElementById('quoteStepTitle').textContent = stepTitles[0];
  document.getElementById('quotePrev').style.display    = 'none';
  document.getElementById('quoteNext').innerHTML        = 'Next <i class="bi bi-arrow-right" aria-hidden="true"></i>';
  document.getElementById('quoteNext').classList.remove('btn-loading');
  document.getElementById('quoteNext').disabled = false;
  document.querySelector('.quote-wrap > .quote-progress').style.display = '';
  document.getElementById('quoteStepTag').style.display = '';
  document.getElementById('quoteStepTitle').style.display = '';
  document.querySelector('.q-nav').style.display = '';
  document.getElementById('quoteSuccessPanel').classList.remove('visible');
}

/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */
function showToast(message, duration) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration || 4000);
}

/* =========================================================
   KEYBOARD ACCESSIBILITY — Service/Industry cards
   ========================================================= */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.getAttribute('role') === 'button') {
    e.target.click();
  }
});

/* =========================================================
   FOOTER YEAR
   ========================================================= */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  triggerReveal();
});

window.addEventListener('scroll', triggerReveal, { passive: true });

document.querySelectorAll('.nav-logo img').forEach(img => {
  img.addEventListener('load', () => {
    if (img.closest('.nav-logo')) img.style.objectFit = 'contain';
  });
});

(()=>{if(!location.pathname.startsWith('/products/'))return;document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('a[href="/quote/"]').forEach(a=>{const card=a.closest('.product-card');const name=card?.querySelector('.product-name')?.textContent.trim()||(location.pathname.startsWith('/products/item/')&&a.closest('.item-layout')?document.querySelector('h1')?.textContent.trim():null);if(name)a.href='/quote/?product='+encodeURIComponent(name)})})})();

(()=>{const key='excellentQuoteBasket';let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))items=[]}catch{}items=items.filter(x=>x&&typeof x.name==='string'&&Number.isInteger(x.qty)&&x.qty>0);const save=()=>{try{localStorage.setItem(key,JSON.stringify(items))}catch{}};const el=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt)e.textContent=txt;if(cls)e.className=cls;return e};const start=()=>{const productPage=location.pathname.startsWith('/products/'),quotePage=location.pathname.startsWith('/quote');if(!productPage&&!quotePage)return;const panel=el('section','','eq-panel');panel.setAttribute('aria-label','My quote');const heading=el('h2','My Quote');const list=el('div');const status=el('p');status.setAttribute('role','status');const go=el('a','Continue to quotation','btn btn-primary');go.href='/product-quote/';const close=el('button','Close','eq-close');close.type='button';panel.append(close,heading,list,status,go);const trigger=el('button','','eq-trigger');trigger.type='button';const notes=document.getElementById('qNotes');const sync=()=>{if(!notes)return;const original=notes.value.replace(/^Selected products:\n[\s\S]*?\nEnd selected products\n\n/,'');notes.value=(items.length?'Selected products:\n'+items.map(x=>x.qty+' × '+x.name).join('\n')+'\nEnd selected products\n\n':'')+original};const render=()=>{list.replaceChildren();trigger.textContent='My Quote ('+items.reduce((n,x)=>n+x.qty,0)+')';for(const item of items){const row=el('div','','eq-row');const name=el('span',item.name);const qty=el('input');qty.type='number';qty.min='1';qty.max='999';qty.value=item.qty;qty.setAttribute('aria-label','Quantity for '+item.name);qty.addEventListener('change',()=>{item.qty=Math.max(1,Math.min(999,Math.floor(Number(qty.value)||1)));save();render()});const remove=el('button','Remove');remove.type='button';remove.addEventListener('click',()=>{items=items.filter(x=>x!==item);save();render()});row.append(name,qty,remove);list.append(row)}status.textContent=items.length?'Review quantities before requesting your quotation.':'Your quote basket is empty.';go.hidden=!items.length||quotePage;if(quotePage)sync()};if(productPage){panel.hidden=true;document.body.append(trigger,panel);trigger.onclick=()=>{panel.hidden=!panel.hidden};close.onclick=()=>{panel.hidden=true;trigger.focus()};document.querySelectorAll('.product-card a[href^="/quote/"],.item-layout a.btn[href^="/quote/"]').forEach(a=>{const name=a.closest('.product-card')?.querySelector('.product-name')?.textContent.trim()||document.querySelector('.item-layout h1')?.textContent.trim();if(!name)return;const b=el('button','Add to Quote','btn btn-primary');b.type='button';b.onclick=()=>{const found=items.find(x=>x.name===name);if(found)found.qty=Math.min(999,found.qty+1);else items.push({name,qty:1});save();render();panel.hidden=false};a.replaceWith(b)})}else if(new URLSearchParams(location.search).has('basket')&&notes){close.hidden=true;document.getElementById('quoteForm')?.before(panel)}else return;render()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start()})();
