document.addEventListener('includesLoaded', async () => {
  try {
    const settings = await getSettings();
    if (settings && settings.contact) {
      document.getElementById('contactAddress').textContent = settings.contact.address || '';
      document.getElementById('contactEmail').textContent = settings.contact.email || '';
      document.getElementById('contactPhone').textContent = settings.contact.phone || '';
    }
  } catch (err) {
    console.error('Error loading contact info:', err);
  }

  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('cfSubmitBtn');
    const statusMsg = document.getElementById('cfStatus');
    const errorMsg = document.getElementById('cfError');

    statusMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const payload = {
      name: document.getElementById('cfName').value,
      email: document.getElementById('cfEmail').value,
      message: document.getElementById('cfMessage').value,
    };

    try {
      await submitContactForm(payload);
      statusMsg.style.display = 'block';
      form.reset();
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = err.message || 'Failed to send message. Please try again.';
        errorMsg.style.display = 'block';
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }
  });
});
