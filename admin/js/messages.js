document.addEventListener('adminIncludesLoaded', renderMessagesTable);

let currentMessages = [];

async function renderMessagesTable() {
  const tbody = document.getElementById('msgTableBody');
  try {
    const messages = await getMessages();
    currentMessages = messages;

    if (!messages.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--color-muted);padding:32px;">No contact inquiries received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = messages.map((m, idx) => {
      const date = new Date(m.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const isUnread = m.status === 'unread';
      const snippet = m.message.length > 60 ? `${m.message.slice(0, 60)}...` : m.message;

      return `
        <tr style="${isUnread ? 'font-weight:600;background:rgba(20,184,166,0.05);' : ''}">
          <td style="white-space:nowrap;font-size:0.85rem;color:var(--color-muted);">${date}</td>
          <td>${m.name}</td>
          <td><a href="mailto:${m.email}" style="color:var(--color-teal);text-decoration:none;">${m.email}</a></td>
          <td style="cursor:pointer;" onclick="openMsgModal(${idx})">${snippet}</td>
          <td>
            <span style="display:inline-block;padding:3px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;${
              isUnread ? 'background:#fef3c7;color:#b45309;' : 'background:#e0e7ff;color:#3730a3;'
            }">
              ${isUnread ? 'Unread' : 'Read'}
            </span>
          </td>
          <td class="row-actions">
            <button class="edit-btn" onclick="openMsgModal(${idx})">View</button>
            <button class="delete-btn" onclick="handleDeleteMsg('${m.id}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load messages:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;">Error loading messages: ${err.message}</td></tr>`;
  }
}

async function openMsgModal(idx) {
  const m = currentMessages[idx];
  if (!m) return;

  document.getElementById('msgModalSender').textContent = `Message from ${m.name}`;
  document.getElementById('msgModalMeta').textContent = `Email: ${m.email} | Received: ${new Date(m.created_at).toLocaleString()}`;
  document.getElementById('msgModalContent').textContent = m.message;
  document.getElementById('msgModalReply').href = `mailto:${m.email}?subject=Re: Inquiry on SAIL Lab Website`;

  document.getElementById('msgModalOverlay').classList.add('open');

  if (m.status === 'unread') {
    try {
      await markMessageRead(m.id);
      m.status = 'read';
      renderMessagesTable();
    } catch (e) {
      console.warn('Could not mark as read:', e);
    }
  }
}

function closeMsgModal() {
  document.getElementById('msgModalOverlay').classList.remove('open');
}

async function handleDeleteMsg(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  try {
    await deleteMessage(id);
    renderMessagesTable();
  } catch (err) {
    alert('Failed to delete message: ' + err.message);
  }
}
