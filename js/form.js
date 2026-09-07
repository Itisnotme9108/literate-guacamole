/**
 * Editorial Resort & Swimwear - Custom Fit Form Module (Vanilla JS)
 * Form validation, body measurement checks, mailto string generator, success confirmation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bespokeForm');
  if (!form) return;

  initBespokeForm(form);
});

function initBespokeForm(form) {
  const requiredInputs = form.querySelectorAll('.form-control[required]');

  requiredInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    requiredInputs.forEach(input => {
      if (!validateField(input)) isValid = false;
    });

    if (!isValid) {
      const firstError = form.querySelector('.form-control.error');
      if (firstError) firstError.focus();
      return;
    }

    processBespokeSubmit(form);
  });
}

function validateField(input) {
  const val = input.value.trim();
  let valid = true;

  if (input.required && !val) {
    valid = false;
  } else if (input.type === 'email' && val) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) valid = false;
  } else if (input.id.includes('Measurement') || input.id.includes('Size')) {
    // Basic measurement check (must contain at least one digit or valid unit)
    if (val && !/\d/.test(val)) valid = false;
  }

  const errEl = document.getElementById(`err-${input.id}`);
  if (!valid) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    if (errEl) errEl.style.display = 'block';
  } else {
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
    if (errEl) errEl.style.display = 'none';
  }

  return valid;
}

function processBespokeSubmit(form) {
  const name = document.getElementById('fullName')?.value.trim() || document.getElementById('clientName')?.value.trim() || '';
  const email = document.getElementById('email')?.value.trim() || document.getElementById('clientEmail')?.value.trim() || '';
  const category = document.getElementById('garmentType')?.value || document.getElementById('garmentCategory')?.value || 'Custom Swimwear';
  const color = document.getElementById('yarnColor')?.value || document.getElementById('colorPreference')?.value || 'Unbleached Organic Linen';
  const bust = document.getElementById('bustMeasurement')?.value.trim() || document.getElementById('bustSize')?.value.trim() || 'N/A';
  const underbust = document.getElementById('underbustMeasurement')?.value.trim() || document.getElementById('underbustSize')?.value.trim() || 'N/A';
  const waist = document.getElementById('waistMeasurement')?.value.trim() || document.getElementById('waistSize')?.value.trim() || 'N/A';
  const hip = document.getElementById('hipMeasurement')?.value.trim() || document.getElementById('hipSize')?.value.trim() || 'N/A';
  const notes = document.getElementById('fitNotes')?.value.trim() || document.getElementById('specialNotes')?.value.trim() || 'None';

  const subject = encodeURIComponent(`Custom Swim Fit Inquiry — ${name}`);
  const bodyText = `Hello Atelier Team,

I would like to request a bespoke custom swimwear fitting order. Here are my dimensions and details:

• Client Name: ${name}
• Email: ${email}
• Garment Silhouette: ${category}
• Yarn & Colorway: ${color}

• Body Proportions:
  - Full Bust: ${bust}
  - Underbust: ${underbust}
  - Natural Waist: ${waist}
  - Full Hip: ${hip}

• Special Fitting Notes & Coverage Preferences:
${notes}

Thank you!`;

  const mailtoUrl = `mailto:atelier@editorialresort.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

  const successBox = document.getElementById('bespokeSuccessBox');
  if (successBox) {
    successBox.style.display = 'block';
    successBox.innerHTML = `
      <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-main);">Opening Email Application... ✦</h3>
      <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1rem;">
        Your custom measurements have been compiled. Your email client will launch automatically to send your inquiry directly to <strong>atelier@editorialresort.com</strong>.
      </p>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;">
        <a href="${mailtoUrl}" class="btn btn-solid btn-sm">Launch Mail Client Manual Link ✦</a>
        <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('atelier@editorialresort.com'); alert('Atelier email copied to clipboard!');">Copy Atelier Email</button>
      </div>
    `;
    successBox.classList.add('show');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  setTimeout(() => {
    window.location.href = mailtoUrl;
  }, 600);

  form.reset();
}
