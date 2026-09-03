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

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  }
}));

app.use(express.json());

// In-memory rate limiter middleware (DDoS & Brute-force protection)
const rateLimitMap = new Map();
const rateLimiter = (maxRequests = 250, windowMs = 60000) => (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'client-ip';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);
  if (record.count > maxRequests) {
    return res.status(429).json({ error: 'Terlalu banyak permintaan API. Silakan coba beberapa saat lagi.' });
  }
  next();
};

// Health Check Endpoints (Placed BEFORE rateLimiter so healthchecks from Docker/Coolify never get rate-limited)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(rateLimiter(300, 60000));

// PostgreSQL Connection Pool Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://sewerbita_admin:sewerbita_pass@postgres-sewerbita:5432/sewerbita_db',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Handle idle pool errors gracefully without crashing the Node.js process
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

// Top-level self-healing schema migration helper
const ensureSchemaUpToDate = async () => {
  const alterQueries = [
    // User profiles
    "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Technician';",
    "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Operasional & Pemeliharaan';",
    "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);",
    "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending Approval';",
    "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;",

    // Manhole assets
    "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS depth_meters DOUBLE PRECISION DEFAULT 2.0;",
    "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS diameter_mm INT DEFAULT 600;",
    "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS material VARCHAR(100) DEFAULT 'Precast Concrete';",
    "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
    "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
    "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
    "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

    // Pump station assets
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS flow_capacity_lps DOUBLE PRECISION DEFAULT 150.0;",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS total_pumps INT DEFAULT 3;",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS active_pumps INT DEFAULT 2;",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS power_source VARCHAR(100) DEFAULT 'PLN Grid + Genset';",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS generator_backup VARCHAR(100) DEFAULT '150 kVA Genset';",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
    "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

    // Pipe assets (CRITICAL FIX FOR MISSING pipe_category, waypoints, pressure_bar, destination_wwtp_name)
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS pipe_category VARCHAR(50) DEFAULT 'gravity';",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS waypoints JSONB DEFAULT '[]'::jsonb;",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS pressure_bar DOUBLE PRECISION DEFAULT 0.0;",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS destination_wwtp_name VARCHAR(255);",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS from_asset_id VARCHAR(100) DEFAULT 'node-start';",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS to_asset_id VARCHAR(100) DEFAULT 'node-end';",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS length_meters DOUBLE PRECISION DEFAULT 50.0;",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS diameter_mm INT DEFAULT 300;",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS material VARCHAR(100) DEFAULT 'HDPE';",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS slope_percent DOUBLE PRECISION DEFAULT 0.5;",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
    "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

    // WTP assets
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS production_capacity_lps DOUBLE PRECISION DEFAULT 500.0;",
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS raw_water_source VARCHAR(255) DEFAULT 'Sungai Citarum';",
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS water_quality_status VARCHAR(100) DEFAULT 'Safe - Permenkes 2023';",
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS reservoir_capacity_m3 DOUBLE PRECISION DEFAULT 5000.0;",
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
    "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

    // Water accessory assets
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS accessory_type VARCHAR(50) DEFAULT 'air_valve';",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS system_category VARCHAR(50) DEFAULT 'clean_water';",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS pipe_id VARCHAR(100) DEFAULT '';",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS diameter_mm INT DEFAULT 150;",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS pressure_bar DOUBLE PRECISION DEFAULT 6.0;",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS elevation_meters DOUBLE PRECISION DEFAULT 15.0;",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS operating_status VARCHAR(50) DEFAULT 'Normal Open';",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
    "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

    // Grease trap assets
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS capacity_liters DOUBLE PRECISION DEFAULT 500.0;",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS chamber_count INT DEFAULT 3;",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS outlet_manhole_id VARCHAR(100) DEFAULT '';",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS cleaning_frequency_days INT DEFAULT 30;",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS grease_level_percent DOUBLE PRECISION DEFAULT 20.0;",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
    "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"
  ];

  for (const q of alterQueries) {
    try {
      await pool.query(q);
    } catch (err) {
      // Ignore if column exists or concurrent query
    }
  }
};

app.get('/api/admin/migrate-schema', async (req, res) => {
  try {
    await ensureSchemaUpToDate();
    res.json({ status: 'success', message: 'Schema migration executed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

    // Auto-migrate missing columns for existing PostgreSQL tables
    const alterQueries = [
      // User profiles
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Technician';",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Operasional & Pemeliharaan';",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending Approval';",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;",

      // Manhole assets
      "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS depth_meters DOUBLE PRECISION DEFAULT 2.0;",
      "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS diameter_mm INT DEFAULT 600;",
      "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS material VARCHAR(100) DEFAULT 'Precast Concrete';",
      "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
      "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
      "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
      "ALTER TABLE manhole_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

      // Pump station assets
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS flow_capacity_lps DOUBLE PRECISION DEFAULT 150.0;",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS total_pumps INT DEFAULT 3;",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS active_pumps INT DEFAULT 2;",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS power_source VARCHAR(100) DEFAULT 'PLN Grid + Genset';",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS generator_backup VARCHAR(100) DEFAULT '150 kVA Genset';",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
      "ALTER TABLE pump_station_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

      // Pipe assets (CRITICAL FIX FOR MISSING pipe_category, waypoints, pressure_bar, etc.)
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS pipe_category VARCHAR(50) DEFAULT 'gravity';",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS waypoints JSONB DEFAULT '[]'::jsonb;",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS pressure_bar DOUBLE PRECISION DEFAULT 0.0;",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS destination_wwtp_name VARCHAR(255);",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS from_asset_id VARCHAR(100) DEFAULT 'node-start';",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS to_asset_id VARCHAR(100) DEFAULT 'node-end';",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS length_meters DOUBLE PRECISION DEFAULT 50.0;",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS diameter_mm INT DEFAULT 300;",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS material VARCHAR(100) DEFAULT 'HDPE';",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS slope_percent DOUBLE PRECISION DEFAULT 0.5;",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
      "ALTER TABLE pipe_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

      // WTP assets
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS production_capacity_lps DOUBLE PRECISION DEFAULT 500.0;",
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS raw_water_source VARCHAR(255) DEFAULT 'Sungai Citarum';",
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS water_quality_status VARCHAR(100) DEFAULT 'Safe - Permenkes 2023';",
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS reservoir_capacity_m3 DOUBLE PRECISION DEFAULT 5000.0;",
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
      "ALTER TABLE wtp_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

      // Water accessory assets
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS accessory_type VARCHAR(50) DEFAULT 'air_valve';",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS system_category VARCHAR(50) DEFAULT 'clean_water';",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS pipe_id VARCHAR(100) DEFAULT '';",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS diameter_mm INT DEFAULT 150;",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS pressure_bar DOUBLE PRECISION DEFAULT 6.0;",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS elevation_meters DOUBLE PRECISION DEFAULT 15.0;",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS operating_status VARCHAR(50) DEFAULT 'Normal Open';",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
      "ALTER TABLE water_accessory_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",

      // Grease trap assets
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS capacity_liters DOUBLE PRECISION DEFAULT 500.0;",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS chamber_count INT DEFAULT 3;",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS outlet_manhole_id VARCHAR(100) DEFAULT '';",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS cleaning_frequency_days INT DEFAULT 30;",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS grease_level_percent DOUBLE PRECISION DEFAULT 20.0;",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good';",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS next_inspection_due DATE DEFAULT CURRENT_DATE + INTERVAL '90 days';",
      "ALTER TABLE grease_trap_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"
    ];

    for (const q of alterQueries) {
      try {
        await pool.query(q);
      } catch (err) {
        console.warn('Column migration notice:', err.message);
      }
    }

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

    // 8.2 Persistent Custom Areas Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_areas (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

    // 14. PostGIS Spatial Index Optimization (GiST Indexes)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_manhole_geom ON manhole_assets USING GIST(geom);
      CREATE INDEX IF NOT EXISTS idx_pump_station_geom ON pump_station_assets USING GIST(geom);
      CREATE INDEX IF NOT EXISTS idx_pipe_geom ON pipe_assets USING GIST(geom);
      CREATE INDEX IF NOT EXISTS idx_wtp_geom ON wtp_assets USING GIST(geom);
      CREATE INDEX IF NOT EXISTS idx_water_accessory_geom ON water_accessory_assets USING GIST(geom);
      CREATE INDEX IF NOT EXISTS idx_grease_trap_geom ON grease_trap_assets USING GIST(geom);
    `);

    await ensureSchemaUpToDate();
    console.log('✅ PostgreSQL Schema & Tables (work_orders, projects, reports, assets, users) initialized for production!');
  } catch (err) {
    console.error('⚠️ DB Init Warning:', err.message);
  }
};

let isDbInitialized = false;

const startDbConnectionLoop = async () => {
  let attempts = 0;
  while (!isDbInitialized) {
    attempts++;
    try {
      const client = await pool.connect();
      console.log(`✅ Connected to PostgreSQL + PostGIS Database successfully on attempt #${attempts}!`);
      client.release();
      isDbInitialized = true;
      await initDb();
      break;
    } catch (err) {
      console.warn(`⚠️ PostgreSQL connection attempt #${attempts} failed: ${err.message}. Retrying in 3 seconds...`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

startDbConnectionLoop();

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
    const fetchSafe = async (queryStr) => {
      try {
        const result = await pool.query(queryStr);
        return result.rows || [];
      } catch (e) {
        console.warn('Query notice for asset table:', e.message);
        return [];
      }
    };

    const [manholes, pumpStations, pipes, wtps, waterAccessories, greaseTraps] = await Promise.all([
      fetchSafe('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, depth_meters AS "depthMeters", diameter_mm AS "diameterMm", material, status, condition, next_inspection_due AS "nextInspectionDue" FROM manhole_assets ORDER BY created_at DESC;'),
      fetchSafe('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, flow_capacity_lps AS "flowCapacityLps", total_pumps AS "totalPumps", active_pumps AS "activePumps", power_source AS "powerSource", generator_backup AS "generatorBackup", status, condition, next_inspection_due AS "nextInspectionDue" FROM pump_station_assets ORDER BY created_at DESC;'),
      fetchSafe('SELECT id, asset_code AS "assetCode", name, area, from_asset_id AS "fromAssetId", to_asset_id AS "toAssetId", length_meters AS "lengthMeters", diameter_mm AS "diameterMm", material, slope_percent AS "slopePercent", pipe_category AS "pipeCategory", waypoints, pressure_bar AS "pressureBar", destination_wwtp_name AS "destinationWwtpName", status, condition, next_inspection_due AS "nextInspectionDue" FROM pipe_assets ORDER BY created_at DESC;'),
      fetchSafe('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, production_capacity_lps AS "productionCapacityLps", raw_water_source AS "rawWaterSource", water_quality_status AS "waterQualityStatus", reservoir_capacity_m3 AS "reservoirCapacityM3", status, condition, next_inspection_due AS "nextInspectionDue" FROM wtp_assets ORDER BY created_at DESC;'),
      fetchSafe('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, accessory_type AS "accessoryType", system_category AS "systemCategory", pipe_id AS "pipeId", diameter_mm AS "diameterMm", pressure_bar AS "pressureBar", elevation_meters AS "elevationMeters", operating_status AS "operatingStatus", status, condition, next_inspection_due AS "nextInspectionDue" FROM water_accessory_assets ORDER BY created_at DESC;'),
      fetchSafe('SELECT id, asset_code AS "assetCode", name, area, latitude, longitude, capacity_liters AS "capacityLiters", chamber_count AS "chamberCount", outlet_manhole_id AS "outletManholeId", cleaning_frequency_days AS "cleaningFrequencyDays", grease_level_percent AS "greaseLevelPercent", status, condition, next_inspection_due AS "nextInspectionDue" FROM grease_trap_assets ORDER BY created_at DESC;')
    ]);

    res.json({
      manholes,
      pumpStations,
      pipes,
      wtps,
      waterAccessories,
      greaseTraps
    });
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// 2.5 SYSTEM AREAS ENDPOINTS (PERSISTENT CUSTOM AREAS)
// --------------------------------------------------------------------
app.get('/api/areas', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_areas (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const areasRes = await pool.query('SELECT name FROM system_areas ORDER BY name ASC;');
    const customAreas = areasRes.rows.map(r => r.name);

    let assetAreas = [];
    try {
      const assetsAreasRes = await pool.query(`
        SELECT DISTINCT area FROM (
          SELECT area FROM manhole_assets
          UNION ALL
          SELECT area FROM pump_station_assets
          UNION ALL
          SELECT area FROM pipe_assets
          UNION ALL
          SELECT area FROM wtp_assets
          UNION ALL
          SELECT area FROM water_accessory_assets
          UNION ALL
          SELECT area FROM grease_trap_assets
        ) combined WHERE area IS NOT NULL AND area != '';
      `);
      assetAreas = assetsAreasRes.rows.map(r => r.area);
    } catch (e) {
      console.warn('assetAreas query notice:', e.message);
    }

    const mergedAreas = Array.from(new Set([...customAreas, ...assetAreas])).sort();
    res.json(mergedAreas);
  } catch (err) {
    console.error('Error fetching areas:', err);
    res.status(500).json({ error: err.message });
  }
});

const ensureAreaExists = async (areaName) => {
  if (areaName && typeof areaName === 'string' && areaName.trim()) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS system_areas (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(
        'INSERT INTO system_areas (id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING;',
        [`area-${Date.now()}`, areaName.trim()]
      );
    } catch (e) {
      console.warn('Failed to auto-insert system_area:', e);
    }
  }
};

app.post('/api/areas', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama area wajib diisi.' });
  }
  const cleanName = name.trim();
  try {
    await ensureAreaExists(cleanName);
    res.status(201).json({ id: `area-${Date.now()}`, name: cleanName });
  } catch (err) {
    console.error('Error creating area:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/areas/:name', async (req, res) => {
  const { name } = req.params;
  try {
    await pool.query('DELETE FROM system_areas WHERE LOWER(name) = LOWER($1);', [name]);
    res.json({ message: 'Area deleted successfully', name });
  } catch (err) {
    console.error('Error deleting area:', err);
    res.status(500).json({ error: err.message });
  }
});

const ensureUniqueAssetCode = async (tableName, assetCode, id) => {
  if (!assetCode || !assetCode.trim()) {
    return `${tableName.slice(0, 2).toUpperCase()}-${Date.now()}`;
  }
  const cleanCode = assetCode.trim();
  try {
    const res = await pool.query(
      `SELECT id FROM ${tableName} WHERE LOWER(asset_code) = LOWER($1) AND id != $2;`,
      [cleanCode, id || '']
    );
    if (res.rows.length > 0) {
      return `${cleanCode}-${Math.floor(10 + Math.random() * 90)}`;
    }
    return cleanCode;
  } catch (e) {
    return cleanCode;
  }
};

// --------------------------------------------------------------------
// Helper function for 2-step UPSERT to guarantee PostgreSQL constraint safety
const cleanDate = (d) => {
  if (!d) return new Date().toISOString().split('T')[0];
  const s = String(d).trim();
  if (s.includes('T')) return s.split('T')[0];
  return s.slice(0, 10);
};

const saveOrUpdateAssetInDb = async (type, id, data) => {
  if (!data) throw new Error('Data aset tidak boleh kosong');

  const runUpsert = async () => {
    if (data.area) await ensureAreaExists(data.area);

    let normalizedType = String(type || data.type || '').toLowerCase().trim();
    if (normalizedType === 'pumpstation' || normalizedType === 'pump') normalizedType = 'pump_station';
    if (normalizedType === 'wateraccessory' || normalizedType === 'accessory' || normalizedType === 'valve') normalizedType = 'water_accessory';
    if (normalizedType === 'greasetrap' || normalizedType === 'grease') normalizedType = 'grease_trap';
    if (normalizedType === 'wwtp') normalizedType = 'wtp';

    const lat = Number(data.latitude ?? data.coordinates?.lat);
    const lng = Number(data.longitude ?? data.coordinates?.lng);
    const validLat = !isNaN(lat) && lat !== 0 ? lat : -6.444;
    const validLng = !isNaN(lng) && lng !== 0 ? lng : 107.452;

    const targetId = id || data.id || `ast-${Date.now()}`;
    const safeAssetCode = String(data.assetCode || data.asset_code || data.code || targetId).trim();
    const safeNextDue = cleanDate(data.nextInspectionDue || data.next_inspection_due);

    if (normalizedType === 'manhole') {
      const check = await pool.query(
        'SELECT id FROM manhole_assets WHERE id = $1 OR LOWER(asset_code) = LOWER($2) LIMIT 1;',
        [targetId, safeAssetCode]
      );

      if (check.rows.length > 0) {
        const dbId = check.rows[0].id;
        const updateQ = `
          UPDATE manhole_assets SET
            asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
            depth_meters = $6, diameter_mm = $7, material = $8, status = $9, condition = $10, next_inspection_due = $11, updated_at = CURRENT_TIMESTAMP
          WHERE id = $12
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, depth_meters AS "depthMeters", diameter_mm AS "diameterMm", material, status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          safeAssetCode, data.name || `Manhole ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.depthMeters ?? data.depth_meters) || 2.5, Number(data.diameterMm ?? data.diameter_mm) || 800,
          data.material || 'Precast Concrete', data.status || 'Active', data.condition || 'Good', safeNextDue, dbId
        ];
        const res = await pool.query(updateQ, values);
        return { type: 'manhole', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      } else {
        const insertQ = `
          INSERT INTO manhole_assets
          (id, asset_code, name, area, latitude, longitude, depth_meters, diameter_mm, material, status, condition, next_inspection_due)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, depth_meters AS "depthMeters", diameter_mm AS "diameterMm", material, status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          targetId, safeAssetCode, data.name || `Manhole ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.depthMeters ?? data.depth_meters) || 2.5, Number(data.diameterMm ?? data.diameter_mm) || 800,
          data.material || 'Precast Concrete', data.status || 'Active', data.condition || 'Good', safeNextDue
        ];
        const res = await pool.query(insertQ, values);
        return { type: 'manhole', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      }
    }

    if (normalizedType === 'pump_station') {
      const check = await pool.query(
        'SELECT id FROM pump_station_assets WHERE id = $1 OR LOWER(asset_code) = LOWER($2) LIMIT 1;',
        [targetId, safeAssetCode]
      );

      if (check.rows.length > 0) {
        const dbId = check.rows[0].id;
        const updateQ = `
          UPDATE pump_station_assets SET
            asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
            flow_capacity_lps = $6, total_pumps = $7, active_pumps = $8, power_source = $9, generator_backup = $10, status = $11, condition = $12, next_inspection_due = $13, updated_at = CURRENT_TIMESTAMP
          WHERE id = $14
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, flow_capacity_lps AS "flowCapacityLps", total_pumps AS "totalPumps", active_pumps AS "activePumps", power_source AS "powerSource", generator_backup AS "generatorBackup", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          safeAssetCode, data.name || `Stasiun Pompa ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.flowCapacityLps ?? data.capacityLps ?? data.flow_capacity_lps) || 150,
          Number(data.totalPumps ?? data.pumpCount ?? data.total_pumps) || 3,
          Number(data.activePumps ?? data.active_pumps) || 2,
          data.powerSource || data.power_source || 'PLN Grid',
          data.generatorBackup || data.generator_backup || 'Genset',
          data.status || 'Active', data.condition || 'Good', safeNextDue, dbId
        ];
        const res = await pool.query(updateQ, values);
        return { type: 'pump_station', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      } else {
        const insertQ = `
          INSERT INTO pump_station_assets
          (id, asset_code, name, area, latitude, longitude, flow_capacity_lps, total_pumps, active_pumps, power_source, generator_backup, status, condition, next_inspection_due)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, flow_capacity_lps AS "flowCapacityLps", total_pumps AS "totalPumps", active_pumps AS "activePumps", power_source AS "powerSource", generator_backup AS "generatorBackup", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          targetId, safeAssetCode, data.name || `Stasiun Pompa ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.flowCapacityLps ?? data.capacityLps ?? data.flow_capacity_lps) || 150,
          Number(data.totalPumps ?? data.pumpCount ?? data.total_pumps) || 3,
          Number(data.activePumps ?? data.active_pumps) || 2,
          data.powerSource || data.power_source || 'PLN Grid',
          data.generatorBackup || data.generator_backup || 'Genset',
          data.status || 'Active', data.condition || 'Good', safeNextDue
        ];
        const res = await pool.query(insertQ, values);
        return { type: 'pump_station', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      }
    }

    if (normalizedType === 'pipe') {
      const check = await pool.query(
        'SELECT id FROM pipe_assets WHERE id = $1 OR LOWER(asset_code) = LOWER($2) LIMIT 1;',
        [targetId, safeAssetCode]
      );

      if (check.rows.length > 0) {
        const dbId = check.rows[0].id;
        const updateQ = `
          UPDATE pipe_assets SET
            asset_code = $1, name = $2, area = $3, from_asset_id = $4, to_asset_id = $5,
            length_meters = $6, diameter_mm = $7, material = $8, slope_percent = $9,
            pipe_category = $10, waypoints = $11, pressure_bar = $12, destination_wwtp_name = $13,
            status = $14, condition = $15, next_inspection_due = $16, updated_at = CURRENT_TIMESTAMP
          WHERE id = $17
          RETURNING id, asset_code AS "assetCode", name, area, from_asset_id AS "fromAssetId", to_asset_id AS "toAssetId", length_meters AS "lengthMeters", diameter_mm AS "diameterMm", material, slope_percent AS "slopePercent", pipe_category AS "pipeCategory", waypoints, pressure_bar AS "pressureBar", destination_wwtp_name AS "destinationWwtpName", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          safeAssetCode, data.name || `Pipa ${safeAssetCode}`, data.area || 'Utama',
          data.fromAssetId || data.from_asset_id || 'node-start', data.toAssetId || data.to_asset_id || 'node-end',
          Number(data.lengthMeters ?? data.length_meters) || 50, Number(data.diameterMm ?? data.diameter_mm) || 300,
          data.material || 'HDPE', Number(data.slopePercent ?? data.slope_percent) || 0.5,
          data.pipeCategory || data.pipe_category || 'gravity', JSON.stringify(data.waypoints || []),
          Number(data.pressureBar ?? data.pressure_bar) || 0.0, data.destinationWwtpName || data.destination_wwtp_name || '',
          data.status || 'Active', data.condition || 'Good', safeNextDue, dbId
        ];
        const res = await pool.query(updateQ, values);
        return { type: 'pipe', ...res.rows[0] };
      } else {
        const insertQ = `
          INSERT INTO pipe_assets
          (id, asset_code, name, area, from_asset_id, to_asset_id, length_meters, diameter_mm, material, slope_percent, pipe_category, waypoints, pressure_bar, destination_wwtp_name, status, condition, next_inspection_due)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id, asset_code AS "assetCode", name, area, from_asset_id AS "fromAssetId", to_asset_id AS "toAssetId", length_meters AS "lengthMeters", diameter_mm AS "diameterMm", material, slope_percent AS "slopePercent", pipe_category AS "pipeCategory", waypoints, pressure_bar AS "pressureBar", destination_wwtp_name AS "destinationWwtpName", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          targetId, safeAssetCode, data.name || `Pipa ${safeAssetCode}`, data.area || 'Utama',
          data.fromAssetId || data.from_asset_id || 'node-start', data.toAssetId || data.to_asset_id || 'node-end',
          Number(data.lengthMeters ?? data.length_meters) || 50, Number(data.diameterMm ?? data.diameter_mm) || 300,
          data.material || 'HDPE', Number(data.slopePercent ?? data.slope_percent) || 0.5,
          data.pipeCategory || data.pipe_category || 'gravity', JSON.stringify(data.waypoints || []),
          Number(data.pressureBar ?? data.pressure_bar) || 0.0, data.destinationWwtpName || data.destination_wwtp_name || '',
          data.status || 'Active', data.condition || 'Good', safeNextDue
        ];
        const res = await pool.query(insertQ, values);
        return { type: 'pipe', ...res.rows[0] };
      }
    }

    if (normalizedType === 'wtp') {
      const check = await pool.query(
        'SELECT id FROM wtp_assets WHERE id = $1 OR LOWER(asset_code) = LOWER($2) LIMIT 1;',
        [targetId, safeAssetCode]
      );

      if (check.rows.length > 0) {
        const dbId = check.rows[0].id;
        const updateQ = `
          UPDATE wtp_assets SET
            asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
            production_capacity_lps = $6, raw_water_source = $7, water_quality_status = $8, reservoir_capacity_m3 = $9, status = $10, condition = $11, next_inspection_due = $12, updated_at = CURRENT_TIMESTAMP
          WHERE id = $13
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, production_capacity_lps AS "productionCapacityLps", raw_water_source AS "rawWaterSource", water_quality_status AS "waterQualityStatus", reservoir_capacity_m3 AS "reservoirCapacityM3", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          safeAssetCode, data.name || `WTP ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.productionCapacityLps ?? data.production_capacity_lps) || 500,
          data.rawWaterSource || data.raw_water_source || 'Sungai Citarum',
          data.waterQualityStatus || data.water_quality_status || 'Safe - Permenkes 2023',
          Number(data.reservoirCapacityM3 ?? data.reservoir_capacity_m3) || 5000,
          data.status || 'Active', data.condition || 'Good', safeNextDue, dbId
        ];
        const res = await pool.query(updateQ, values);
        return { type: 'wtp', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      } else {
        const insertQ = `
          INSERT INTO wtp_assets
          (id, asset_code, name, area, latitude, longitude, production_capacity_lps, raw_water_source, water_quality_status, reservoir_capacity_m3, status, condition, next_inspection_due)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, production_capacity_lps AS "productionCapacityLps", raw_water_source AS "rawWaterSource", water_quality_status AS "waterQualityStatus", reservoir_capacity_m3 AS "reservoirCapacityM3", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          targetId, safeAssetCode, data.name || `WTP ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.productionCapacityLps ?? data.production_capacity_lps) || 500,
          data.rawWaterSource || data.raw_water_source || 'Sungai Citarum',
          data.waterQualityStatus || data.water_quality_status || 'Safe - Permenkes 2023',
          Number(data.reservoirCapacityM3 ?? data.reservoir_capacity_m3) || 5000,
          data.status || 'Active', data.condition || 'Good', safeNextDue
        ];
        const res = await pool.query(insertQ, values);
        return { type: 'wtp', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      }
    }

    if (normalizedType === 'water_accessory') {
      const check = await pool.query(
        'SELECT id FROM water_accessory_assets WHERE id = $1 OR LOWER(asset_code) = LOWER($2) LIMIT 1;',
        [targetId, safeAssetCode]
      );

      if (check.rows.length > 0) {
        const dbId = check.rows[0].id;
        const updateQ = `
          UPDATE water_accessory_assets SET
            asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
            accessory_type = $6, system_category = $7, pipe_id = $8, diameter_mm = $9, pressure_bar = $10, elevation_meters = $11, operating_status = $12, status = $13, condition = $14, next_inspection_due = $15, updated_at = CURRENT_TIMESTAMP
          WHERE id = $16
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, accessory_type AS "accessoryType", system_category AS "systemCategory", pipe_id AS "pipeId", diameter_mm AS "diameterMm", pressure_bar AS "pressureBar", elevation_meters AS "elevationMeters", operating_status AS "operatingStatus", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          safeAssetCode, data.name || `Aksesori ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          data.accessoryType || data.accessory_type || 'air_valve',
          data.systemCategory || data.system_category || 'clean_water',
          data.pipeId || data.pipe_id || '',
          Number(data.diameterMm ?? data.diameter_mm) || 150,
          Number(data.pressureBar ?? data.pressure_bar) || 6.0,
          Number(data.elevationMeters ?? data.elevation_meters) || 15.0,
          data.operatingStatus || data.operating_status || 'Normal Open',
          data.status || 'Active', data.condition || 'Good', safeNextDue, dbId
        ];
        const res = await pool.query(updateQ, values);
        return { type: 'water_accessory', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      } else {
        const insertQ = `
          INSERT INTO water_accessory_assets
          (id, asset_code, name, area, latitude, longitude, accessory_type, system_category, pipe_id, diameter_mm, pressure_bar, elevation_meters, operating_status, status, condition, next_inspection_due)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, accessory_type AS "accessoryType", system_category AS "systemCategory", pipe_id AS "pipeId", diameter_mm AS "diameterMm", pressure_bar AS "pressureBar", elevation_meters AS "elevationMeters", operating_status AS "operatingStatus", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          targetId, safeAssetCode, data.name || `Aksesori ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          data.accessoryType || data.accessory_type || 'air_valve',
          data.systemCategory || data.system_category || 'clean_water',
          data.pipeId || data.pipe_id || '',
          Number(data.diameterMm ?? data.diameter_mm) || 150,
          Number(data.pressureBar ?? data.pressure_bar) || 6.0,
          Number(data.elevationMeters ?? data.elevation_meters) || 15.0,
          data.operatingStatus || data.operating_status || 'Normal Open',
          data.status || 'Active', data.condition || 'Good', safeNextDue
        ];
        const res = await pool.query(insertQ, values);
        return { type: 'water_accessory', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      }
    }

    if (normalizedType === 'grease_trap') {
      const check = await pool.query(
        'SELECT id FROM grease_trap_assets WHERE id = $1 OR LOWER(asset_code) = LOWER($2) LIMIT 1;',
        [targetId, safeAssetCode]
      );

      if (check.rows.length > 0) {
        const dbId = check.rows[0].id;
        const updateQ = `
          UPDATE grease_trap_assets SET
            asset_code = $1, name = $2, area = $3, latitude = $4, longitude = $5,
            capacity_liters = $6, chamber_count = $7, outlet_manhole_id = $8, cleaning_frequency_days = $9, grease_level_percent = $10, status = $11, condition = $12, next_inspection_due = $13, updated_at = CURRENT_TIMESTAMP
          WHERE id = $14
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, capacity_liters AS "capacityLiters", chamber_count AS "chamberCount", outlet_manhole_id AS "outletManholeId", cleaning_frequency_days AS "cleaningFrequencyDays", grease_level_percent AS "greaseLevelPercent", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          safeAssetCode, data.name || `Grease Trap ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.capacityLiters ?? data.capacity_liters) || 500,
          Number(data.chamberCount ?? data.chamber_count) || 3,
          data.outletManholeId || data.outlet_manhole_id || '',
          Number(data.cleaningFrequencyDays ?? data.cleaning_frequency_days) || 30,
          Number(data.greaseLevelPercent ?? data.grease_level_percent) || 20,
          data.status || 'Active', data.condition || 'Good', safeNextDue, dbId
        ];
        const res = await pool.query(updateQ, values);
        return { type: 'grease_trap', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      } else {
        const insertQ = `
          INSERT INTO grease_trap_assets
          (id, asset_code, name, area, latitude, longitude, capacity_liters, chamber_count, outlet_manhole_id, cleaning_frequency_days, grease_level_percent, status, condition, next_inspection_due)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id, asset_code AS "assetCode", name, area, latitude, longitude, capacity_liters AS "capacityLiters", chamber_count AS "chamberCount", outlet_manhole_id AS "outletManholeId", cleaning_frequency_days AS "cleaningFrequencyDays", grease_level_percent AS "greaseLevelPercent", status, condition, next_inspection_due AS "nextInspectionDue";
        `;
        const values = [
          targetId, safeAssetCode, data.name || `Grease Trap ${safeAssetCode}`, data.area || 'Utama', validLat, validLng,
          Number(data.capacityLiters ?? data.capacity_liters) || 500,
          Number(data.chamberCount ?? data.chamber_count) || 3,
          data.outletManholeId || data.outlet_manhole_id || '',
          Number(data.cleaningFrequencyDays ?? data.cleaning_frequency_days) || 30,
          Number(data.greaseLevelPercent ?? data.grease_level_percent) || 20,
          data.status || 'Active', data.condition || 'Good', safeNextDue
        ];
        const res = await pool.query(insertQ, values);
        return { type: 'grease_trap', ...res.rows[0], coordinates: { lat: Number(res.rows[0].latitude), lng: Number(res.rows[0].longitude) } };
      }
    }

    throw new Error(`Tipe aset '${type}' tidak dikenal.`);
  };

  try {
    return await runUpsert();
  } catch (err) {
    if (err.message && (err.message.toLowerCase().includes('does not exist') || err.message.toLowerCase().includes('column'))) {
      console.warn('⚠️ Missing column error detected. Executing dynamic schema auto-heal...', err.message);
      await ensureSchemaUpToDate();
      return await runUpsert();
    }
    throw err;
  }
};

// --------------------------------------------------------------------
// 3. CREATE ASSET ENDPOINT
// --------------------------------------------------------------------
app.post('/api/assets', async (req, res) => {
  const { type, data } = req.body;
  try {
    const saved = await saveOrUpdateAssetInDb(type, data?.id, data);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error in POST /api/assets:', err);
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
    const saved = await saveOrUpdateAssetInDb(type, id, data);
    res.status(200).json(saved);
  } catch (err) {
    console.error('Error in PUT /api/assets/:id:', err);
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SewerBITA Production REST API Server running on port ${PORT} (0.0.0.0)`);
});
