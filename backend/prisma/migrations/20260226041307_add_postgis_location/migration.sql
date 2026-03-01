-- Enable PostGIS (an toàn nếu đã tồn tại)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column
ALTER TABLE "SosReport"
ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Tạo spatial index
CREATE INDEX idx_sos_location
ON "SosReport"
USING GIST (location);