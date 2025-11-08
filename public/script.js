// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get hCaptcha response token
        const hcaptchaResponse = document.querySelector('[name="h-captcha-response"]');
        const hcaptchaToken = hcaptchaResponse ? hcaptchaResponse.value : '';

        // Validate hCaptcha
        if (!hcaptchaToken) {
            showMessage('Please complete the captcha verification', 'error');
            return;
        }

        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim(),
            'h-captcha-response': hcaptchaToken
        };

        // Validate form
        if (!formData.name || !formData.email || !formData.message) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Disable submit button
        const submitButton = form.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Send form data to backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
                form.reset();
                // Reset hCaptcha widget
                if (typeof hcaptcha !== 'undefined') {
                    hcaptcha.reset();
                }
            } else {
                showMessage(data.message || 'Failed to send message. Please try again.', 'error');
                // Reset hCaptcha on error
                if (typeof hcaptcha !== 'undefined') {
                    hcaptcha.reset();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again later.', 'error');
            // Reset hCaptcha on error
            if (typeof hcaptcha !== 'undefined') {
                hcaptcha.reset();
            }
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-content');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
            hero.style.opacity = 1 - (scrolled / 600);
        }
    });
});
