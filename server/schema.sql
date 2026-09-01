-- ====================================================================
-- SewerBITA — DDL Schema Database PostgreSQL + PostGIS (Production)
-- PT. Bukit Indah Tirta Alam (Sistem Asset Management Air Limbah)
-- ====================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Master Table: Manhole Assets
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
    next_inspection_due DATE NOT NULL,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Index for Manholes
CREATE INDEX IF NOT EXISTS idx_manhole_geom ON manhole_assets USING GIST(geom);

-- 3. Master Table: Pump Station Assets
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
    next_inspection_due DATE NOT NULL,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Index for Pump Stations
CREATE INDEX IF NOT EXISTS idx_pump_station_geom ON pump_station_assets USING GIST(geom);

-- 4. Master Table: Pipe Collector Assets
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
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    condition VARCHAR(50) NOT NULL DEFAULT 'Good',
    next_inspection_due DATE NOT NULL,
    geom GEOMETRY(LineString, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Index for Pipes
CREATE INDEX IF NOT EXISTS idx_pipe_geom ON pipe_assets USING GIST(geom);

-- 5. Inspection Records Table
CREATE TABLE IF NOT EXISTS inspection_records (
    id VARCHAR(100) PRIMARY KEY,
    asset_id VARCHAR(100) NOT NULL,
    asset_code VARCHAR(50) NOT NULL,
    asset_type VARCHAR(50) NOT NULL DEFAULT 'Manhole',
    inspector_name VARCHAR(255) NOT NULL,
    inspection_date DATE NOT NULL,
    condition VARCHAR(50) NOT NULL DEFAULT 'Good',
    issue_category VARCHAR(100),
    notes TEXT,
    action_required TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. User Profiles (RBAC) Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Technician',
    department VARCHAR(100) NOT NULL DEFAULT 'Operasional & Pemeliharaan',
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Backup History Table
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

-- 12. Automated Trigger for Geom Point Auto-Population
CREATE OR REPLACE FUNCTION update_asset_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_manhole_geom ON manhole_assets;
CREATE TRIGGER trigger_manhole_geom
BEFORE INSERT OR UPDATE ON manhole_assets
FOR EACH ROW EXECUTE FUNCTION update_asset_geom();

DROP TRIGGER IF EXISTS trigger_pump_station_geom ON pump_station_assets;
CREATE TRIGGER trigger_pump_station_geom
BEFORE INSERT OR UPDATE ON pump_station_assets
FOR EACH ROW EXECUTE FUNCTION update_asset_geom();

-- 13. DDL Schema Initialization Complete


