document.addEventListener('adminIncludesLoaded', loadSettingsForm);

async function loadSettingsForm() {
  const s = await getSettingsData();

  document.getElementById('sLabName').value = s.labName || '';
  document.getElementById('sFullName').value = s.fullName || '';
  document.getElementById('sAffiliation').value = s.affiliation || '';
  document.getElementById('sTagline').value = s.tagline || '';
  document.getElementById('sMission').value = s.mission || '';

  const pi = s.principalInvestigator || {};
  document.getElementById('sPiName').value = pi.name || '';
  document.getElementById('sPiTitle').value = pi.title || '';
  document.getElementById('sPiPhoto').value = pi.photo || '';
  document.getElementById('sPiBio').value = pi.bio || '';
  document.getElementById('sPiEmail').value = pi.email || '';

  const contact = s.contact || {};
  document.getElementById('sAddress').value = contact.address || '';
  document.getElementById('sContactEmail').value = contact.email || '';
  document.getElementById('sPhone').value = contact.phone || '';
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    labName: document.getElementById('sLabName').value,
    fullName: document.getElementById('sFullName').value,
    affiliation: document.getElementById('sAffiliation').value,
    tagline: document.getElementById('sTagline').value,
    mission: document.getElementById('sMission').value,
    principalInvestigator: {
      name: document.getElementById('sPiName').value,
      title: document.getElementById('sPiTitle').value,
      photo: document.getElementById('sPiPhoto').value || 'assets/images/pi-placeholder.jpg',
      bio: document.getElementById('sPiBio').value,
      email: document.getElementById('sPiEmail').value,
    },
    contact: {
      address: document.getElementById('sAddress').value,
      email: document.getElementById('sContactEmail').value,
      phone: document.getElementById('sPhone').value,
    },
  };

  await saveSettingsData(data);

  const status = document.getElementById('saveStatus');
  status.style.display = 'inline';
  setTimeout(() => (status.style.display = 'none'), 2000);
});
