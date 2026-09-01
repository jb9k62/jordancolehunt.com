// Contact Form Handler (vanilla JS)
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var formMessage = document.getElementById('form-message');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get hCaptcha response token
    var hcaptchaField = form.querySelector('[name="h-captcha-response"]');
    var hcaptchaToken = hcaptchaField ? hcaptchaField.value : '';

    if (!hcaptchaToken) {
      showMessage('Please complete the captcha verification', 'error');
      return;
    }

    var formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim(),
      'h-captcha-response': hcaptchaToken
    };

    if (!formData.name || !formData.email || !formData.message) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    var submitButton = form.querySelector('.submit-button');
    var originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      var response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      var data = await response.json();

      if (response.ok && data.success) {
        showMessage("Message sent successfully! I'll get back to you soon.", 'success');
        form.reset();
        if (typeof hcaptcha !== 'undefined') hcaptcha.reset();
      } else {
        showMessage(data.message || 'Failed to send message. Please try again.', 'error');
        if (typeof hcaptcha !== 'undefined') hcaptcha.reset();
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('An error occurred. Please try again later.', 'error');
      if (typeof hcaptcha !== 'undefined') hcaptcha.reset();
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = 'form-message ' + type;
    formMessage.style.display = 'block';
    setTimeout(function () {
      formMessage.style.display = 'none';
    }, 5000);
  }
})();
