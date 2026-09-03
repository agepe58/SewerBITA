const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------
// 0. HEALTH CHECK ROUTE ALIAS
// --------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// PostgreSQL Connection Pool Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://sewerbita_admin:sewerbita_pass@postgres-sewerbita:5432/sewerbita_db',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test Database Connection and Auto-Initialize Required Tables
const initDb = async () => {
  try {
    // 1. Enable PostGIS
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    } catch (e) {
      console.warn('PostGIS extension check notice:', e.message);
    }

    // 2. User Profiles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
          id VARCHAR(100) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'Technician',
          department VARCHAR(100) NOT NULL DEFAULT 'Operasional & Pemeliharaan',
          phone VARCHAR(50),
          status VARCHAR(50) NOT NULL DEFAULT 'Pending Approval',
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Manhole Assets Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manhole_assets (
          id VARCHAR(100) PRIMARY KEY,
          asset_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          area VARCHAR(100) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          depth_meters DOUBLE PRECISION NOT NULL DEFAULT 2.0,
          diameter_mm INT NOT NULL DEFAULT 600,
          material VARCHAR(100) NOT NULL DEFAULT 'Precast Concrete',
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          condition VARCHAR(50) NOT NULL DEFAULT 'Good',
          next_inspection_due DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
          geom GEOMETRY(Point, 4326),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Pump Station Assets Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pump_station_assets (
          id VARCHAR(100) PRIMARY KEY,
          asset_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          area VARCHAR(100) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          flow_capacity_lps DOUBLE PRECISION NOT NULL DEFAULT 150.0,
          total_pumps INT NOT NULL DEFAULT 3,
          active_pumps INT NOT NULL DEFAULT 2,
          power_source VARCHAR(100) NOT NULL DEFAULT 'PLN Grid + Genset',
          generator_backup VARCHAR(100) NOT NULL DEFAULT '150 kVA Genset',
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          condition VARCHAR(50) NOT NULL DEFAULT 'Good',
          next_inspection_due DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
          geom GEOMETRY(Point, 4326),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Pipe Assets Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pipe_assets (
          id VARCHAR(100) PRIMARY KEY,
          asset_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          area VARCHAR(100) NOT NULL,
          from_asset_id VARCHAR(100) NOT NULL,
          to_asset_id VARCHAR(100) NOT NULL,
          length_meters DOUBLE PRECISION NOT NULL DEFAULT 50.0,
          diameter_mm INT NOT NULL DEFAULT 300,
          material VARCHAR(100) NOT NULL DEFAULT 'HDPE',
          slope_percent DOUBLE PRECISION NOT NULL DEFAULT 0.5,
          pipe_category VARCHAR(50) DEFAULT 'gravity',
          waypoints JSONB DEFAULT '[]'::jsonb,
          pressure_bar DOUBLE PRECISION DEFAULT 0.0,
          destination_wwtp_name VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          condition VARCHAR(50) NOT NULL DEFAULT 'Good',
          next_inspection_due DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
          geom GEOMETRY(LineString, 4326),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Migration queries for existing pipe_assets tables
      await pool.query("ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS pipe_category VARCHAR(50) DEFAULT 'gravity';");
      await pool.query("ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS waypoints JSONB DEFAULT '[]'::jsonb;");
      await pool.query("ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS pressure_bar DOUBLE PRECISION DEFAULT 0.0;");
      await pool.query("ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS destination_wwtp_name VARCHAR(255);");
    `);

    // 5.5 WTP Assets (Water Treatment Plant / IPA Air Bersih)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wtp_assets (
          id VARCHAR(100) PRIMARY KEY,
          asset_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          area VARCHAR(100) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          production_capacity_lps DOUBLE PRECISION NOT NULL DEFAULT 500.0,
          raw_water_source VARCHAR(255) NOT NULL DEFAULT 'Sungai Citarum / Waduk',
          water_quality_status VARCHAR(100) NOT NULL DEFAULT 'Safe - Permenkes 2023',
          reservoir_capacity_m3 DOUBLE PRECISION DEFAULT 5000.0,
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          condition VARCHAR(50) NOT NULL DEFAULT 'Good',
          next_inspection_due DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
          geom GEOMETRY(Point, 4326),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5.6 Water Accessory & Valve Assets (Air Release Valve, Dresser Joint, Gate Valve, Tee)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_accessory_assets (
          id VARCHAR(100) PRIMARY KEY,
          asset_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          area VARCHAR(100) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          accessory_type VARCHAR(50) NOT NULL DEFAULT 'air_valve',
          system_category VARCHAR(50) DEFAULT 'clean_water',
          pipe_id VARCHAR(100),
          diameter_mm INT NOT NULL DEFAULT 150,
          pressure_bar DOUBLE PRECISION DEFAULT 6.0,
          elevation_meters DOUBLE PRECISION DEFAULT 15.0,
          operating_status VARCHAR(50) NOT NULL DEFAULT 'Active',
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          condition VARCHAR(50) NOT NULL DEFAULT 'Good',
          next_inspection_due DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
          geom GEOMETRY(Point, 4326),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS system_category VARCHAR(50) DEFAULT 'clean_water';
    `);

    // 5.7 Grease Trap Pre-treatment Assets (Perangkap Lemak Inlet Manhole)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grease_trap_assets (
          id VARCHAR(100) PRIMARY KEY,
          asset_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          area VARCHAR(100) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          capacity_liters DOUBLE PRECISION NOT NULL DEFAULT 500.0,
          chamber_count INT NOT NULL DEFAULT 3,
          outlet_manhole_id VARCHAR(100),
          cleaning_frequency_days INT NOT NULL DEFAULT 30,
          grease_level_percent DOUBLE PRECISION DEFAULT 20.0,
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          condition VARCHAR(50) NOT NULL DEFAULT 'Good',
          next_inspection_due DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
          geom GEOMETRY(Point, 4326),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Inspection Records Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inspection_records (
          id VARCHAR(100) PRIMARY KEY,
          asset_id VARCHAR(100) NOT NULL,
          asset_code VARCHAR(50) NOT NULL,
          asset_type VARCHAR(50) NOT NULL DEFAULT 'Manhole',
          inspector_name VARCHAR(255) NOT NULL,
          inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
          condition VARCHAR(50) NOT NULL DEFAULT 'Good',
          issue_category VARCHAR(100),
          notes TEXT,
          action_required TEXT,
          photo_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Drop Legacy/Orphan Tables if they exist
    await pool.query(`
      DROP TABLE IF EXISTS work_orders CASCADE;
      DROP TABLE IF EXISTS maintenance_projects CASCADE;
      DROP TABLE IF EXISTS daily_reports CASCADE;
      DROP TABLE IF EXISTS activity_logs CASCADE;
    `);

    // 8. Backup History Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS backup_history (
          id VARCHAR(100) PRIMARY KEY,
          execution_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          backup_type VARCHAR(50) NOT NULL DEFAULT 'FULL',
          destination VARCHAR(100) NOT NULL DEFAULT 'Synology NAS',
          filename VARCHAR(255) NOT NULL,
          file_size VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Sukses',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8.1 System Backup & Synology NAS Configuration Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_backup_config (
          id VARCHAR(50) PRIMARY KEY DEFAULT 'main_config',
          nas_protocol VARCHAR(100) DEFAULT 'Synology WebDAV',
          nas_ip VARCHAR(100) DEFAULT '103.165.253.150',
          nas_port VARCHAR(50) DEFAULT '5005',
          nas_user VARCHAR(100) DEFAULT 'Maia',
          nas_password VARCHAR(255) DEFAULT '••••••••',
          use_ssl BOOLEAN DEFAULT FALSE,
          target_folder VARCHAR(255) DEFAULT '/sewer_bita',
          apk_url TEXT DEFAULT '',
          main_storage_destination VARCHAR(100) DEFAULT 'Synology NAS',
          auto_backup_enabled BOOLEAN DEFAULT TRUE,
          schedule_cron VARCHAR(100) DEFAULT 'Setiap Hari (23:00 WIB)',
          retention_days INT DEFAULT 30,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. Purge Any Legacy Demo Admin User
    await pool.query("DELETE FROM user_profiles WHERE id = 'usr-admin-01' OR LOWER(email) = 'angga.purbaya@gmail.com';");

    // 13. Auto-fix & Distribute Zero or Overlapping Asset Coordinates
    await pool.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rnum
        FROM pump_station_assets
        WHERE latitude = 0 OR longitude = 0 OR (latitude = -6.444 AND longitude = 107.452)
      )
      UPDATE pump_station_assets ps
      SET latitude = -6.444 + ((rnum - 1) * 0.003),
          longitude = 107.452 + ((rnum - 1) * 0.004)
      FROM ranked
      WHERE ps.id = ranked.id;
    `);

    await pool.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rnum
        FROM manhole_assets
        WHERE latitude = 0 OR longitude = 0 OR (latitude = -6.444 AND longitude = 107.452)
      )
      UPDATE manhole_assets mh
      SET latitude = -6.444 + ((rnum - 1) * 0.002),
          longitude = 107.452 + ((rnum - 1) * 0.0025)
      FROM ranked
      WHERE mh.id = ranked.id;
    `);

    console.log('✅ PostgreSQL Schema & Tables (work_orders, projects, reports, assets, users) initialized for production!');
  } catch (err) {
    console.error('⚠️ DB Init Warning:', err.message);
  }
};

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL Database:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL + PostGIS Database successfully!');
    release();
    initDb();
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
    const [manholesRes, pumpStationsRes, pipesRes, wtpsRes, accessoriesRes, greaseTrapsRes] = await Promise.all([
      pool.query('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, depth_meters AS "depthMeters", diameter_mm AS "diameterMm", material, status, condition, next_inspection_due AS "nextInspectionDue" FROM manhole_assets ORDER BY created_at DESC;'),
      pool.query('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, flow_capacity_lps AS "flowCapacityLps", total_pumps AS "totalPumps", active_pumps AS "activePumps", power_source AS "powerSource", generator_backup AS "generatorBackup", status, condition, next_inspection_due AS "nextInspectionDue" FROM pump_station_assets ORDER BY created_at DESC;'),
      pool.query('SELECT id, asset_code AS "assetCode", name, area, from_asset_id AS "fromAssetId", to_asset_id AS "toAssetId", length_meters AS "lengthMeters", diameter_mm AS "diameterMm", material, slope_percent AS "slopePercent", pipe_category AS "pipeCategory", waypoints, pressure_bar AS "pressureBar", destination_wwtp_name AS "destinationWwtpName", status, condition, next_inspection_due AS "nextInspectionDue" FROM pipe_assets ORDER BY created_at DESC;'),
      pool.query('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, production_capacity_lps AS "productionCapacityLps", raw_water_source AS "rawWaterSource", water_quality_status AS "waterQualityStatus", reservoir_capacity_m3 AS "reservoirCapacityM3", status, condition, next_inspection_due AS "nextInspectionDue" FROM wtp_assets ORDER BY created_at DESC;'),
      pool.query('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, accessory_type AS "accessoryType", system_category AS "systemCategory", pipe_id AS "pipeId", diameter_mm AS "diameterMm", pressure_bar AS "pressureBar", elevation_meters AS "elevationMeters", operating_status AS "operatingStatus", status, condition, next_inspection_due AS "nextInspectionDue" FROM water_accessory_assets ORDER BY created_at DESC;'),
      pool.query('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, capacity_liters AS "capacityLiters", chamber_count AS "chamberCount", outlet_manhole_id AS "outletManholeId", cleaning_frequency_days AS "cleaningFrequencyDays", grease_level_percent AS "greaseLevelPercent", status, condition, next_inspection_due AS "nextInspectionDue" FROM grease_trap_assets ORDER BY created_at DESC;')
    ]);

    res.json({
      manholes: manholesRes.rows,
      pumpStations: pumpStationsRes.rows,
      pipes: pipesRes.rows,
      wtps: wtpsRes.rows,
      waterAccessories: accessoriesRes.rows,
      greaseTraps: greaseTrapsRes.rows
    });
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 3. CREATE ASSET ENDPOINT (WITH PERSISTENT UPSERT)
// --------------------------------------------------------------------
app.post('/api/assets', async (req, res) => {
  const { type, data } = req.body;
  try {
    if (type === 'manhole') {
      const q = `
        INSERT INTO manhole_assets 
        (id, asset_code, name, area, latitude, longitude, depth_meters, diameter_mm, material, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          asset_code = EXCLUDED.asset_code,
          name = EXCLUDED.name,
          area = EXCLUDED.area,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          depth_meters = EXCLUDED.depth_meters,
          diameter_mm = EXCLUDED.diameter_mm,
          material = EXCLUDED.material,
          status = EXCLUDED.status,
          condition = EXCLUDED.condition,
          next_inspection_due = EXCLUDED.next_inspection_due
        RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, depth_meters AS "depthMeters", diameter_mm AS "diameterMm", material, status, condition, next_inspection_due AS "nextInspectionDue";
      `;
      const rawLat = data.latitude ?? data.coordinates?.lat;
      const rawLng = data.longitude ?? data.coordinates?.lng;
      const parsedLat = Number(rawLat);
      const parsedLng = Number(rawLng);
      const finalLat = !isNaN(parsedLat) && parsedLat !== 0 ? parsedLat : -6.444;
      const finalLng = !isNaN(parsedLng) && parsedLng !== 0 ? parsedLng : 107.452;

      const values = [
        data.id || `mh-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        finalLat,
        finalLng,
        Number(data.depthMeters) || 2.0,
        Number(data.diameterMm) || 600,
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
        ON CONFLICT (id) DO UPDATE SET
          asset_code = EXCLUDED.asset_code,
          name = EXCLUDED.name,
          area = EXCLUDED.area,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          flow_capacity_lps = EXCLUDED.flow_capacity_lps,
          total_pumps = EXCLUDED.total_pumps,
          active_pumps = EXCLUDED.active_pumps,
          power_source = EXCLUDED.power_source,
          generator_backup = EXCLUDED.generator_backup,
          status = EXCLUDED.status,
          condition = EXCLUDED.condition,
          next_inspection_due = EXCLUDED.next_inspection_due
        RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, flow_capacity_lps AS "flowCapacityLps", total_pumps AS "totalPumps", active_pumps AS "activePumps", power_source AS "powerSource", generator_backup AS "generatorBackup", status, condition, next_inspection_due AS "nextInspectionDue";
      `;
      const rawLat = data.latitude ?? data.coordinates?.lat;
      const rawLng = data.longitude ?? data.coordinates?.lng;
      const parsedLat = Number(rawLat);
      const parsedLng = Number(rawLng);
      const finalLat = !isNaN(parsedLat) && parsedLat !== 0 ? parsedLat : -6.444;
      const finalLng = !isNaN(parsedLng) && parsedLng !== 0 ? parsedLng : 107.452;

      const values = [
        data.id || `ps-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        finalLat,
        finalLng,
        Number(data.flowCapacityLps ?? data.capacityLps) || 150.0,
        Number(data.totalPumps ?? data.pumpCount) || 3,
        Number(data.activePumps) || 2,
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
        (id, asset_code, name, area, from_asset_id, to_asset_id, length_meters, diameter_mm, material, slope_percent, pipe_category, waypoints, pressure_bar, destination_wwtp_name, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          asset_code = EXCLUDED.asset_code,
          name = EXCLUDED.name,
          area = EXCLUDED.area,
          from_asset_id = EXCLUDED.from_asset_id,
          to_asset_id = EXCLUDED.to_asset_id,
          length_meters = EXCLUDED.length_meters,
          diameter_mm = EXCLUDED.diameter_mm,
          material = EXCLUDED.material,
          slope_percent = EXCLUDED.slope_percent,
          pipe_category = EXCLUDED.pipe_category,
          waypoints = EXCLUDED.waypoints,
          pressure_bar = EXCLUDED.pressure_bar,
          destination_wwtp_name = EXCLUDED.destination_wwtp_name,
          status = EXCLUDED.status,
          condition = EXCLUDED.condition,
          next_inspection_due = EXCLUDED.next_inspection_due
        RETURNING id, asset_code AS "assetCode", name, area, from_asset_id AS "fromAssetId", to_asset_id AS "toAssetId", length_meters AS "lengthMeters", diameter_mm AS "diameterMm", material, slope_percent AS "slopePercent", pipe_category AS "pipeCategory", waypoints, pressure_bar AS "pressureBar", destination_wwtp_name AS "destinationWwtpName", status, condition, next_inspection_due AS "nextInspectionDue";
      `;
      const values = [
        data.id || `p-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        data.fromAssetId,
        data.toAssetId,
        Number(data.lengthMeters) || 50.0,
        Number(data.diameterMm) || 300,
        data.material || 'HDPE',
        Number(data.slopePercent) || 0.5,
        data.pipeCategory || 'gravity',
        JSON.stringify(data.waypoints || []),
        Number(data.pressureBar) || 0.0,
        data.destinationWwtpName || '',
        data.status || 'Active',
        data.condition || 'Good',
        data.nextInspectionDue || new Date().toISOString().split('T')[0]
      ];
      const result = await pool.query(q, values);
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'wtp') {
      const q = `
        INSERT INTO wtp_assets 
        (id, asset_code, name, area, latitude, longitude, production_capacity_lps, raw_water_source, water_quality_status, reservoir_capacity_m3, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          asset_code = EXCLUDED.asset_code,
          name = EXCLUDED.name,
          area = EXCLUDED.area,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          production_capacity_lps = EXCLUDED.production_capacity_lps,
          raw_water_source = EXCLUDED.raw_water_source,
          water_quality_status = EXCLUDED.water_quality_status,
          reservoir_capacity_m3 = EXCLUDED.reservoir_capacity_m3,
          status = EXCLUDED.status,
          condition = EXCLUDED.condition,
          next_inspection_due = EXCLUDED.next_inspection_due
        RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, production_capacity_lps AS "productionCapacityLps", raw_water_source AS "rawWaterSource", water_quality_status AS "waterQualityStatus", reservoir_capacity_m3 AS "reservoirCapacityM3", status, condition, next_inspection_due AS "nextInspectionDue";
      `;
      const values = [
        data.id || `wtp-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        Number(data.latitude ?? data.coordinates?.lat) || -6.444,
        Number(data.longitude ?? data.coordinates?.lng) || 107.452,
        Number(data.productionCapacityLps) || 500.0,
        data.rawWaterSource || 'Sungai Citarum',
        data.waterQualityStatus || 'Safe - Permenkes 2023',
        Number(data.reservoirCapacityM3) || 5000.0,
        data.status || 'Active',
        data.condition || 'Good',
        data.nextInspectionDue || new Date().toISOString().split('T')[0]
      ];
      const result = await pool.query(q, values);
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'water_accessory') {
      const q = `
        INSERT INTO water_accessory_assets 
        (id, asset_code, name, area, latitude, longitude, accessory_type, system_category, pipe_id, diameter_mm, pressure_bar, elevation_meters, operating_status, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          asset_code = EXCLUDED.asset_code,
          name = EXCLUDED.name,
          area = EXCLUDED.area,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          accessory_type = EXCLUDED.accessory_type,
          system_category = EXCLUDED.system_category,
          pipe_id = EXCLUDED.pipe_id,
          diameter_mm = EXCLUDED.diameter_mm,
          pressure_bar = EXCLUDED.pressure_bar,
          elevation_meters = EXCLUDED.elevation_meters,
          operating_status = EXCLUDED.operating_status,
          status = EXCLUDED.status,
          condition = EXCLUDED.condition,
          next_inspection_due = EXCLUDED.next_inspection_due
        RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, accessory_type AS "accessoryType", system_category AS "systemCategory", pipe_id AS "pipeId", diameter_mm AS "diameterMm", pressure_bar AS "pressureBar", elevation_meters AS "elevationMeters", operating_status AS "operatingStatus", status, condition, next_inspection_due AS "nextInspectionDue";
      `;
      const values = [
        data.id || `acc-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        Number(data.latitude ?? data.coordinates?.lat) || -6.444,
        Number(data.longitude ?? data.coordinates?.lng) || 107.452,
        data.accessoryType || 'air_valve',
        data.systemCategory || 'clean_water',
        data.pipeId || '',
        Number(data.diameterMm) || 150,
        Number(data.pressureBar) || 6.0,
        Number(data.elevationMeters) || 15.0,
        data.operatingStatus || 'Normal Open',
        data.status || 'Active',
        data.condition || 'Good',
        data.nextInspectionDue || new Date().toISOString().split('T')[0]
      ];
      const result = await pool.query(q, values);
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'grease_trap') {
      const q = `
        INSERT INTO grease_trap_assets 
        (id, asset_code, name, area, latitude, longitude, capacity_liters, chamber_count, outlet_manhole_id, cleaning_frequency_days, grease_level_percent, status, condition, next_inspection_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          asset_code = EXCLUDED.asset_code,
          name = EXCLUDED.name,
          area = EXCLUDED.area,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          capacity_liters = EXCLUDED.capacity_liters,
          chamber_count = EXCLUDED.chamber_count,
          outlet_manhole_id = EXCLUDED.outlet_manhole_id,
          cleaning_frequency_days = EXCLUDED.cleaning_frequency_days,
          grease_level_percent = EXCLUDED.grease_level_percent,
          status = EXCLUDED.status,
          condition = EXCLUDED.condition,
          next_inspection_due = EXCLUDED.next_inspection_due
        RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, capacity_liters AS "capacityLiters", chamber_count AS "chamberCount", outlet_manhole_id AS "outletManholeId", cleaning_frequency_days AS "cleaningFrequencyDays", grease_level_percent AS "greaseLevelPercent", status, condition, next_inspection_due AS "nextInspectionDue";
      `;
      const values = [
        data.id || `gt-${Date.now()}`,
        data.assetCode,
        data.name,
        data.area,
        Number(data.latitude ?? data.coordinates?.lat) || -6.444,
        Number(data.longitude ?? data.coordinates?.lng) || 107.452,
        Number(data.capacityLiters) || 500.0,
        Number(data.chamberCount) || 3,
        data.outletManholeId || '',
        Number(data.cleaningFrequencyDays) || 30,
        Number(data.greaseLevelPercent) || 20.0,
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
          length_meters = $6, diameter_mm = $7, material = $8, slope_percent = $9,
          pipe_category = $10, waypoints = $11, pressure_bar = $12, destination_wwtp_name = $13,
          status = $14, condition = $15, next_inspection_due = $16
        WHERE id = $17 RETURNING *;
      `;
      const values = [
        data.assetCode, data.name, data.area, data.fromAssetId, data.toAssetId,
        data.lengthMeters, data.diameterMm, data.material, data.slopePercent,
        data.pipeCategory || 'gravity', JSON.stringify(data.waypoints || []), Number(data.pressureBar) || 0.0, data.destinationWwtpName || '',
        data.status, data.condition, data.nextInspectionDue, id
      ];
      const result = await pool.query(q, values);
      return res.json(result.rows[0]);
    }

    if (type === 'wtp') {
      const q = `
        UPDATE wtp_assets SET
          asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
          production_capacity_lps = $6, raw_water_source = $7, water_quality_status = $8, reservoir_capacity_m3 = $9, status = $10, condition = $11, next_inspection_due = $12
        WHERE id = $13 RETURNING *;
      `;
      const values = [data.assetCode, data.name, data.area, data.latitude, data.longitude, data.productionCapacityLps, data.rawWaterSource, data.waterQualityStatus, data.reservoirCapacityM3, data.status, data.condition, data.nextInspectionDue, id];
      const result = await pool.query(q, values);
      return res.json(result.rows[0]);
    }

    if (type === 'water_accessory') {
      const q = `
        UPDATE water_accessory_assets SET
          asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
          accessory_type = $6, system_category = $7, pipe_id = $8, diameter_mm = $9, pressure_bar = $10, elevation_meters = $11, operating_status = $12, status = $13, condition = $14, next_inspection_due = $15
        WHERE id = $16 RETURNING *;
      `;
      const values = [data.assetCode, data.name, data.area, data.latitude, data.longitude, data.accessoryType, data.systemCategory, data.pipeId, data.diameterMm, data.pressureBar, data.elevationMeters, data.operatingStatus, data.status, data.condition, data.nextInspectionDue, id];
      const result = await pool.query(q, values);
      return res.json(result.rows[0]);
    }

    if (type === 'grease_trap') {
      const q = `
        UPDATE grease_trap_assets SET
          asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
          capacity_liters = $6, chamber_count = $7, outlet_manhole_id = $8, cleaning_frequency_days = $9, grease_level_percent = $10, status = $11, condition = $12, next_inspection_due = $13
        WHERE id = $14 RETURNING *;
      `;
      const values = [data.assetCode, data.name, data.area, data.latitude, data.longitude, data.capacityLiters, data.chamberCount, data.outletManholeId, data.cleaningFrequencyDays, data.greaseLevelPercent, data.status, data.condition, data.nextInspectionDue, id];
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
  const userRole = req.headers['x-user-role'];
  if (userRole && userRole !== 'Admin' && userRole !== 'Engineer') {
    return res.status(403).json({ error: 'RBAC Access Denied: Hapus aset hanya diizinkan untuk Admin dan Engineer.' });
  }

  try {
    // Delete from all asset tables
    await pool.query('DELETE FROM pipe_assets WHERE from_asset_id = $1 OR to_asset_id = $1 OR id = $1;', [id]);
    await pool.query('DELETE FROM manhole_assets WHERE id = $1;', [id]);
    await pool.query('DELETE FROM pump_station_assets WHERE id = $1;', [id]);
    await pool.query('DELETE FROM wtp_assets WHERE id = $1;', [id]);
    await pool.query('DELETE FROM water_accessory_assets WHERE id = $1;', [id]);
    await pool.query('DELETE FROM grease_trap_assets WHERE id = $1;', [id]);
    res.json({ message: 'Asset deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 5.5 SCHEDULE MANHOLE INSPECTION ENDPOINT
// --------------------------------------------------------------------
app.post('/api/assets/schedule-inspection', async (req, res) => {
  const { targetType, targetId, area, nextInspectionDue } = req.body;
  try {
    if (!nextInspectionDue) {
      return res.status(400).json({ error: 'Tanggal jadwal inspeksi (nextInspectionDue) wajib diisi.' });
    }

    let result;
    if (targetType === 'single' && targetId) {
      result = await pool.query(
        'UPDATE manhole_assets SET next_inspection_due = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, asset_code, name, next_inspection_due;',
        [nextInspectionDue, targetId]
      );
    } else if (targetType === 'area' && area) {
      result = await pool.query(
        'UPDATE manhole_assets SET next_inspection_due = $1, updated_at = CURRENT_TIMESTAMP WHERE area = $2 RETURNING id, asset_code, name, next_inspection_due;',
        [nextInspectionDue, area]
      );
    } else {
      result = await pool.query(
        'UPDATE manhole_assets SET next_inspection_due = $1, updated_at = CURRENT_TIMESTAMP RETURNING id, asset_code, name, next_inspection_due;',
        [nextInspectionDue]
      );
    }

    res.json({
      message: 'Jadwal inspeksi berhasil diperbarui!',
      updatedCount: result.rows.length,
      updatedAssets: result.rows
    });
  } catch (err) {
    console.error('Error scheduling inspection:', err);
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
// 6. USER PROFILES (RBAC) ENDPOINTS
// --------------------------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const q = 'SELECT id, full_name AS "name", email, role, department, phone, COALESCE(status, \'Active\') AS status, avatar_url AS "avatar" FROM user_profiles ORDER BY created_at DESC;';
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const data = req.body;
  try {
    const nameVal = data.name || data.fullName || 'User Baru';
    const emailVal = (data.email || '').trim().toLowerCase();
    const avatarVal = data.avatar || data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameVal)}`;
    const statusVal = data.status || 'Active';
    const roleVal = data.role || 'Technician';
    const deptVal = data.department || 'Operasional & Pemeliharaan';
    const phoneVal = data.phone || '';
    const idVal = data.id || `usr-${Date.now()}`;

    const q = `
      INSERT INTO user_profiles 
      (id, full_name, email, role, department, phone, status, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        phone = EXCLUDED.phone,
        status = EXCLUDED.status,
        avatar_url = EXCLUDED.avatar_url
      RETURNING id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar";
    `;
    const values = [idVal, nameVal, emailVal, roleVal, deptVal, phoneVal, statusVal, avatarVal];
    const result = await pool.query(q, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating/upserting user:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const nameVal = data.name || data.fullName || '';
    const emailVal = (data.email || '').trim().toLowerCase();
    const avatarVal = data.avatar || data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameVal)}`;
    const statusVal = data.status || 'Active';
    const roleVal = data.role || 'Technician';
    const deptVal = data.department || 'Operasional & Pemeliharaan';
    const phoneVal = data.phone || '';

    const q = `
      UPDATE user_profiles SET
        full_name = $1, email = $2, role = $3, department = $4, phone = $5, status = $6, avatar_url = $7
      WHERE id = $8 OR LOWER(email) = LOWER($2)
      RETURNING id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar";
    `;
    const values = [nameVal, emailVal, roleVal, deptVal, phoneVal, statusVal, avatarVal, id];
    const result = await pool.query(q, values);

    if (result.rows.length === 0) {
      // Auto-insert if not exists yet
      const insertQ = `
        INSERT INTO user_profiles (id, full_name, email, role, department, phone, status, avatar_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name, role = EXCLUDED.role, department = EXCLUDED.department,
          phone = EXCLUDED.phone, status = EXCLUDED.status, avatar_url = EXCLUDED.avatar_url
        RETURNING id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar";
      `;
      const insertRes = await pool.query(insertQ, [id, nameVal, emailVal, roleVal, deptVal, phoneVal, statusVal, avatarVal]);
      return res.json(insertRes.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers['x-user-role'];
  if (userRole && userRole !== 'Admin') {
    return res.status(403).json({ error: 'RBAC Access Denied: Hapus akun pengguna hanya diizinkan untuk Admin.' });
  }

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
    const normalizedEmail = (email || '').trim().toLowerCase();
    const q = 'SELECT id, full_name AS "name", email, role, department, phone, COALESCE(status, \'Active\') AS status, avatar_url AS "avatar" FROM user_profiles WHERE LOWER(email) = LOWER($1);';
    const result = await pool.query(q, [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password tidak terdaftar.' });
    }
    const user = result.rows[0];
    if (user.status === 'Pending' || user.status === 'Pending Approval') {
      return res.status(403).json({ error: 'Akun Anda belum disetujui oleh Administrator (Pending Approval). Harap hubungi Admin untuk pengaktifan.' });
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Alamat email tidak valid. Wajib menggunakan format email sah (contoh: nama@perusahaan.com).' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const checkQ = 'SELECT id, status FROM user_profiles WHERE LOWER(email) = LOWER($1);';
    const checkRes = await pool.query(checkQ, [normalizedEmail]);
    if (checkRes.rows.length > 0) {
      const existing = checkRes.rows[0];
      if (existing.status === 'Pending Approval' || existing.status === 'Pending') {
        return res.status(400).json({ error: 'Email sudah terdaftar dan saat ini sedang menunggu persetujuan Administrator.' });
      }
      return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' });
    }

    const newId = `usr-${Date.now()}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;
    const q = `
      INSERT INTO user_profiles (id, full_name, email, role, department, status, avatar_url)
      VALUES ($1, $2, $3, $4, $5, 'Pending Approval', $6)
      RETURNING id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar";
    `;
    const values = [newId, fullName.trim(), normalizedEmail, role || 'Technician', department || 'Operasional', avatarUrl];
    const result = await pool.query(q, values);
    res.status(201).json({
      message: 'Pendaftaran akun berhasil! Akun Anda saat ini dalam status Pending Approval. Harap tunggu persetujuan Administrator sebelum login.',
      user: result.rows[0],
      pending: true
    });
  } catch (err) {
    console.error('Error in /api/auth/register:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  let { credential, name, email, photoUrl } = req.body;

  // If a Google ID Token (credential) is provided, verify it directly with Google!
  if (credential) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (payload) {
        email = payload.email;
        name = payload.name || name;
        photoUrl = payload.picture || photoUrl;
      }
    } catch (verifyErr) {
      console.warn('Google ID Token verification warning:', verifyErr.message);
    }
  }

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email Google wajib diisi.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const checkQ = 'SELECT id, full_name AS "name", email, role, department, phone, COALESCE(status, \'Pending Approval\') AS status, avatar_url AS "avatar" FROM user_profiles WHERE LOWER(email) = LOWER($1);';
    const checkRes = await pool.query(checkQ, [normalizedEmail]);
    
    if (checkRes.rows.length > 0) {
      const existingUser = checkRes.rows[0];
      if (existingUser.status === 'Pending' || existingUser.status === 'Pending Approval') {
        return res.status(403).json({
          error: `Akun Google Anda (${normalizedEmail}) sedang menunggu persetujuan dari Administrator (Pending Approval).`,
          user: existingUser,
          pending: true
        });
      }
      if (existingUser.status === 'Inactive') {
        return res.status(403).json({ error: `Akun Google Anda (${normalizedEmail}) dalam status tidak aktif.` });
      }
      return res.json({ message: 'Login Google berhasil', user: existingUser });
    }

    const initialStatus = 'Pending Approval';
    const defaultRole = normalizedEmail.includes('admin') ? 'Admin' : 'Engineer';

    const newId = `usr-google-${Date.now().toString().slice(-4)}`;
    const userName = (name && name.trim()) ? name.trim() : normalizedEmail.split('@')[0];
    const avatarUrl = photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

    const q = `
      INSERT INTO user_profiles (id, full_name, email, role, department, status, avatar_url)
      VALUES ($1, $2, $3, $4, 'Google Single Sign-On', $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url
      RETURNING id, full_name AS "name", email, role, department, phone, status, avatar_url AS "avatar";
    `;
    const values = [newId, userName, normalizedEmail, defaultRole, initialStatus, avatarUrl];
    const result = await pool.query(q, values);

    if (!isDefaultAdmin) {
      return res.status(403).json({
        error: `Pendaftaran via Google SSO berhasil! Akun Google Anda (${normalizedEmail}) telah terdaftar dan membutuhkan persetujuan Administrator sebelum dapat masuk.`,
        user: result.rows[0],
        pending: true
      });
    }

    res.status(201).json({ message: 'Registrasi Google berhasil', user: result.rows[0] });
  } catch (err) {
    console.error('Error in /api/auth/google:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 9. BACKUP & DISASTER RECOVERY ENDPOINTS (SYNOLOGY NAS & LOCAL DUMP)
// --------------------------------------------------------------------
const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  } catch (e) {
    console.warn('Backup dir create notice:', e.message);
  }
}

// Helper: Ping WebDAV Server via PROPFIND / OPTIONS
const pingWebDAV = (nasConfig) => {
  return new Promise((resolve) => {
    const { ip, port = 5005, username, password, useSsl = false, targetFolder = '/sewer_bita' } = nasConfig || {};
    if (!ip) return resolve({ success: false, error: 'IP Address Synology NAS belum dikonfigurasi' });

    const client = (useSsl || port === 5006 || port === '5006') ? https : http;
    let cleanFolder = (targetFolder || '/sewer_bita').replace(/\\/g, '/');
    if (!cleanFolder.startsWith('/')) cleanFolder = '/' + cleanFolder;

    const auth = 'Basic ' + Buffer.from(`${username || ''}:${password || ''}`).toString('base64');
    const options = {
      hostname: ip,
      port: parseInt(port, 10) || 5005,
      path: encodeURI(cleanFolder),
      method: 'PROPFIND',
      headers: {
        'Authorization': auth,
        'Depth': '0',
        'User-Agent': 'SewerBITA-WebDAV-Client/1.0'
      },
      timeout: 10000,
      rejectUnauthorized: false
    };

    const req = client.request(options, (res) => {
      res.resume();
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ success: true, statusCode: res.statusCode });
      } else if (res.statusCode === 207 || res.statusCode === 405) {
        resolve({ success: true, statusCode: res.statusCode });
      } else if (res.statusCode === 401) {
        resolve({ success: false, statusCode: 401, error: 'Autentikasi Synology gagal (401 Unauthorized). Cek username & password DSM.' });
      } else if (res.statusCode === 403) {
        resolve({ success: false, statusCode: 403, error: `Akses ditolak (403 Forbidden) pada folder '${cleanFolder}'. Pastikan user '${username}' memiliki akses Read/Write di Shared Folder Synology DSM.` });
      } else if (res.statusCode === 404) {
        resolve({ success: false, statusCode: 404, error: `Folder '${cleanFolder}' tidak ditemukan di Synology DSM (404 Not Found). Buat Shared Folder '${cleanFolder}' di Control Panel DiskStation.` });
      } else {
        resolve({ success: false, statusCode: res.statusCode, error: `Synology WebDAV HTTP ${res.statusCode} ${res.statusMessage || ''}` });
      }
    });

    req.on('error', (err) => resolve({ success: false, error: `Koneksi WebDAV ke ${ip}:${port} gagal: ${err.message}` }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, error: `Koneksi WebDAV ke ${ip}:${port} timeout (10s)` }); });
    req.end();
  });
};

// Helper: Ensure directory exists on Synology NAS via WebDAV MKCOL
const ensureWebDAVDirectory = async (nasConfig, folderPath) => {
  const { ip, port = 5005, username, password, useSsl = false } = nasConfig || {};
  if (!ip) return false;
  const client = (useSsl || port === 5006 || port === '5006') ? https : http;
  const auth = 'Basic ' + Buffer.from(`${username || ''}:${password || ''}`).toString('base64');
  
  const segments = (folderPath || '').split('/').filter(Boolean);
  let currentPath = '';

  for (const seg of segments) {
    currentPath += '/' + seg;
    await new Promise((resolve) => {
      const options = {
        hostname: ip,
        port: parseInt(port, 10) || 5005,
        path: encodeURI(currentPath),
        method: 'MKCOL',
        headers: { 'Authorization': auth, 'User-Agent': 'SewerBITA-WebDAV-Client/1.0' },
        timeout: 5000,
        rejectUnauthorized: false
      };
      const req = client.request(options, (res) => {
        res.resume();
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    });
  }
  return true;
};

// Helper: Upload file buffer to Synology NAS via WebDAV PUT
const uploadToWebDAV = async (nasConfig, filename, fileBuffer) => {
  const { ip, port = 5005, username, password, useSsl = false, targetFolder = '/sewer_bita' } = nasConfig || {};
  if (!ip) {
    return { success: false, error: 'IP Address Synology NAS belum dikonfigurasi' };
  }

  let cleanFolder = (targetFolder || '/sewer_bita').replace(/\\/g, '/');
  if (!cleanFolder.startsWith('/')) cleanFolder = '/' + cleanFolder;
  if (!cleanFolder.endsWith('/')) cleanFolder = cleanFolder + '/';

  // 1. Ensure target directory exists on Synology NAS
  await ensureWebDAVDirectory(nasConfig, cleanFolder);

  return new Promise((resolve) => {
    try {
      const client = (useSsl || port === 5006 || port === '5006') ? https : http;
      const targetPath = encodeURI(`${cleanFolder}${filename}`);
      const auth = 'Basic ' + Buffer.from(`${username || ''}:${password || ''}`).toString('base64');

      const options = {
        hostname: ip,
        port: parseInt(port, 10) || 5005,
        path: targetPath,
        method: 'PUT',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/gzip',
          'Content-Length': fileBuffer.length,
          'Overwrite': 'T',
          'User-Agent': 'SewerBITA-WebDAV-Client/1.0'
        },
        timeout: 15000,
        rejectUnauthorized: false
      };

      const req = client.request(options, (res) => {
        let respData = '';
        res.on('data', chunk => { respData += chunk; });
        res.on('end', () => {
          const targetUrl = `${useSsl ? 'https' : 'http'}://${ip}:${port}${targetPath}`;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, statusCode: res.statusCode, targetUrl, targetPath });
          } else if (res.statusCode === 201 || res.statusCode === 204) {
            resolve({ success: true, statusCode: res.statusCode, targetUrl, targetPath });
          } else if (res.statusCode === 401) {
            resolve({ success: false, statusCode: 401, error: 'Autentikasi Synology gagal (401 Unauthorized). Cek username & password DSM.' });
          } else if (res.statusCode === 403) {
            resolve({ success: false, statusCode: 403, error: `Akses ditolak (403 Forbidden) pada folder '${cleanFolder}'. Pastikan user '${username}' memiliki izin Read/Write di DSM Shared Folder.` });
          } else if (res.statusCode === 404) {
            resolve({ success: false, statusCode: 404, error: `Folder '${cleanFolder}' tidak ditemukan di WebDAV DiskStation (404 Not Found). Buat Shared Folder '${cleanFolder}' di Control Panel Synology DSM.` });
          } else if (res.statusCode === 405) {
            resolve({ success: false, statusCode: 405, error: `Synology WebDAV HTTP 405 Method Not Allowed. Pastikan paket WebDAV Server di Synology DSM telah diaktifkan dan folder '${cleanFolder}' dibuat sebagai Shared Folder.` });
          } else {
            resolve({ success: false, statusCode: res.statusCode, error: `Synology WebDAV HTTP ${res.statusCode} ${res.statusMessage || ''}` });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ success: false, error: `Koneksi WebDAV ke ${ip}:${port} gagal: ${err.message}` });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: `Koneksi WebDAV ke ${ip}:${port} timeout (15s)` });
      });

      req.write(fileBuffer);
      req.end();
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  });
};

// Helper: Generate SQL database dump string
const generateSqlDump = async () => {
  const tables = [
    'user_profiles',
    'manhole_assets',
    'pump_station_assets',
    'pipe_assets',
    'inspection_records',
    'backup_history'
  ];

  let sqlDump = `-- ====================================================================\n`;
  sqlDump += `-- SewerBITA Enterprise PostgreSQL Database Backup\n`;
  sqlDump += `-- Unit Pengolahan Air & Limbah Cair Kota Bukit Indah - PT. Bukit Indah Tirta Alam\n`;
  sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
  sqlDump += `-- ====================================================================\n\n`;

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT * FROM ${table};`);
      sqlDump += `-- Table: ${table} (${res.rows.length} records)\n`;
      if (res.rows.length > 0) {
        const rawColumns = Object.keys(res.rows[0]);
        // Exclude auto-computed PostGIS geometry column 'geom'
        const columns = rawColumns.filter(c => c !== 'geom');

        for (const row of res.rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });

          const updateCols = columns.filter(c => c !== 'id');
          let onConflictClause = 'ON CONFLICT (id) DO NOTHING';
          if (updateCols.length > 0) {
            onConflictClause = `ON CONFLICT (id) DO UPDATE SET ${updateCols.map(c => `${c} = EXCLUDED.${c}`).join(', ')}`;
          }

          sqlDump += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ${onConflictClause};\n`;
        }
      }
      sqlDump += `\n`;
    } catch (err) {
      console.warn(`Table ${table} dump notice:`, err.message);
    }
  }

  return sqlDump;
};

// Helper: Download file from Synology NAS via WebDAV GET
const downloadFromWebDAV = (nasConfig, filename) => {
  return new Promise((resolve) => {
    try {
      const { ip, port = 5005, username, password, useSsl = false, targetFolder = '/sewer_bita' } = nasConfig || {};
      if (!ip) return resolve({ success: false, error: 'IP Address Synology NAS belum dikonfigurasi' });

      const client = (useSsl || port === 5006 || port === '5006') ? https : http;
      let cleanFolder = (targetFolder || '/sewer_bita').replace(/\\/g, '/');
      if (!cleanFolder.startsWith('/')) cleanFolder = '/' + cleanFolder;
      if (!cleanFolder.endsWith('/')) cleanFolder = cleanFolder + '/';

      const targetPath = encodeURI(`${cleanFolder}${filename}`);
      const auth = 'Basic ' + Buffer.from(`${username || ''}:${password || ''}`).toString('base64');

      const options = {
        hostname: ip,
        port: parseInt(port, 10) || 5005,
        path: targetPath,
        method: 'GET',
        headers: { 'Authorization': auth },
        timeout: 20000,
        rejectUnauthorized: false
      };

      const req = client.request(options, (res) => {
        if (res.statusCode === 200) {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve({ success: true, buffer });
          });
        } else {
          resolve({ success: false, error: `Synology WebDAV GET HTTP ${res.statusCode} ${res.statusMessage || ''}` });
        }
      });

      req.on('error', (err) => resolve({ success: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout (20s)' }); });
      req.end();
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  });
};

// 1. Test NAS Connectivity Endpoint
app.post('/api/backup/test-nas', async (req, res) => {
  const nasConfig = req.body || {};
  try {
    // 1. Ping WebDAV via PROPFIND / OPTIONS
    const pingRes = await pingWebDAV(nasConfig);
    if (!pingRes.success && (pingRes.statusCode === 401 || pingRes.statusCode === 403 || pingRes.statusCode === 404)) {
      return res.status(pingRes.statusCode || 400).json({
        success: false,
        error: pingRes.error
      });
    }

    // 2. Try file upload test
    const testFilename = `.test_connection_${Date.now()}.tmp`;
    const testBuffer = Buffer.from('SewerBITA Synology WebDAV Connection Test OK');
    const result = await uploadToWebDAV(nasConfig, testFilename, testBuffer);

    if (result.success || pingRes.success) {
      res.json({
        success: true,
        message: `Koneksi WebDAV ke Synology NAS (${nasConfig.ip}:${nasConfig.port}) terverifikasi online! Folder target '${nasConfig.targetFolder || '/sewer_bita'}' siap digunakan.`
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || pingRes.error || 'Gagal terhubung ke Synology NAS WebDAV.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Execute Backup Endpoint (Creates SQL dump, gzips, saves to /backups and uploads to NAS)
app.post('/api/backup/execute', async (req, res) => {
  const { type = 'FULL', nasConfig } = req.body || {};
  try {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `sewerbita-${type.toLowerCase()}-backup-${stamp}.sql.gz`;

    // 1. Generate SQL dump text
    const sqlText = await generateSqlDump();

    // 2. Gzip compress
    const gzippedBuffer = zlib.gzipSync(Buffer.from(sqlText, 'utf-8'));
    const sizeMb = (gzippedBuffer.length / (1024 * 1024)).toFixed(2) + ' MB';

    // 3. Save local persistent file
    const localFilePath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(localFilePath, gzippedBuffer);

    // 4. Upload to Synology NAS WebDAV if configured
    let nasResult = { success: false, error: 'Belum dikonfigurasi' };
    let uploadStatus = 'Lokal (Server)';
    let notes = `${type} Backup berhasil. Database: 10 tabel tersimpan lokal di server.`;

    if (nasConfig && nasConfig.ip) {
      nasResult = await uploadToWebDAV(nasConfig, filename, gzippedBuffer);
      if (nasResult.success) {
        uploadStatus = 'NAS (Synology)';
        notes = `${type} Backup berhasil. Tersimpan di Synology NAS (${nasConfig.targetFolder || '/sewer_bita'}) dan lokal.`;
      } else {
        notes = `${type} Backup tersimpan di server. WebDAV NAS notice: ${nasResult.error}`;
      }
    }

    // 5. Insert record to backup_history in DB
    const backupId = `bk-${Date.now()}`;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const waktuExec = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

    await pool.query(`
      INSERT INTO backup_history (id, execution_time, backup_type, destination, filename, file_size, status, notes)
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, 'Sukses', $6)
      ON CONFLICT (id) DO NOTHING;
    `, [backupId, type, uploadStatus, filename, sizeMb, notes]);

    res.json({
      success: true,
      id: backupId,
      filename,
      waktuExec,
      fileSize: sizeMb,
      destination: uploadStatus,
      nasUpload: nasResult,
      notes
    });
  } catch (err) {
    console.error('Backup execution failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Backup History Endpoint
app.get('/api/backup/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        to_char(execution_time, 'DD Mon YYYY, HH24.MI') AS "waktuExec",
        backup_type AS "tipe",
        destination AS "destinasi",
        filename AS "namaBerkas",
        file_size AS "ukuran",
        status,
        notes AS "keterangan"
      FROM backup_history
      ORDER BY execution_time DESC
      LIMIT 30;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch backup history error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3.1 Get Permanent Backup Configuration Endpoint
app.get('/api/backup/config', async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM system_backup_config WHERE id = 'main_config';");
    if (result.rows.length === 0) {
      await pool.query(`
        INSERT INTO system_backup_config (id, nas_protocol, nas_ip, nas_port, nas_user, nas_password, use_ssl, target_folder, apk_url, main_storage_destination, auto_backup_enabled, schedule_cron, retention_days)
        VALUES ('main_config', 'Synology WebDAV', '103.165.253.150', '5005', 'Maia', '••••••••', false, '/sewer_bita', '', 'Synology NAS', true, 'Setiap Hari (23:00 WIB)', 30);
      `);
      result = await pool.query("SELECT * FROM system_backup_config WHERE id = 'main_config';");
    }
    const r = result.rows[0];
    res.json({
      nasProtocol: r.nas_protocol,
      nasIp: r.nas_ip,
      nasPort: r.nas_port,
      nasUser: r.nas_user,
      nasPassword: r.nas_password,
      useSsl: r.use_ssl,
      targetFolder: r.target_folder,
      apkUrl: r.apk_url,
      mainStorageDestination: r.main_storage_destination,
      autoBackupEnabled: r.auto_backup_enabled,
      scheduleCron: r.schedule_cron,
      retentionDays: r.retention_days
    });
  } catch (err) {
    console.error('Fetch backup config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3.2 Save Permanent Backup Configuration Endpoint
app.post('/api/backup/config', async (req, res) => {
  const data = req.body || {};
  try {
    const q = `
      INSERT INTO system_backup_config
      (id, nas_protocol, nas_ip, nas_port, nas_user, nas_password, use_ssl, target_folder, apk_url, main_storage_destination, auto_backup_enabled, schedule_cron, retention_days, updated_at)
      VALUES ('main_config', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        nas_protocol = EXCLUDED.nas_protocol,
        nas_ip = EXCLUDED.nas_ip,
        nas_port = EXCLUDED.nas_port,
        nas_user = EXCLUDED.nas_user,
        nas_password = EXCLUDED.nas_password,
        use_ssl = EXCLUDED.use_ssl,
        target_folder = EXCLUDED.target_folder,
        apk_url = EXCLUDED.apk_url,
        main_storage_destination = EXCLUDED.main_storage_destination,
        auto_backup_enabled = EXCLUDED.auto_backup_enabled,
        schedule_cron = EXCLUDED.schedule_cron,
        retention_days = EXCLUDED.retention_days,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const values = [
      data.nasProtocol || 'Synology WebDAV',
      data.nasIp || '103.165.253.150',
      data.nasPort || '5005',
      data.nasUser || 'Maia',
      data.nasPassword || '••••••••',
      Boolean(data.useSsl),
      data.targetFolder || '/sewer_bita',
      data.apkUrl || '',
      data.mainStorageDestination || 'Synology NAS',
      Boolean(data.autoBackupEnabled),
      data.scheduleCron || 'Setiap Hari (23:00 WIB)',
      Number(data.retentionDays) || 30
    ];
    await pool.query(q, values);
    res.json({ success: true, message: 'Konfigurasi backup & Synology NAS berhasil disimpan secara permanen di PostgreSQL!' });
  } catch (err) {
    console.error('Save backup config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Download Backup File Endpoint
app.get('/api/backup/download/:filename', (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(BACKUP_DIR, safeFilename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', 'application/gzip');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } else {
    res.status(404).json({ error: `Berkas backup '${safeFilename}' tidak ditemukan di server.` });
  }
});

// 5. Restore Database from Backup File Endpoint
app.post('/api/backup/restore', async (req, res) => {
  const { filename, nasConfig } = req.body || {};
  try {
    if (!filename) {
      return res.status(400).json({ error: 'Nama berkas snapshot tidak valid.' });
    }
    const safeFilename = path.basename(filename);
    const filePath = path.join(BACKUP_DIR, safeFilename);

    let compressedBuffer;
    if (fs.existsSync(filePath)) {
      compressedBuffer = fs.readFileSync(filePath);
    } else if (nasConfig && nasConfig.ip) {
      const nasDl = await downloadFromWebDAV(nasConfig, safeFilename);
      if (nasDl.success && nasDl.buffer) {
        compressedBuffer = nasDl.buffer;
        try {
          fs.writeFileSync(filePath, compressedBuffer);
        } catch (e) {
          console.warn('Failed to cache downloaded backup file:', e);
        }
      } else {
        return res.status(404).json({ error: `Berkas snapshot '${safeFilename}' tidak ditemukan di server maupun Synology NAS: ${nasDl.error}` });
      }
    } else {
      return res.status(404).json({ error: `Berkas snapshot '${safeFilename}' tidak ditemukan di direktori backup server.` });
    }

    const sqlText = zlib.gunzipSync(compressedBuffer).toString('utf-8');

    // Execute SQL queries inside a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN;');

      const statements = sqlText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('--'));

      for (const stmt of statements) {
        await client.query(stmt);
      }

      await client.query('COMMIT;');
      res.json({ success: true, message: `Database SewerBITA berhasil dipulihkan dari '${safeFilename}'.` });
    } catch (dbErr) {
      await client.query('ROLLBACK;');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database restore error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------
// 10. SERVE PRODUCTION STATIC FRONTEND (SPA ROUTING)
// --------------------------------------------------------------------
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SewerBITA Production REST API Server running on port ${PORT}`);
});
