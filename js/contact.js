document.addEventListener('includesLoaded', async () => {
  try {
    const settings = await getSettings();
    document.getElementById('contactAddress').textContent = settings.contact.address;
    document.getElementById('contactEmail').textContent = settings.contact.email;
    document.getElementById('contactPhone').textContent = settings.contact.phone;
  } catch (err) {
    console.error(err);
  }

  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('cfName').value,
      email: document.getElementById('cfEmail').value,
      message: document.getElementById('cfMessage').value,
    };
    await submitContactForm(payload);
    document.getElementById('cfStatus').style.display = 'block';
    document.getElementById('contactForm').reset();
  });
});
