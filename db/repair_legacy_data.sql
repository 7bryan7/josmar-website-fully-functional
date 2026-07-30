-- Repair services table
UPDATE services SET image_media_id = (SELECT id FROM media WHERE path = services.image_media_id) WHERE image_media_id IN (SELECT path FROM media);
UPDATE services SET brochure_media_id = (SELECT id FROM media WHERE path = services.brochure_media_id) WHERE brochure_media_id IN (SELECT path FROM media);

-- Repair blogs table
UPDATE blogs SET featured_image_media_id = (SELECT id FROM media WHERE path = blogs.featured_image_media_id) WHERE featured_image_media_id IN (SELECT path FROM media);

-- Repair testimonials table
UPDATE testimonials SET avatar_media_id = (SELECT id FROM media WHERE path = testimonials.avatar_media_id) WHERE avatar_media_id IN (SELECT path FROM media);

-- Repair clients table
UPDATE clients SET logo_media_id = (SELECT id FROM media WHERE path = clients.logo_media_id) WHERE logo_media_id IN (SELECT path FROM media);

-- Repair gallery table
UPDATE gallery SET media_id = (SELECT id FROM media WHERE path = gallery.media_id) WHERE media_id IN (SELECT path FROM media);

-- Repair gallery_albums table
UPDATE gallery_albums SET cover_media_id = (SELECT id FROM media WHERE path = gallery_albums.cover_media_id) WHERE cover_media_id IN (SELECT path FROM media);

-- Repair global_certifications table
UPDATE global_certifications SET org_logo_media_id = (SELECT id FROM media WHERE path = global_certifications.org_logo_media_id) WHERE org_logo_media_id IN (SELECT path FROM media);
UPDATE global_certifications SET certificate_image_media_id = (SELECT id FROM media WHERE path = global_certifications.certificate_image_media_id) WHERE certificate_image_media_id IN (SELECT path FROM media);

-- Repair other_certificates table
UPDATE other_certificates SET certificate_image_media_id = (SELECT id FROM media WHERE path = other_certificates.certificate_image_media_id) WHERE certificate_image_media_id IN (SELECT path FROM media);
