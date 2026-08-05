-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Row Level Security (RLS) Policies for all Supabase tables
-- File:      db/supabase_rls_migration.sql
-- ══════════════════════════════════════════════════════════════════════════════
--
-- PURPOSE
-- -------
-- By default Supabase's REST API (PostgREST) allows the `anon` key to read and
-- write every table in the public schema, completely bypassing the custom backend.
-- This migration locks every table down with RLS and grants only the minimum
-- access the public internet legitimately needs.
--
-- SECURITY MODEL
-- --------------
-- • postgres (superuser) — bypasses RLS; used by our backend pg.Pool via
--   DATABASE_URL.  All backend API operations are unaffected by these policies.
-- • service_role         — bypasses RLS; used by Supabase internal functions.
-- • anon                 — public internet using SUPABASE_ANON_KEY.
--                          Can only SELECT published/active public content, and
--                          INSERT into the two public submission tables
--                          (contact_messages, applications).
-- • authenticated        — treated identically to anon here; actual admin auth
--                          is managed by our custom JWT flow, not by Supabase
--                          Auth row policies.
--
-- HOW TO APPLY
-- ------------
-- Run once against your Supabase project via the SQL Editor or psql:
--   psql "$DATABASE_URL" -f db/supabase_rls_migration.sql
--
-- To roll back, run the companion rollback section at the bottom of this file.
-- ══════════════════════════════════════════════════════════════════════════════


-- ─── STEP 1: Enable RLS on every table ───────────────────────────────────────
-- Enabling RLS with no policies = default deny for all non-superuser roles.
-- We add back only the specific access we want in subsequent steps.

ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE media                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_certificates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery               ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;


-- ─── STEP 2: Revoke overly-broad default DML privileges from anon ─────────────
-- Supabase grants INSERT/UPDATE/DELETE to anon on all tables by default.
-- RLS already blocks these at the row level when no policy exists, but
-- revoking the object-level privilege adds a defence-in-depth layer so that
-- PostgREST rejects disallowed operations before even evaluating RLS policies.

REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Re-grant only the two submission tables that legitimately accept public INSERTs.
GRANT INSERT ON contact_messages TO anon;
GRANT INSERT ON applications     TO anon;


-- ─── STEP 3: SELECT policies — public read of published/active content ─────────

-- users: no anon access (no policy → default deny)

-- media: public read of non-deleted files (needed for serving images/files)
CREATE POLICY "anon_select_media"
  ON media
  FOR SELECT TO anon
  USING (deleted_at IS NULL);

-- homepage_sections: public read of enabled sections
CREATE POLICY "anon_select_homepage_sections"
  ON homepage_sections
  FOR SELECT TO anon
  USING (is_enabled = 1);

-- settings: public read (drives navbar, footer, theme colours, contact info)
CREATE POLICY "anon_select_settings"
  ON settings
  FOR SELECT TO anon
  USING (true);

-- categories: public read of non-deleted categories
CREATE POLICY "anon_select_categories"
  ON categories
  FOR SELECT TO anon
  USING (deleted_at IS NULL);

-- services: public read of published, non-deleted services
CREATE POLICY "anon_select_services"
  ON services
  FOR SELECT TO anon
  USING (status = 'published' AND deleted_at IS NULL);

-- projects: public read of published, non-deleted projects
CREATE POLICY "anon_select_projects"
  ON projects
  FOR SELECT TO anon
  USING (status = 'published' AND deleted_at IS NULL);

-- project_images: public read only for images belonging to published projects
CREATE POLICY "anon_select_project_images"
  ON project_images
  FOR SELECT TO anon
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE status = 'published' AND deleted_at IS NULL
    )
  );

-- project_documents: same scoping as project_images
CREATE POLICY "anon_select_project_documents"
  ON project_documents
  FOR SELECT TO anon
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE status = 'published' AND deleted_at IS NULL
    )
  );

-- global_certifications: public read of active, non-deleted certifications
CREATE POLICY "anon_select_global_certifications"
  ON global_certifications
  FOR SELECT TO anon
  USING (active_status = 1 AND deleted_at IS NULL);

-- other_certificates: public read of active, non-deleted certificates
CREATE POLICY "anon_select_other_certificates"
  ON other_certificates
  FOR SELECT TO anon
  USING (active_status = 1 AND deleted_at IS NULL);

-- gallery_albums: public read of published, non-deleted albums
CREATE POLICY "anon_select_gallery_albums"
  ON gallery_albums
  FOR SELECT TO anon
  USING (status = 'published' AND deleted_at IS NULL);

-- gallery: public read of non-deleted gallery items
-- (album-level visibility is enforced by the JOIN in application queries)
CREATE POLICY "anon_select_gallery"
  ON gallery
  FOR SELECT TO anon
  USING (deleted_at IS NULL);

-- testimonials: public read of published, non-deleted testimonials
CREATE POLICY "anon_select_testimonials"
  ON testimonials
  FOR SELECT TO anon
  USING (status = 'published' AND deleted_at IS NULL);

-- clients: public read of published, non-deleted clients
CREATE POLICY "anon_select_clients"
  ON clients
  FOR SELECT TO anon
  USING (status = 'published' AND deleted_at IS NULL);

-- tags: public read of non-deleted tags
CREATE POLICY "anon_select_tags"
  ON tags
  FOR SELECT TO anon
  USING (deleted_at IS NULL);

-- blogs: public read of published, non-deleted blog posts
CREATE POLICY "anon_select_blogs"
  ON blogs
  FOR SELECT TO anon
  USING (status = 'published' AND deleted_at IS NULL);

-- blog_tags: public read of tags linked to published blogs only
CREATE POLICY "anon_select_blog_tags"
  ON blog_tags
  FOR SELECT TO anon
  USING (
    blog_id IN (
      SELECT id FROM blogs
      WHERE status = 'published' AND deleted_at IS NULL
    )
  );

-- careers: public read of published, non-deleted job openings
CREATE POLICY "anon_select_careers"
  ON careers
  FOR SELECT TO anon
  USING (status = 'published' AND deleted_at IS NULL);

-- applications: NO SELECT for anon — applicants cannot read back submissions
-- (no policy → default deny for SELECT)

-- contact_messages: NO SELECT for anon — sensitive PII, admin-only
-- (no policy → default deny for SELECT)

-- seo: public read (needed by frontend for meta tags)
CREATE POLICY "anon_select_seo"
  ON seo
  FOR SELECT TO anon
  USING (true);

-- audit_logs: no anon access (no policy → default deny)


-- ─── STEP 4: INSERT policies — public submission forms ─────────────────────────

-- contact_messages: anon may INSERT but WITH CHECK enforces required fields.
-- This prevents empty-payload spam via the REST API while allowing legitimate
-- form submissions. Our backend API applies additional validation on top.
CREATE POLICY "anon_insert_contact_messages"
  ON contact_messages
  FOR INSERT TO anon
  WITH CHECK (
    name    IS NOT NULL AND length(trim(name))    > 0 AND
    email   IS NOT NULL AND length(trim(email))   > 0 AND
    subject IS NOT NULL AND length(trim(subject)) > 0 AND
    message IS NOT NULL AND length(trim(message)) > 0
  );

-- applications: anon may INSERT. The FK on resume_media_id and career_id acts
-- as an additional integrity gate (invalid IDs cause a FK violation).
CREATE POLICY "anon_insert_applications"
  ON applications
  FOR INSERT TO anon
  WITH CHECK (
    career_id       IS NOT NULL AND
    applicant_name  IS NOT NULL AND length(trim(applicant_name))  > 0 AND
    applicant_email IS NOT NULL AND length(trim(applicant_email)) > 0 AND
    resume_media_id IS NOT NULL
  );


-- ══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK (run this section to undo the migration)
-- ══════════════════════════════════════════════════════════════════════════════
/*
DROP POLICY IF EXISTS "anon_select_media"                  ON media;
DROP POLICY IF EXISTS "anon_select_homepage_sections"      ON homepage_sections;
DROP POLICY IF EXISTS "anon_select_settings"               ON settings;
DROP POLICY IF EXISTS "anon_select_categories"             ON categories;
DROP POLICY IF EXISTS "anon_select_services"               ON services;
DROP POLICY IF EXISTS "anon_select_projects"               ON projects;
DROP POLICY IF EXISTS "anon_select_project_images"         ON project_images;
DROP POLICY IF EXISTS "anon_select_project_documents"      ON project_documents;
DROP POLICY IF EXISTS "anon_select_global_certifications"  ON global_certifications;
DROP POLICY IF EXISTS "anon_select_other_certificates"     ON other_certificates;
DROP POLICY IF EXISTS "anon_select_gallery_albums"         ON gallery_albums;
DROP POLICY IF EXISTS "anon_select_gallery"                ON gallery;
DROP POLICY IF EXISTS "anon_select_testimonials"           ON testimonials;
DROP POLICY IF EXISTS "anon_select_clients"                ON clients;
DROP POLICY IF EXISTS "anon_select_tags"                   ON tags;
DROP POLICY IF EXISTS "anon_select_blogs"                  ON blogs;
DROP POLICY IF EXISTS "anon_select_blog_tags"              ON blog_tags;
DROP POLICY IF EXISTS "anon_select_careers"                ON careers;
DROP POLICY IF EXISTS "anon_select_seo"                    ON seo;
DROP POLICY IF EXISTS "anon_insert_contact_messages"       ON contact_messages;
DROP POLICY IF EXISTS "anon_insert_applications"           ON applications;

ALTER TABLE users                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE media                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections     DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings              DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories            DISABLE ROW LEVEL SECURITY;
ALTER TABLE services              DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects              DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_images        DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents     DISABLE ROW LEVEL SECURITY;
ALTER TABLE global_certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE other_certificates    DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums        DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery               DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials          DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients               DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE blogs                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags             DISABLE ROW LEVEL SECURITY;
ALTER TABLE careers               DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications          DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages      DISABLE ROW LEVEL SECURITY;
ALTER TABLE seo                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            DISABLE ROW LEVEL SECURITY;

GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
*/
