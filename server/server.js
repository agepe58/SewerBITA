const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://sewerbita_admin:sewerbita_pass@postgres-sewerbita:5432/sewerbita_db',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL Database:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL + PostGIS Database successfully!');
    release();
  }
});

// --------------------------------------------------------------------
// 1. HEALTH CHECK ENDPOINT
// --------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT PostGIS_Full_Version() as version, current_database() as dbname;');
    res.json({
      status: 'healthy',
      database: 'connected',
      database_name: dbResult.rows[0].dbname,
      postgis_version: dbResult.rows[0].version,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// --------------------------------------------------------------------
// 2. ALL ASSETS FETCH ENDPOINT (Manholes, Pump Stations, Pipes)
// --------------------------------------------------------------------
app.get('/api/assets', async (req, res) => {
  try {
    const [manholesRes, pumpStationsRes, pipesRes] = await Promise.all([
      pool.query('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, depth_meters AS "depthMeters", diameter_mm AS "diameterMm", material, status, condition, next_inspection_due AS "nextInspectionDue" FROM manhole_assets ORDER BY created_at DESC;'),
      pool.query('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, flow_capacity_lps AS "flowCapacityLps", total_pumps AS "totalPumps", active_pumps AS "activePumps", power_source AS "powerSource", generator_backup AS "generatorBackup", status, condition, next_inspection_due AS "nextInspectionDue" FROM pump_station_assets ORDER BY created_at DESC;'),
      pool.query('SELECT id, asset_code AS "assetCode", name, area, from_asset_id AS "fromAssetId", to_asset_id AS "toAssetId", length_meters AS "lengthMeters", diameter_mm AS "diameterMm", material, slope_percent AS "slopePercent", status, condition, next_inspection_due AS "nextInspectionDue" FROM pipe_assets ORDER BY created_at DESC;')
    ]);

    res.json({
      manholes: manholesRes.rows,
      pumpStations: pumpStationsRes.rows,
      pipes: pipesRes.rows
    });
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 3. CREATE ASSET ENDPOINT
// --------------------------------------------------------------------
app.post('/api/assets', async (req, res) => {
  const { type, data } = req.body;
  try {
    if (type === 'manhole') {
      const q = `
        INSERT INTO manhole_assets 
        (id, asset_code, name, area, latitude, longitude, depth_meters, diameter_mm, material, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `;
      const values = [
        data.id || `mh-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        data.latitude,
        data.longitude,
        data.depthMeters || 2.0,
        data.diameterMm || 600,
        data.material || 'Precast Concrete',
        data.status || 'Active',
        data.condition || 'Good',
        data.nextInspectionDue || new Date().toISOString().split('T')[0]
      ];
      const result = await pool.query(q, values);
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'pumpStation') {
      const q = `
        INSERT INTO pump_station_assets 
        (id, asset_code, name, area, latitude, longitude, flow_capacity_lps, total_pumps, active_pumps, power_source, generator_backup, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
      `;
      const values = [
        data.id || `ps-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        data.latitude,
        data.longitude,
        data.flowCapacityLps || 150.0,
        data.totalPumps || 3,
        data.activePumps || 2,
        data.powerSource || 'PLN Grid',
        data.generatorBackup || 'Genset',
        data.status || 'Active',
        data.condition || 'Good',
        data.nextInspectionDue || new Date().toISOString().split('T')[0]
      ];
      const result = await pool.query(q, values);
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'pipe') {
      const q = `
        INSERT INTO pipe_assets 
        (id, asset_code, name, area, from_asset_id, to_asset_id, length_meters, diameter_mm, material, slope_percent, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;
      const values = [
        data.id || `p-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        data.fromAssetId,
        data.toAssetId,
        data.lengthMeters || 50.0,
        data.diameterMm || 300,
        data.material || 'HDPE',
        data.slopePercent || 0.5,
        data.status || 'Active',
        data.condition || 'Good',
        data.nextInspectionDue || new Date().toISOString().split('T')[0]
      ];
      const result = await pool.query(q, values);
      return res.status(201).json(result.rows[0]);
    }

    res.status(400).json({ error: 'Invalid asset type specified' });
  } catch (err) {
    console.error('Error creating asset:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 4. UPDATE ASSET ENDPOINT
// --------------------------------------------------------------------
app.put('/api/assets/:id', async (req, res) => {
  const { id } = req.params;
  const { type, data } = req.body;

  try {
    if (type === 'manhole') {
      const q = `
        UPDATE manhole_assets SET
          asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
          depth_meters = $6, diameter_mm = $7, material = $8, status = $9, condition = $10, next_inspection_due = $11
        WHERE id = $12 RETURNING *;
      `;
      const values = [data.assetCode, data.name, data.area, data.latitude, data.longitude, data.depthMeters, data.diameterMm, data.material, data.status, data.condition, data.nextInspectionDue, id];
      const result = await pool.query(q, values);
      return res.json(result.rows[0]);
    }

    if (type === 'pumpStation') {
      const q = `
        UPDATE pump_station_assets SET
          asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
          flow_capacity_lps = $6, total_pumps = $7, active_pumps = $8, power_source = $9, generator_backup = $10, status = $11, condition = $12, next_inspection_due = $13
        WHERE id = $14 RETURNING *;
      `;
      const values = [data.assetCode, data.name, data.area, data.latitude, data.longitude, data.flowCapacityLps, data.totalPumps, data.activePumps, data.powerSource, data.generatorBackup, data.status, data.condition, data.nextInspectionDue, id];
      const result = await pool.query(q, values);
      return res.json(result.rows[0]);
    }

    if (type === 'pipe') {
      const q = `
        UPDATE pipe_assets SET
          asset_code = $1, name = $2, area = $3, from_asset_id = $4, to_asset_id = $5,
          length_meters = $6, diameter_mm = $7, material = $8, slope_percent = $9, status = $10, condition = $11, next_inspection_due = $12
        WHERE id = $13 RETURNING *;
      `;
      const values = [data.assetCode, data.name, data.area, data.fromAssetId, data.toAssetId, data.lengthMeters, data.diameterMm, data.material, data.slopePercent, data.status, data.condition, data.nextInspectionDue, id];
      const result = await pool.query(q, values);
      return res.json(result.rows[0]);
    }

    res.status(400).json({ error: 'Invalid asset type' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 5. DELETE ASSET ENDPOINT
// --------------------------------------------------------------------
app.delete('/api/assets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete from all asset tables
    await pool.query('DELETE FROM pipe_assets WHERE from_asset_id = $1 OR to_asset_id = $1 OR id = $1;', [id]);
    await pool.query('DELETE FROM manhole_assets WHERE id = $1;', [id]);
    await pool.query('DELETE FROM pump_station_assets WHERE id = $1;', [id]);
    res.json({ message: 'Asset deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 6. INSPECTION RECORDS ENDPOINTS
// --------------------------------------------------------------------
app.get('/api/inspections', async (req, res) => {
  try {
    const q = 'SELECT id, asset_id AS "assetId", asset_code AS "assetCode", asset_type AS "assetType", inspector_name AS "inspectorName", inspection_date AS "inspectionDate", condition, issue_category AS "issueCategory", notes, action_required AS "actionRequired", photo_url AS "photoUrl" FROM inspection_records ORDER BY inspection_date DESC;';
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inspections', async (req, res) => {
  const data = req.body;
  try {
    const q = `
      INSERT INTO inspection_records 
      (id, asset_id, asset_code, asset_type, inspector_name, inspection_date, condition, issue_category, notes, action_required, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      data.id || `insp-${Date.now()}`,
      data.assetId,
      data.assetCode,
      data.assetType || 'Manhole',
      data.inspectorName,
      data.inspectionDate || new Date().toISOString().split('T')[0],
      data.condition || 'Good',
      data.issueCategory || 'None',
      data.notes || '',
      data.actionRequired || 'None',
      data.photoUrl || ''
    ];
    const result = await pool.query(q, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inspections/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const q = `
      UPDATE inspection_records SET
        asset_id = $1, asset_code = $2, asset_type = $3, inspector_name = $4, inspection_date = $5,
        condition = $6, issue_category = $7, notes = $8, action_required = $9, photo_url = $10
      WHERE id = $11 RETURNING *;
    `;
    const values = [data.assetId, data.assetCode, data.assetType, data.inspectorName, data.inspectionDate, data.condition, data.issueCategory, data.notes, data.actionRequired, data.photoUrl, id];
    const result = await pool.query(q, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inspections/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM inspection_records WHERE id = $1;', [id]);
    res.json({ message: 'Inspection deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 7. USER PROFILES (RBAC) ENDPOINTS
// --------------------------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const q = 'SELECT id, full_name AS "fullName", email, role, department, phone, status, avatar_url AS "avatarUrl" FROM user_profiles ORDER BY created_at DESC;';
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const data = req.body;
  try {
    const q = `
      INSERT INTO user_profiles 
      (id, full_name, email, role, department, phone, status, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      data.id || `usr-${Date.now()}`,
      data.fullName,
      data.email,
      data.role || 'Technician',
      data.department || 'Operasional & Pemeliharaan',
      data.phone || '',
      data.status || 'Active',
      data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    ];
    const result = await pool.query(q, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const q = `
      UPDATE user_profiles SET
        full_name = $1, email = $2, role = $3, department = $4, phone = $5, status = $6, avatar_url = $7
      WHERE id = $8 RETURNING *;
    `;
    const values = [data.fullName, data.email, data.role, data.department, data.phone, data.status, data.avatarUrl, id];
    const result = await pool.query(q, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM user_profiles WHERE id = $1;', [id]);
    res.json({ message: 'User profile deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 8. AUTHENTICATION REST API ENDPOINTS (STRICT ADMIN APPROVAL)
// --------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const q = 'SELECT id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar" FROM user_profiles WHERE LOWER(email) = LOWER($1);';
    const result = await pool.query(q, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email tidak terdaftar' });
    }
    const user = result.rows[0];
    if (user.status === 'Pending' || user.status === 'Pending Approval') {
      return res.status(403).json({ error: 'Akun Anda sedang menunggu persetujuan dari Administrator (Pending Approval). Harap hubungi Admin untuk pengaktifan.' });
    }
    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Akun Anda dalam status tidak aktif (Inactive). Silakan hubungi Admin.' });
    }

    res.json({ message: 'Login berhasil', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, department, role } = req.body;
  try {
    const checkQ = 'SELECT id FROM user_profiles WHERE LOWER(email) = LOWER($1);';
    const checkRes = await pool.query(checkQ, [email]);
    if (checkRes.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' });
    }

    const newId = `usr-${Date.now()}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;
    const q = `
      INSERT INTO user_profiles (id, full_name, email, role, department, status, avatar_url)
      VALUES ($1, $2, $3, $4, $5, 'Pending Approval', $6)
      RETURNING id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar";
    `;
    const values = [newId, fullName, email, role || 'Technician', department || 'Operasional', avatarUrl];
    const result = await pool.query(q, values);
    res.status(201).json({
      message: 'Pendaftaran berhasil! Akun Anda saat ini dalam status Pending Approval. Harap tunggu persetujuan Administrator sebelum login.',
      user: result.rows[0],
      pending: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { name, email, photoUrl } = req.body;
  try {
    const checkQ = 'SELECT id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar" FROM user_profiles WHERE LOWER(email) = LOWER($1);';
    const checkRes = await pool.query(checkQ, [email]);
    
    if (checkRes.rows.length > 0) {
      const existingUser = checkRes.rows[0];
      if (existingUser.status === 'Pending' || existingUser.status === 'Pending Approval') {
        return res.status(403).json({ error: `Akun Google Anda (${email}) sedang menunggu persetujuan dari Administrator (Pending Approval).` });
      }
      if (existingUser.status === 'Inactive') {
        return res.status(403).json({ error: `Akun Google Anda (${email}) dalam status tidak aktif.` });
      }
      return res.json({ message: 'Login Google berhasil', user: existingUser });
    }

    // Default admin angga.purbaya@gmail.com is Active automatically
    const isDefaultAdmin = email.toLowerCase() === 'angga.purbaya@gmail.com';
    const initialStatus = isDefaultAdmin ? 'Active' : 'Pending Approval';
    const defaultRole = (email.toLowerCase().includes('admin') || isDefaultAdmin) ? 'Admin' : 'Engineer';

    const newId = `usr-google-${Date.now().toString().slice(-4)}`;
    const q = `
      INSERT INTO user_profiles (id, full_name, email, role, department, status, avatar_url)
      VALUES ($1, $2, $3, $4, 'Google Single Sign-On', $5, $6)
      RETURNING id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar";
    `;
    const values = [newId, name, email, defaultRole, initialStatus, photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`];
    const result = await pool.query(q, values);

    if (!isDefaultAdmin) {
      return res.status(201).json({
        message: 'Registrasi via Google berhasil! Akun Anda membutuhkan persetujuan Administrator sebelum dapat masuk.',
        user: result.rows[0],
        pending: true
      });
    }

    res.status(201).json({ message: 'Registrasi Google berhasil', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SewerBITA Production REST API Server running on port ${PORT}`);
});
