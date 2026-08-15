const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'string') {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== SAIL API AUTOMATED VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({ host: 'localhost', port: 8000, path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.body.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Public GET endpoints
    const team = await request({ host: 'localhost', port: 8000, path: '/api/team', method: 'GET' });
    assert(team.status === 200 && Array.isArray(team.body) && team.body.length > 0, `GET /api/team returns array (${team.body.length} items)`);

    const pubs = await request({ host: 'localhost', port: 8000, path: '/api/publications', method: 'GET' });
    assert(pubs.status === 200 && Array.isArray(pubs.body), `GET /api/publications returns array (${pubs.body.length} items)`);

    const research = await request({ host: 'localhost', port: 8000, path: '/api/research', method: 'GET' });
    assert(research.status === 200 && Array.isArray(research.body), `GET /api/research returns array (${research.body.length} items)`);

    const projects = await request({ host: 'localhost', port: 8000, path: '/api/projects', method: 'GET' });
    assert(projects.status === 200 && Array.isArray(projects.body), `GET /api/projects returns array (${projects.body.length} items)`);

    const gallery = await request({ host: 'localhost', port: 8000, path: '/api/gallery', method: 'GET' });
    assert(gallery.status === 200 && Array.isArray(gallery.body), `GET /api/gallery returns array (${gallery.body.length} items)`);

    const settings = await request({ host: 'localhost', port: 8000, path: '/api/settings', method: 'GET' });
    assert(settings.status === 200 && settings.body.labName && settings.body.principalInvestigator, 'GET /api/settings returns settings object');

    // 3. Contact Form Submission
    const contactRes = await request(
      {
        host: 'localhost',
        port: 8000,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Dr. Test Visitor', email: 'test@example.com', message: 'Hello SAIL team! This is an automated test message.' }
    );
    assert(contactRes.status === 201 && contactRes.body.success, 'POST /api/contact submits message');

    // 4. Auth: Invalid Login
    const badLogin = await request(
      {
        host: 'localhost',
        port: 8000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { password: 'wrongpassword' }
    );
    assert(badLogin.status === 401, 'POST /api/auth/login with wrong password returns 401 Unauthorized');

    // 5. Auth: Valid Login
    const login = await request(
      {
        host: 'localhost',
        port: 8000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { password: 'sail2026' }
    );
    assert(login.status === 200 && login.body.token, 'POST /api/auth/login with sail2026 returns JWT token');
    const token = login.body.token;

    // 6. Auth verification
    const authMe = await request({
      host: 'localhost',
      port: 8000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(authMe.status === 200 && authMe.body.user.username === 'admin', 'GET /api/auth/me verifies token');

    // 7. Protected Messages Endpoint
    const messages = await request({
      host: 'localhost',
      port: 8000,
      path: '/api/contact/messages',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(messages.status === 200 && messages.body.length > 0, `GET /api/contact/messages retrieves messages (${messages.body.length} found)`);

    // 8. Protected CRUD: Add Member (Unauthenticated should fail)
    const unauthAdd = await request(
      {
        host: 'localhost',
        port: 8000,
        path: '/api/team',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Unauth Test', role: 'Tester' }
    );
    assert(unauthAdd.status === 401, 'POST /api/team without token is blocked (401)');

    // 9. Protected CRUD: Add Member (Authenticated)
    const addTeam = await request(
      {
        host: 'localhost',
        port: 8000,
        path: '/api/team',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { name: 'Alice Test Researcher', role: 'Graduate Researcher', email: 'alice@seecs.edu.pk' }
    );
    assert(addTeam.status === 201 && addTeam.body.id, 'POST /api/team creates new member');
    const newMemberId = addTeam.body.id;

    // 10. Protected CRUD: Update Member
    const updateTeam = await request(
      {
        host: 'localhost',
        port: 8000,
        path: `/api/team/${newMemberId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { role: 'Senior AI Researcher' }
    );
    assert(updateTeam.status === 200 && updateTeam.body.role === 'Senior AI Researcher', 'PUT /api/team/:id updates member');

    // 11. Protected CRUD: Delete Member
    const deleteTeam = await request({
      host: 'localhost',
      port: 8000,
      path: `/api/team/${newMemberId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(deleteTeam.status === 200 && deleteTeam.body.success, 'DELETE /api/team/:id deletes member');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
