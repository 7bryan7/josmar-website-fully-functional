-- Seed default settings for PostgreSQL / Supabase
INSERT INTO settings (key, value, description, category) VALUES
('company_name', 'Josmar Consulting Engineers', 'Name of the company', 'general'),
('company_logo', '', 'URL of the company logo from media library', 'general'),
('favicon', '', 'URL of the favicon', 'general'),
('primary_color', '#0f172a', 'Primary color hex code (Dark Blue)', 'theme'),
('secondary_color', '#ffffff', 'Secondary color hex code (White)', 'theme'),
('accent_color', '#0ea5e9', 'Accent color hex code (Sky Blue)', 'theme'),
('phone_numbers', '["+1 (555) 019-2834", "+1 (555) 019-2835"]', 'JSON list of contact phone numbers', 'contact'),
('emails', '["info@josmar.com", "careers@josmar.com"]', 'JSON list of contact emails', 'contact'),
('office_address', '123 Engineering Way, Suite 400, Tech City, TC 94016', 'Physical office address', 'contact'),
('business_hours', '{"weekdays": "8:00 AM - 5:00 PM", "saturday": "9:00 AM - 1:00 PM", "sunday": "Closed"}', 'Business hours JSON object', 'contact'),
('social_links', '{"linkedin": "https://linkedin.com/company/josmar", "twitter": "https://twitter.com/josmar_eng", "facebook": ""}', 'JSON object of social links', 'social'),
('seo_default_title', 'Josmar Consulting Engineers | Expert Engineering Consulting', 'Default SEO Title', 'seo'),
('seo_default_description', 'Josmar Consulting Engineers provides professional structural, environmental, and civil engineering consulting services.', 'Default SEO Description', 'seo'),
('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345093747!2d-122.4194155!3d37.7749295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807bed800989%3A0x6b7b252ee3e3a47!2sSilicon%20Valley!5e0!3m2!1sen!2sus!4v1620000000000', 'Google Maps iframe source URL', 'contact'),
('footer_copyright', '© 2026 Josmar Consulting Engineers. All rights reserved.', 'Footer copyright notice', 'footer'),
('footer_tagline', 'Engineering a sustainable and resilient future through innovative consulting solutions.', 'Tagline displayed in the footer', 'footer'),
('analytics_id', '', 'Google Analytics Tag ID (e.g. G-XXXXXX)', 'general'),
('hero_image_1', '', 'Media path for Hero Image 1', 'general'),
('hero_image_2', '', 'Media path for Hero Image 2', 'general'),
('hero_image_3', '', 'Media path for Hero Image 3', 'general')
ON CONFLICT (key) DO NOTHING;

-- Seed default categories
INSERT INTO categories (id, name, type, slug) VALUES
('cat-proj-structural', 'Structural Engineering', 'project', 'structural-engineering'),
('cat-proj-environmental', 'Environmental Engineering', 'project', 'environmental-engineering'),
('cat-proj-civil', 'Civil Infrastructure', 'project', 'civil-infrastructure'),
('cat-blog-news', 'Company News', 'blog', 'company-news'),
('cat-blog-insights', 'Technical Insights', 'blog', 'technical-insights')
ON CONFLICT (id) DO NOTHING;

-- Seed default homepage sections
INSERT INTO homepage_sections (id, section_key, title, subtitle, is_enabled, display_order, background_color, padding_y, animation_type, settings_json) VALUES
('sec-hero', 'hero', 'Engineering Excellence for Complex Projects', 'Innovative structural, civil, and environmental consulting services tailored for public and private clients.', 1, 10, 'bg-slate-900', 'py-24 md:py-32', 'fade-in', '{"button_text":"Our Services","button_link":"/services","secondary_button_text":"View Projects","secondary_button_link":"/projects"}'),
('sec-intro', 'intro', 'Who We Are', 'A dedicated team of licensed professional engineers committing to high-quality consulting.', 1, 20, 'bg-white', 'py-16', 'fade-up', '{"body_text":"For over two decades, Josmar Consulting Engineers has delivered resilient structural, civil, and environmental engineering solutions. We combine advanced modeling tools with field expertise to ensure every project is built to last, complying with state and federal regulations while optimizing construction cost and environmental impact."}'),
('sec-why-us', 'why_choose_us', 'Why Choose Josmar?', 'What sets our engineering consulting firm apart from the rest.', 1, 30, 'bg-slate-50', 'py-16', 'fade-up', '{"cards":[{"title":"Licensed Experts","desc":"Our engineers hold PE/SE licenses across multiple states with decades of combined experience."},{"title":"Regulatory Compliance","desc":"Deep understanding of local building codes, EPA standards, and zoning laws."},{"title":"Cost-Effective","desc":"We optimize structural sizes and materials to reduce construction overhead without compromising safety."}]}'),
('sec-services', 'services', 'Core Engineering Services', 'State-of-the-art consulting services covering multiple disciplines.', 1, 40, 'bg-white', 'py-16', 'fade-up', '{"limit":3}'),
('sec-projects', 'projects', 'Featured Projects', 'Explore some of our recent high-impact engineering accomplishments.', 1, 50, 'bg-slate-50', 'py-16', 'fade-up', '{"limit":3}'),
('sec-stats', 'stats', 'Our Impact in Numbers', 'Key project and organization milestones we have achieved.', 1, 60, 'bg-slate-900', 'py-12', 'fade-in', '{"stats":[{"label":"Projects Completed","value":"250+"},{"label":"Licensed Engineers","value":"15"},{"label":"Years of Service","value":"20+"},{"label":"Client Satisfaction","value":"99%"}]}'),
('sec-testimonials', 'testimonials', 'What Our Clients Say', 'Client reviews and testimonials from our long-term partners.', 1, 70, 'bg-white', 'py-16', 'fade-up', '{"limit":3}'),
('sec-logos', 'logos', 'Trusted By Industry Leaders', 'We collaborate with municipal and private partners to execute public works.', 1, 80, 'bg-slate-50', 'py-12', 'fade-in', '{}'),
('sec-news', 'news', 'Latest Insights & News', 'Stay updated with our recent publications and engineering developments.', 1, 90, 'bg-white', 'py-16', 'fade-up', '{"limit":3}'),
('sec-cta', 'cta', 'Ready to Start Your Next Engineering Venture?', 'Contact our engineering team today to request a quote or project evaluation.', 1, 100, 'bg-sky-700', 'py-16', 'fade-in', '{"button_text":"Get In Touch","button_link":"/contact"}')
ON CONFLICT (id) DO NOTHING;

-- Seed static pages SEO defaults
INSERT INTO seo (id, entity_type, entity_id, meta_title, meta_description, canonical_url, og_image_media_id, og_title, og_description, twitter_card, schema_json) VALUES
('seo-static-home', 'page', 'home', 'Josmar Consulting Engineers | Engineering Consulting Services', 'Professional structural, civil, and environmental engineering consulting services for commercial and municipal projects.', '/', NULL, 'Josmar Consulting Engineers', 'Professional structural, civil, and environmental engineering consulting services.', 'summary_large_image', NULL),
('seo-static-about', 'page', 'about_us', 'About Us | Josmar Consulting Engineers', 'Learn about our engineering expertise, leadership team, and corporate culture at Josmar.', '/about-us', NULL, 'About Josmar Consulting Engineers', 'Learn about our engineering team and services.', 'summary_large_image', NULL),
('seo-static-services', 'page', 'services', 'Engineering Services | Josmar Consulting Engineers', 'Our core consulting specialties including structural design, civil infrastructure, and environmental assessments.', '/services', NULL, 'Engineering Services - Josmar', 'Our structural, civil, and environmental engineering consulting services.', 'summary_large_image', NULL),
('seo-static-projects', 'page', 'projects', 'Engineering Projects Portfolio | Josmar Consulting Engineers', 'Explore our engineering portfolio featuring municipal infrastructures, seismic retrofits, and civil developments.', '/projects', NULL, 'Engineering Projects Portfolio', 'Explore our engineering consulting projects.', 'summary_large_image', NULL),
('seo-static-credentials', 'page', 'credentials', 'Company Credentials & Certifications | Josmar Consulting Engineers', 'Review our global certifications, industry accreditations, and professional engineering licenses.', '/credentials', NULL, 'Company Credentials & Certifications', 'Review our certifications and licenses.', 'summary_large_image', NULL),
('seo-static-gallery', 'page', 'gallery', 'Project Gallery | Josmar Consulting Engineers', 'Visual gallery of our ongoing and completed projects, construction sites, and CAD/BIM models.', '/gallery', NULL, 'Project Gallery - Josmar', 'Visual gallery of our engineering projects.', 'summary_large_image', NULL),
('seo-static-careers', 'page', 'careers', 'Careers | Join Our Engineering Team', 'Explore job openings for licensed engineers, designers, and project managers at Josmar Consulting Engineers.', '/careers', NULL, 'Careers at Josmar', 'Join our engineering team. Explore open positions.', 'summary_large_image', NULL),
('seo-static-blog', 'page', 'blog', 'Engineering Blog & News | Josmar Consulting Engineers', 'Latest updates, technical publications, and industry news from our professional engineering consultants.', '/blog', NULL, 'Engineering Blog & News', 'Read news and articles from our engineers.', 'summary_large_image', NULL),
('seo-static-contact', 'page', 'contact_us', 'Contact Us | Josmar Consulting Engineers', 'Get in touch with our engineering offices in Tech City. Request proposals or consult our team.', '/contact', NULL, 'Contact Josmar Consulting Engineers', 'Request proposals or consult our engineering team.', 'summary_large_image', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed default admin user (username: admin, password: admin123)
-- In Supabase Auth, this record will link via foreign keys to auth.users.
-- Administrators can also register this manually using the setup form if they prefer to link their own custom accounts.
INSERT INTO users (id, username, password_hash, email, role) VALUES
('usr-admin-default', 'admin', 'pbkdf2_sha256$100000$0eadc7ce5ee3d45925f68ba9999aa962$99a89253c43e814ea59a1b84787d3f31ae8efcde2460cdbaf0e3d6bbacdc1c33', 'admin@josmar.com', 'admin')
ON CONFLICT (id) DO NOTHING;
