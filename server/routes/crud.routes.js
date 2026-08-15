const express = require('express');
const { all, get, run } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/* ============================================================
   TEAM CRUD
   ============================================================ */

router.get('/team', async (req, res) => {
  try {
    const rows = await all(`SELECT id, name, role, photo, bio, email, linkedin FROM team ORDER BY order_index ASC, rowid ASC`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team data' });
  }
});

router.post('/team', requireAuth, async (req, res) => {
  try {
    const { name, role, photo, bio, email, linkedin } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }
    const id = req.body.id || `t${Date.now()}`;
    const countRow = await get(`SELECT MAX(order_index) as max_order FROM team`);
    const orderIndex = (countRow?.max_order ?? -1) + 1;

    await run(
      `INSERT INTO team (id, name, role, photo, bio, email, linkedin, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, role, photo || 'assets/images/placeholder-person.jpg', bio || '', email || '', linkedin || '', orderIndex]
    );

    const created = await get(`SELECT id, name, role, photo, bio, email, linkedin FROM team WHERE id = ?`, [id]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating team member:', err);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

router.put('/team/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, photo, bio, email, linkedin } = req.body;

    const existing = await get(`SELECT * FROM team WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await run(
      `UPDATE team SET name = ?, role = ?, photo = ?, bio = ?, email = ?, linkedin = ? WHERE id = ?`,
      [
        name ?? existing.name,
        role ?? existing.role,
        photo ?? existing.photo,
        bio ?? existing.bio,
        email ?? existing.email,
        linkedin ?? existing.linkedin,
        id,
      ]
    );

    const updated = await get(`SELECT id, name, role, photo, bio, email, linkedin FROM team WHERE id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating team member:', err);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

router.delete('/team/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run(`DELETE FROM team WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ success: true, message: 'Team member deleted' });
  } catch (err) {
    console.error('Error deleting team member:', err);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

/* ============================================================
   PUBLICATIONS CRUD
   ============================================================ */

router.get('/publications', async (req, res) => {
  try {
    const rows = await all(`SELECT id, title, authors, venue, year, link FROM publications ORDER BY year DESC, order_index ASC, rowid ASC`);
    res.json(rows.map(r => ({ ...r, year: Number(r.year) })));
  } catch (err) {
    console.error('Error fetching publications:', err);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
});

router.post('/publications', requireAuth, async (req, res) => {
  try {
    const { title, authors, venue, year, link } = req.body;
    if (!title || !authors || !venue || !year) {
      return res.status(400).json({ error: 'Title, authors, venue, and year are required' });
    }
    const id = req.body.id || `pub${Date.now()}`;
    const countRow = await get(`SELECT MAX(order_index) as max_order FROM publications`);
    const orderIndex = (countRow?.max_order ?? -1) + 1;

    await run(
      `INSERT INTO publications (id, title, authors, venue, year, link, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, authors, venue, Number(year), link || '', orderIndex]
    );

    const created = await get(`SELECT id, title, authors, venue, year, link FROM publications WHERE id = ?`, [id]);
    res.status(201).json({ ...created, year: Number(created.year) });
  } catch (err) {
    console.error('Error creating publication:', err);
    res.status(500).json({ error: 'Failed to create publication' });
  }
});

router.put('/publications/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, authors, venue, year, link } = req.body;

    const existing = await get(`SELECT * FROM publications WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    await run(
      `UPDATE publications SET title = ?, authors = ?, venue = ?, year = ?, link = ? WHERE id = ?`,
      [
        title ?? existing.title,
        authors ?? existing.authors,
        venue ?? existing.venue,
        year !== undefined ? Number(year) : existing.year,
        link ?? existing.link,
        id,
      ]
    );

    const updated = await get(`SELECT id, title, authors, venue, year, link FROM publications WHERE id = ?`, [id]);
    res.json({ ...updated, year: Number(updated.year) });
  } catch (err) {
    console.error('Error updating publication:', err);
    res.status(500).json({ error: 'Failed to update publication' });
  }
});

router.delete('/publications/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run(`DELETE FROM publications WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    res.json({ success: true, message: 'Publication deleted' });
  } catch (err) {
    console.error('Error deleting publication:', err);
    res.status(500).json({ error: 'Failed to delete publication' });
  }
});

/* ============================================================
   RESEARCH CRUD
   ============================================================ */

router.get('/research', async (req, res) => {
  try {
    const rows = await all(`SELECT id, title, description FROM research ORDER BY order_index ASC, rowid ASC`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching research:', err);
    res.status(500).json({ error: 'Failed to fetch research areas' });
  }
});

router.post('/research', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const id = req.body.id || `r${Date.now()}`;
    const countRow = await get(`SELECT MAX(order_index) as max_order FROM research`);
    const orderIndex = (countRow?.max_order ?? -1) + 1;

    await run(
      `INSERT INTO research (id, title, description, order_index) VALUES (?, ?, ?, ?)`,
      [id, title, description, orderIndex]
    );

    const created = await get(`SELECT id, title, description FROM research WHERE id = ?`, [id]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating research area:', err);
    res.status(500).json({ error: 'Failed to create research area' });
  }
});

router.put('/research/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const existing = await get(`SELECT * FROM research WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Research area not found' });
    }

    await run(
      `UPDATE research SET title = ?, description = ? WHERE id = ?`,
      [title ?? existing.title, description ?? existing.description, id]
    );

    const updated = await get(`SELECT id, title, description FROM research WHERE id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating research area:', err);
    res.status(500).json({ error: 'Failed to update research area' });
  }
});

router.delete('/research/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run(`DELETE FROM research WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Research area not found' });
    }
    res.json({ success: true, message: 'Research area deleted' });
  } catch (err) {
    console.error('Error deleting research area:', err);
    res.status(500).json({ error: 'Failed to delete research area' });
  }
});

/* ============================================================
   PROJECTS CRUD
   ============================================================ */

function formatProject(p) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    details: p.details || '',
    status: p.status || '',
    techStack: p.tech_stack || '',
    dates: p.dates || '',
    team: p.team || '',
    repoUrl: p.repo_url || '',
    demoUrl: p.demo_url || '',
    pubUrl: p.pub_url || '',
    image: p.image || '',
  };
}

router.get('/projects', async (req, res) => {
  try {
    const rows = await all(`SELECT * FROM projects ORDER BY order_index ASC, rowid ASC`);
    res.json(rows.map(formatProject));
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', requireAuth, async (req, res) => {
  try {
    const { title, description, details, status, techStack, dates, team, repoUrl, demoUrl, pubUrl, image } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const id = req.body.id || `p${Date.now()}`;
    const countRow = await get(`SELECT MAX(order_index) as max_order FROM projects`);
    const orderIndex = (countRow?.max_order ?? -1) + 1;

    await run(
      `INSERT INTO projects (id, title, description, details, status, tech_stack, dates, team, repo_url, demo_url, pub_url, image, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        description,
        details || '',
        status || '',
        techStack || req.body.tech_stack || '',
        dates || '',
        team || '',
        repoUrl || req.body.repo_url || '',
        demoUrl || req.body.demo_url || '',
        pubUrl || req.body.pub_url || '',
        image || '',
        orderIndex,
      ]
    );

    const created = await get(`SELECT * FROM projects WHERE id = ?`, [id]);
    res.status(201).json(formatProject(created));
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get(`SELECT * FROM projects WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { title, description, details, status, techStack, dates, team, repoUrl, demoUrl, pubUrl, image } = req.body;

    await run(
      `UPDATE projects SET
        title = ?,
        description = ?,
        details = ?,
        status = ?,
        tech_stack = ?,
        dates = ?,
        team = ?,
        repo_url = ?,
        demo_url = ?,
        pub_url = ?,
        image = ?
       WHERE id = ?`,
      [
        title ?? existing.title,
        description ?? existing.description,
        details ?? existing.details,
        status ?? existing.status,
        (techStack !== undefined ? techStack : (req.body.tech_stack ?? existing.tech_stack)),
        dates ?? existing.dates,
        team ?? existing.team,
        (repoUrl !== undefined ? repoUrl : (req.body.repo_url ?? existing.repo_url)),
        (demoUrl !== undefined ? demoUrl : (req.body.demo_url ?? existing.demo_url)),
        (pubUrl !== undefined ? pubUrl : (req.body.pub_url ?? existing.pub_url)),
        image ?? existing.image,
        id,
      ]
    );

    const updated = await get(`SELECT * FROM projects WHERE id = ?`, [id]);
    res.json(formatProject(updated));
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run(`DELETE FROM projects WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

/* ============================================================
   GALLERY CRUD
   ============================================================ */

router.get('/gallery', async (req, res) => {
  try {
    const rows = await all(`SELECT id, image, caption FROM gallery ORDER BY order_index ASC, rowid ASC`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

router.post('/gallery', requireAuth, async (req, res) => {
  try {
    const { image, caption } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image URL/path is required' });
    }
    const id = req.body.id || `g${Date.now()}`;
    const countRow = await get(`SELECT MAX(order_index) as max_order FROM gallery`);
    const orderIndex = (countRow?.max_order ?? -1) + 1;

    await run(
      `INSERT INTO gallery (id, image, caption, order_index) VALUES (?, ?, ?, ?)`,
      [id, image, caption || '', orderIndex]
    );

    const created = await get(`SELECT id, image, caption FROM gallery WHERE id = ?`, [id]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error adding gallery item:', err);
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

router.put('/gallery/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { image, caption } = req.body;

    const existing = await get(`SELECT * FROM gallery WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Gallery photo not found' });
    }

    await run(
      `UPDATE gallery SET image = ?, caption = ? WHERE id = ?`,
      [image ?? existing.image, caption ?? existing.caption, id]
    );

    const updated = await get(`SELECT id, image, caption FROM gallery WHERE id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating gallery photo:', err);
    res.status(500).json({ error: 'Failed to update gallery photo' });
  }
});

router.delete('/gallery/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run(`DELETE FROM gallery WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Gallery photo not found' });
    }
    res.json({ success: true, message: 'Gallery photo deleted' });
  } catch (err) {
    console.error('Error deleting gallery photo:', err);
    res.status(500).json({ error: 'Failed to delete gallery photo' });
  }
});

/* ============================================================
   SETTINGS
   ============================================================ */

function formatSettings(s) {
  if (!s) {
    return {
      labName: 'SAIL — Smart AI Lab',
      fullName: 'Software Analysis & Intelligence Lab',
      affiliation: 'SEECS, National University of Sciences & Technology (NUST)',
      tagline: 'Advancing intelligent systems through applied AI research.',
      mission: '',
      principalInvestigator: {
        name: 'Dr. M. Khuram Shahzad',
        title: 'Principal Investigator',
        photo: 'assets/images/pi-placeholder.jpg',
        bio: '',
        email: 'khuram.shahzad@seecs.nust.edu.pk',
      },
      contact: {
        address: 'SEECS, NUST H-12 Campus, Islamabad, Pakistan',
        email: 'sail@seecs.nust.edu.pk',
        phone: '+92 51 0000000',
      },
    };
  }

  return {
    labName: s.lab_name || '',
    fullName: s.full_name || '',
    affiliation: s.affiliation || '',
    tagline: s.tagline || '',
    mission: s.mission || '',
    principalInvestigator: {
      name: s.pi_name || '',
      title: s.pi_title || '',
      photo: s.pi_photo || 'assets/images/pi-placeholder.jpg',
      bio: s.pi_bio || '',
      email: s.pi_email || '',
    },
    contact: {
      address: s.contact_address || '',
      email: s.contact_email || '',
      phone: s.contact_phone || '',
    },
  };
}

router.get('/settings', async (req, res) => {
  try {
    const row = await get(`SELECT * FROM settings WHERE id = 1`);
    res.json(formatSettings(row));
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const pi = body.principalInvestigator || {};
    const contact = body.contact || {};

    const existing = await get(`SELECT * FROM settings WHERE id = 1`);

    if (existing) {
      await run(
        `UPDATE settings SET
          lab_name = ?,
          full_name = ?,
          affiliation = ?,
          tagline = ?,
          mission = ?,
          pi_name = ?,
          pi_title = ?,
          pi_photo = ?,
          pi_bio = ?,
          pi_email = ?,
          contact_address = ?,
          contact_email = ?,
          contact_phone = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          body.labName ?? existing.lab_name,
          body.fullName ?? existing.full_name,
          body.affiliation ?? existing.affiliation,
          body.tagline ?? existing.tagline,
          body.mission ?? existing.mission,
          pi.name ?? existing.pi_name,
          pi.title ?? existing.pi_title,
          pi.photo ?? existing.pi_photo,
          pi.bio ?? existing.pi_bio,
          pi.email ?? existing.pi_email,
          contact.address ?? existing.contact_address,
          contact.email ?? existing.contact_email,
          contact.phone ?? existing.contact_phone,
        ]
      );
    } else {
      await run(
        `INSERT INTO settings (id, lab_name, full_name, affiliation, tagline, mission, pi_name, pi_title, pi_photo, pi_bio, pi_email, contact_address, contact_email, contact_phone)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          body.labName || '',
          body.fullName || '',
          body.affiliation || '',
          body.tagline || '',
          body.mission || '',
          pi.name || '',
          pi.title || '',
          pi.photo || 'assets/images/pi-placeholder.jpg',
          pi.bio || '',
          pi.email || '',
          contact.address || '',
          contact.email || '',
          contact.phone || '',
        ]
      );
    }

    const updated = await get(`SELECT * FROM settings WHERE id = 1`);
    res.json(formatSettings(updated));
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
