-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS seo;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS careers;
DROP TABLE IF EXISTS blog_tags;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS gallery_albums;
DROP TABLE IF EXISTS other_certificates;
DROP TABLE IF EXISTS global_certifications;
DROP TABLE IF EXISTS project_documents;
DROP TABLE IF EXISTS project_images;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS homepage_sections;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- UUID
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 2. Media Table (metadata stored in DB, actual file in R2)
CREATE TABLE media (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL, -- R2 Key
    size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    alt_text TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    folder TEXT DEFAULT '/',
    thumbnail_path TEXT DEFAULT NULL, -- R2 Key for thumbnail
    width INTEGER DEFAULT NULL,
    height INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 3. Homepage Sections Table
CREATE TABLE homepage_sections (
    id TEXT PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL, -- 'hero', 'intro', 'why_choose_us', etc.
    title TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    is_enabled INTEGER DEFAULT 1, -- 0 or 1
    display_order INTEGER NOT NULL,
    background_color TEXT DEFAULT 'white',
    background_image_media_id TEXT REFERENCES media(id),
    padding_y TEXT DEFAULT 'py-16',
    animation_type TEXT DEFAULT 'fade-up',
    settings_json TEXT DEFAULT '{}', -- Custom JSON options
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Settings Table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'general', 'contact', 'social', 'seo', etc.
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Categories Table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'project', 'blog', 'gallery'
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 6. Services Table
CREATE TABLE services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Heroicon component identifier string
    image_media_id TEXT REFERENCES media(id),
    brochure_media_id TEXT REFERENCES media(id),
    seo_url TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    display_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 7. Projects Table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    client TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    featured_project INTEGER DEFAULT 0, -- 0 or 1
    seo_slug TEXT UNIQUE NOT NULL,
    display_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 8. Project Images Table
CREATE TABLE project_images (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    is_primary INTEGER DEFAULT 0, -- 0 or 1
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 9. Project Documents Table
CREATE TABLE project_documents (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 10. Global Certifications Table
CREATE TABLE global_certifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    org_logo_media_id TEXT REFERENCES media(id),
    certificate_image_media_id TEXT NOT NULL REFERENCES media(id),
    certificate_number TEXT DEFAULT NULL,
    issue_date TEXT NOT NULL,
    expiry_date TEXT DEFAULT NULL,
    credential_url TEXT DEFAULT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    featured_status INTEGER DEFAULT 0, -- 0 or 1
    active_status INTEGER DEFAULT 1, -- 0 or 1
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 11. Other Certificates Table
CREATE TABLE other_certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    certificate_image_media_id TEXT NOT NULL REFERENCES media(id),
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. 'Safety', 'Quality', 'Technical'
    display_order INTEGER NOT NULL,
    active_status INTEGER DEFAULT 1, -- 0 or 1
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 12. Gallery Albums Table
CREATE TABLE gallery_albums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    cover_media_id TEXT REFERENCES media(id),
    display_order INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 13. Gallery Table (Album images)
CREATE TABLE gallery (
    id TEXT PRIMARY KEY,
    album_id TEXT REFERENCES gallery_albums(id) ON DELETE SET NULL,
    media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 14. Testimonials Table
CREATE TABLE testimonials (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_role TEXT DEFAULT '',
    company_name TEXT DEFAULT '',
    testimonial_text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    avatar_media_id TEXT REFERENCES media(id),
    display_order INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 15. Clients Table (Logos for homepage etc.)
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_media_id TEXT REFERENCES media(id),
    website_url TEXT DEFAULT '',
    display_order INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 16. Tags Table
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 17. Blogs Table
CREATE TABLE blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Rich text HTML
    category_id TEXT REFERENCES categories(id),
    featured_image_media_id TEXT REFERENCES media(id),
    seo_url TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'scheduled'
    publish_date DATETIME DEFAULT NULL, -- Null if published immediately
    author_id TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 18. Blog Tags Relationship
CREATE TABLE blog_tags (
    blog_id TEXT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, tag_id)
);

-- 19. Careers Table (Job Openings)
CREATE TABLE careers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    description TEXT NOT NULL, -- Rich Text details
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    display_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- 20. Applications Table
CREATE TABLE applications (
    id TEXT PRIMARY KEY,
    career_id TEXT NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    resume_media_id TEXT NOT NULL REFERENCES media(id), -- Resume file in R2
    cover_letter TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'rejected', 'hired'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. Contact Messages Table
CREATE TABLE contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0, -- 0 or 1
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. SEO Table (can be attached to entities or static pages)
CREATE TABLE seo (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- 'page', 'project', 'blog', 'service'
    entity_id TEXT UNIQUE DEFAULT NULL, -- UUID of project/blog/service, or NULL for static pages (e.g. 'home')
    meta_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    canonical_url TEXT DEFAULT NULL,
    og_image_media_id TEXT REFERENCES media(id),
    og_title TEXT DEFAULT NULL,
    og_description TEXT DEFAULT NULL,
    twitter_card TEXT DEFAULT 'summary_large_image',
    schema_json TEXT DEFAULT NULL, -- Schema.org Structured Data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. Audit Logs Table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'CREATE_PROJECT', 'DELETE_MEDIA', etc.
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
