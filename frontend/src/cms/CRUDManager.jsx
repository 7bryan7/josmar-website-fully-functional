import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { 
  TrashIcon, 
  PencilSquareIcon, 
  PlusIcon, 
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const SCHEMAS = {
  projects: {
    title: 'Projects Portfolio',
    table: 'projects',
    listFields: [
      { key: 'name', label: 'Project Name' },
      { key: 'category', label: 'Category' },
      { key: 'client', label: 'Client' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'featured_project', label: 'Featured', boolean: true }
    ],
    formFields: [
      { key: 'name', label: 'Project Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'client', label: 'Client', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'start_date', label: 'Start Date', type: 'text', placeholder: 'e.g. Jan 2026', required: true },
      { key: 'end_date', label: 'End Date (Optional)', type: 'text', placeholder: 'e.g. Present' },
      { key: 'seo_slug', label: 'SEO Slug', type: 'text', required: true },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
      { key: 'featured_project', label: 'Featured Project', type: 'checkbox' },
      { key: 'description', label: 'Case Study / Details', type: 'textarea', required: true }
    ],
    relations: ['images', 'documents']
  },
  services: {
    title: 'Core Services',
    table: 'services',
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'icon', label: 'Icon' },
      { key: 'status', label: 'Status', badge: true }
    ],
    formFields: [
      { key: 'title', label: 'Service Title', type: 'text', required: true },
      { key: 'icon', label: 'Icon Identifier', type: 'text', placeholder: 'e.g. academic-cap', required: true },
      { key: 'image_media_id', label: 'Featured Image', type: 'media', required: false },
      { key: 'brochure_media_id', label: 'Brochure PDF File', type: 'media', required: false },
      { key: 'seo_url', label: 'SEO URL Hash', type: 'text', placeholder: 'e.g. structural-design', required: true },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
      { key: 'description', label: 'Description Details', type: 'textarea', required: true }
    ]
  },
  global_certifications: {
    title: 'Global Certifications',
    table: 'global_certifications',
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'issuing_organization', label: 'Issuing Org' },
      { key: 'active_status', label: 'Active', boolean: true }
    ],
    formFields: [
      { key: 'title', label: 'Certification Title', type: 'text', required: true },
      { key: 'issuing_organization', label: 'Issuing Organization', type: 'text', required: true },
      { key: 'org_logo_media_id', label: 'Organization Logo', type: 'media', required: false },
      { key: 'certificate_image_media_id', label: 'Certificate Image (Lightbox view)', type: 'media', required: true },
      { key: 'certificate_number', label: 'Certificate Number (Optional)', type: 'text' },
      { key: 'issue_date', label: 'Issue Date', type: 'text', placeholder: 'e.g. 2026-05-15', required: true },
      { key: 'expiry_date', label: 'Expiry Date (Optional)', type: 'text' },
      { key: 'credential_url', label: 'Credential Verification URL (Optional)', type: 'text' },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'featured_status', label: 'Featured on Homepage', type: 'checkbox' },
      { key: 'active_status', label: 'Active Certification', type: 'checkbox' },
      { key: 'description', label: 'One-line Description', type: 'textarea', required: true }
    ]
  },
  other_certificates: {
    title: 'Compliance & Safety Certificates',
    table: 'other_certificates',
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'active_status', label: 'Active', boolean: true }
    ],
    formFields: [
      { key: 'title', label: 'Certificate Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Safety, Quality', required: true },
      { key: 'certificate_image_media_id', label: 'Certificate Image file', type: 'media', required: true },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'active_status', label: 'Active', type: 'checkbox' },
      { key: 'description', label: 'Description Summary', type: 'textarea', required: true }
    ]
  },
  gallery_albums: {
    title: 'Gallery Albums',
    table: 'gallery_albums',
    listFields: [
      { key: 'name', label: 'Album Name' },
      { key: 'status', label: 'Status', badge: true }
    ],
    formFields: [
      { key: 'name', label: 'Album Name', type: 'text', required: true },
      { key: 'cover_media_id', label: 'Cover Image', type: 'media', required: false },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  gallery: {
    title: 'Gallery Images',
    table: 'gallery',
    listFields: [
      { key: 'media_id', label: 'Media Path' },
      { key: 'album_id', label: 'Album' }
    ],
    formFields: [
      { key: 'media_id', label: 'Select Image File', type: 'media', required: true },
      { key: 'album_id', label: 'Gallery Album', type: 'db_select', dbTable: 'gallery_albums', required: false },
      { key: 'category_id', label: 'Category Filter', type: 'db_select', dbTable: 'categories', filterType: 'gallery', required: false },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true }
    ]
  },
  blogs: {
    title: 'Blog / Insights Manager',
    table: 'blogs',
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status', badge: true }
    ],
    formFields: [
      { key: 'title', label: 'Article Title', type: 'text', required: true },
      { key: 'category_id', label: 'Category', type: 'db_select', dbTable: 'categories', filterType: 'blog', required: true },
      { key: 'featured_image_media_id', label: 'Featured Banner Image', type: 'media', required: false },
      { key: 'seo_url', label: 'SEO URL slug', type: 'text', placeholder: 'e.g. building-code-revisions', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'scheduled'], required: true },
      { key: 'content', label: 'Rich Text HTML Content', type: 'html', required: true }
    ],
    relations: ['tags']
  },
  clients: {
    title: 'Client Logos',
    table: 'clients',
    listFields: [
      { key: 'name', label: 'Client Name' },
      { key: 'status', label: 'Status', badge: true }
    ],
    formFields: [
      { key: 'name', label: 'Client / Agency Name', type: 'text', required: true },
      { key: 'logo_media_id', label: 'Logo Image', type: 'media', required: true },
      { key: 'website_url', label: 'Client Link (Optional)', type: 'text' },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true }
    ]
  },
  testimonials: {
    title: 'Client Reviews',
    table: 'testimonials',
    listFields: [
      { key: 'client_name', label: 'Client' },
      { key: 'company_name', label: 'Company' },
      { key: 'status', label: 'Status', badge: true }
    ],
    formFields: [
      { key: 'client_name', label: 'Client Name', type: 'text', required: true },
      { key: 'client_role', label: 'Client Role (e.g. Director)', type: 'text' },
      { key: 'company_name', label: 'Company / City', type: 'text' },
      { key: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
      { key: 'avatar_media_id', label: 'Client Photo', type: 'media', required: false },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
      { key: 'testimonial_text', label: 'Review Text', type: 'textarea', required: true }
    ]
  },
  careers: {
    title: 'Career Opportunities',
    table: 'careers',
    listFields: [
      { key: 'title', label: 'Job Title' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', badge: true }
    ],
    formFields: [
      { key: 'title', label: 'Job Title', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Tech City office', required: true },
      { key: 'experience', label: 'Experience Level', type: 'text', placeholder: 'e.g. 5+ Years', required: true },
      { key: 'display_order', label: 'Display Order', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
      { key: 'description', label: 'Role Details & Requirements', type: 'textarea', required: true }
    ]
  },
  categories: {
    title: 'Categories',
    table: 'categories',
    listFields: [
      { key: 'name', label: 'Category Name' },
      { key: 'type', label: 'Type' },
      { key: 'slug', label: 'Slug' }
    ],
    formFields: [
      { key: 'name', label: 'Category Name', type: 'text', required: true },
      { key: 'type', label: 'Module Type', type: 'select', options: ['project', 'blog', 'gallery'], required: true },
      { key: 'slug', label: 'URL Slug', type: 'text', required: true }
    ]
  },
  tags: {
    title: 'Tags',
    table: 'tags',
    listFields: [
      { key: 'name', label: 'Tag Name' },
      { key: 'slug', label: 'Slug' }
    ],
    formFields: [
      { key: 'name', label: 'Tag Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true }
    ]
  },
  applications: {
    title: 'Job Applicants',
    table: 'applications',
    readOnly: true,
    listFields: [
      { key: 'applicant_name', label: 'Name' },
      { key: 'applicant_email', label: 'Email' },
      { key: 'status', label: 'Status', badge: true }
    ],
    formFields: [
      { key: 'applicant_name', label: 'Name', type: 'text', readOnly: true },
      { key: 'applicant_email', label: 'Email', type: 'text', readOnly: true },
      { key: 'resume_media_id', label: 'Resume', type: 'media', readOnly: true },
      { key: 'cover_letter', label: 'Cover Letter', type: 'textarea', readOnly: true },
      { key: 'status', label: 'Application Status', type: 'select', options: ['pending', 'reviewed', 'rejected', 'hired'], required: true }
    ]
  },
  contact_messages: {
    title: 'Contact Messages',
    table: 'contact_messages',
    readOnly: true,
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'subject', label: 'Subject' },
      { key: 'is_read', label: 'Read Status', boolean: true }
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', readOnly: true },
      { key: 'email', label: 'Email', type: 'text', readOnly: true },
      { key: 'phone', label: 'Phone', type: 'text', readOnly: true },
      { key: 'subject', label: 'Subject', type: 'text', readOnly: true },
      { key: 'message', label: 'Message Details', type: 'textarea', readOnly: true },
      { key: 'is_read', label: 'Mark as Read', type: 'checkbox' }
    ]
  },
  users: {
    title: 'Administrators',
    table: 'users',
    listFields: [
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' }
    ],
    formFields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'email', label: 'Email Address', type: 'email', required: true },
      { key: 'password_hash', label: 'Password (Will hash on save)', type: 'text', required: true },
      { key: 'role', label: 'Access Level', type: 'select', options: ['admin'], required: true }
    ]
  }
};

export default function CRUDManager() {
  const { module } = useParams();
  const schema = SCHEMAS[module];

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [formData, setFormData] = useState({});

  // DB options for selects
  const [dbDropdowns, setDbDropdowns] = useState({});

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Media selector helper
  const [mediaList, setMediaList] = useState([]);
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState('');
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    if (schema) {
      loadRecords();
      loadDropdownOptions();
    }
  }, [module]);

  const loadRecords = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const [data, mediaData] = await Promise.all([
        api.get(`/api/admin/${schema.table}`),
        api.get('/api/admin/media')
      ]);
      setRecords(data);
      setMediaList(mediaData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownOptions = async () => {
    const dropdownFields = schema.formFields?.filter(f => f.type === 'db_select') || [];
    if (dropdownFields.length === 0) return;

    try {
      const results = await Promise.all(
        dropdownFields.map(field => api.get(`/api/admin/${field.dbTable}`))
      );
      const dropdowns = {};
      dropdownFields.forEach((field, idx) => {
        dropdowns[field.dbTable] = results[idx];
      });
      setDbDropdowns(dropdowns);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter records by search term
  const filteredRecords = records.filter(r => {
    if (!search) return true;
    const term = search.toLowerCase();
    return Object.values(r).some(val => 
      val && String(val).toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleFieldChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const openCreateForm = () => {
    const defaults = {};
    schema.formFields.forEach(f => {
      defaults[f.key] = f.type === 'checkbox' ? 0 : f.type === 'number' ? 0 : '';
      if (f.type === 'select') defaults[f.key] = f.options[0];
    });
    setFormData(defaults);
    setEditRecord(null);
    setIsFormOpen(true);
  };

  const openEditForm = async (record) => {
    try {
      // Fetch full details (which fetches relations too)
      const fullDetails = await api.get(`/api/admin/${schema.table}/${record.id}`);
      setFormData(fullDetails);
      setEditRecord(record);
      setIsFormOpen(true);
    } catch (e) {
      alert('Failed to load details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRecord) {
        // Edit request (PUT)
        await api.put(`/api/admin/${schema.table}/${editRecord.id}`, formData);
      } else {
        // Create request (POST)
        // If users table, encrypt password natively inside workers, but let's hash it.
        // We will pass the plain password and the backend will hash it on save.
        await api.post(`/api/admin/${schema.table}`, formData);
      }
      setIsFormOpen(false);
      loadRecords();
    } catch (e) {
      alert(e.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/api/admin/${schema.table}/${id}`);
      loadRecords();
    } catch (e) {
      alert(e.message || 'Deletion failed.');
    }
  };

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRecord = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkOperation = async (action) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return;

    try {
      await api.post('/api/admin/bulk-operation', {
        action,
        table: schema.table,
        ids: selectedIds
      });
      loadRecords();
    } catch (e) {
      alert(e.message || 'Bulk operation failed.');
    }
  };

  const openMediaSelector = (fieldKey) => {
    setMediaSelectorTarget(fieldKey);
    setMediaSelectorOpen(true);
  };

  const handleMediaSelect = (path) => {
    handleFieldChange(mediaSelectorTarget, path);
    setMediaSelectorOpen(false);
  };

  if (!schema) {
    return <div className="text-center py-20 font-bold text-slate-500">Invalid Admin Module</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-sans">{schema.title}</h1>
          <p className="text-slate-500 text-xs mt-1">Manage, modify, and review listings.</p>
        </div>

        {!schema.readOnly && (
          <button 
            onClick={openCreateForm}
            className="button-primary text-xs py-2 flex items-center gap-1"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Record
          </button>
        )}
      </div>

      {/* Bulk Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white text-xs px-4 py-3 rounded-xl flex items-center gap-4 shadow-soft">
          <span className="font-bold">{selectedIds.length} Selected</span>
          <div className="h-4 w-px bg-slate-700" />
          <button 
            onClick={() => handleBulkOperation('delete')}
            className="text-red-400 hover:text-red-300 font-semibold"
          >
            Delete Selected
          </button>
          {schema.formFields.some(f => f.key === 'status') && (
            <>
              <button 
                onClick={() => handleBulkOperation('publish')}
                className="text-green-400 hover:text-green-300 font-semibold ml-2"
              >
                Publish Selected
              </button>
              <button 
                onClick={() => handleBulkOperation('draft')}
                className="text-slate-400 hover:text-slate-300 font-semibold ml-2"
              >
                Draft Selected
              </button>
            </>
          )}
        </div>
      )}

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 shadow-sm"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="card-premium bg-white overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 w-8">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={selectedIds.length === currentRecords.length && currentRecords.length > 0} 
                    />
                  </th>
                  {schema.listFields.map((field) => (
                    <th key={field.key} className="px-6 py-4">{field.label}</th>
                  ))}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {currentRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(row.id)} 
                        onChange={() => handleSelectRecord(row.id)}
                      />
                    </td>
                    {schema.listFields.map((field) => {
                      let val = row[field.key];
                      if (field.boolean) {
                        return (
                          <td key={field.key} className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                              val === 1 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {val === 1 ? 'Yes' : 'No'}
                            </span>
                          </td>
                        );
                      }
                      if (field.badge) {
                        return (
                          <td key={field.key} className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                              val === 'published' || val === 'hired'
                                ? 'bg-green-50 text-green-600' 
                                : val === 'draft' || val === 'pending'
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {val}
                            </span>
                          </td>
                        );
                      }
                      return <td key={field.key} className="px-6 py-4 truncate max-w-[200px]">{String(val || '')}</td>;
                    })}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditForm(row)}
                        className="p-1 rounded text-slate-400 hover:text-accent-500 hover:bg-slate-50"
                        title={schema.readOnly ? 'View Details' : 'Edit'}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      {!schema.readOnly && (
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentRecords.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-semibold">No records found.</div>
            )}
          </div>
        )}

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Editor Modal Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={schema.readOnly ? 'Record Details' : (editRecord ? 'Edit Record' : 'Create Record')}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schema.formFields.map((field) => {
                const isReadOnly = field.readOnly || schema.readOnly;
                
                if (field.type === 'textarea') {
                  return (
                    <div key={field.key} className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{field.label}</label>
                      <textarea
                        rows={5}
                        required={field.required}
                        disabled={isReadOnly}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                      />
                    </div>
                  );
                }

                if (field.type === 'html') {
                  return (
                    <div key={field.key} className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{field.label}</label>
                      <textarea
                        rows={10}
                        required={field.required}
                        disabled={isReadOnly}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder="Write raw HTML content for rich styling..."
                        className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.key}>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{field.label}</label>
                      <select
                        required={field.required}
                        disabled={isReadOnly}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                      >
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'db_select') {
                  const list = dbDropdowns[field.dbTable] || [];
                  const filtered = field.filterType 
                    ? list.filter(item => item.type === field.filterType) 
                    : list;

                  return (
                    <div key={field.key}>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{field.label}</label>
                      <select
                        required={field.required}
                        disabled={isReadOnly}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                      >
                        <option value="">Select Reference...</option>
                        {filtered.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name || opt.title || opt.username}</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'media') {
                  return (
                    <div key={field.key} className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{field.label}</label>
                      <div className="flex gap-4 items-center">
                        <div className="h-10 w-24 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 text-[10px] text-slate-400 font-semibold truncate px-2">
                          {formData[field.key] ? formData[field.key] : 'None'}
                        </div>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => openMediaSelector(field.key)}
                            className="button-secondary text-xs py-2 flex items-center gap-1.5"
                          >
                            <PhotoIcon className="h-5 w-5" />
                            Select File
                          </button>
                        )}
                        {formData[field.key] && !isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleFieldChange(field.key, '')}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Clear
                          </button>
                        )}
                        {formData[field.key] && (
                          <a 
                            href={`/media/${formData[field.key]}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-accent-500 hover:text-accent-600 text-xs font-semibold"
                          >
                            View File
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }

                if (field.type === 'checkbox') {
                  return (
                    <div key={field.key} className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        disabled={isReadOnly}
                        checked={formData[field.key] === 1}
                        onChange={(e) => handleFieldChange(field.key, e.target.checked ? 1 : 0)}
                        className="rounded text-accent-500"
                      />
                      <label className="text-[10px] font-bold uppercase text-slate-400">{field.label}</label>
                    </div>
                  );
                }

                // Default text inputs
                return (
                  <div key={field.key}>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      disabled={isReadOnly}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Custom relations tables (specifically for projects sub images & files) */}
            {editRecord && schema.relations && schema.relations.includes('images') && (
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-wider">Project Image Gallery</h3>
                <div className="space-y-4">
                  {formData.images && formData.images.map((img, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg text-xs">
                      <img src={`/media/${img.path}`} alt="project img" className="h-10 w-10 object-cover rounded" />
                      <div className="flex-grow grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={img.is_primary === 1} 
                            onChange={(e) => {
                              const imgs = [...formData.images].map((im, i) => ({
                                ...im,
                                is_primary: i === idx ? (e.target.checked ? 1 : 0) : 0 // Ensure only one is primary
                              }));
                              handleFieldChange('images', imgs);
                            }}
                          />
                          <span>Primary Hero</span>
                        </label>
                        <input 
                          type="number" 
                          placeholder="Order"
                          value={img.display_order || 0}
                          onChange={(e) => {
                            const imgs = [...formData.images];
                            imgs[idx].display_order = parseInt(e.target.value, 10) || 0;
                            handleFieldChange('images', imgs);
                          }}
                          className="px-2 py-1 border border-slate-200 rounded text-center w-16"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const imgs = formData.images.filter((_, i) => i !== idx);
                          handleFieldChange('images', imgs);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => openMediaSelector('add_project_image')}
                    className="button-secondary text-[11px] py-1.5 flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" /> Add Image
                  </button>
                </div>
              </div>
            )}

            {editRecord && schema.relations && schema.relations.includes('documents') && (
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-wider">Project PDF Documents</h3>
                <div className="space-y-4">
                  {formData.documents && formData.documents.map((doc, idx) => (
                    <div key={idx} className="flex gap-4 items-center justify-between bg-slate-50 p-3 rounded-lg text-xs">
                      <span className="truncate max-w-sm">{doc.name || doc.path}</span>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="number" 
                          placeholder="Order"
                          value={doc.display_order || 0}
                          onChange={(e) => {
                            const docs = [...formData.documents];
                            docs[idx].display_order = parseInt(e.target.value, 10) || 0;
                            handleFieldChange('documents', docs);
                          }}
                          className="px-2 py-1 border border-slate-200 rounded text-center w-16"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const docs = formData.documents.filter((_, i) => i !== idx);
                            handleFieldChange('documents', docs);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => openMediaSelector('add_project_document')}
                    className="button-secondary text-[11px] py-1.5 flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" /> Add Document File
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {schema.readOnly ? 'Close' : 'Cancel'}
              </button>
              {!schema.readOnly && (
                <button 
                  type="submit" 
                  className="button-primary text-sm font-bold"
                >
                  Save Record
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Media Selector Modal */}
      <Modal
        isOpen={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        title="Select Media File"
        size="lg"
      >
        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {mediaList.map((media) => {
            const isImg = media.mime_type.startsWith('image/');
            return (
              <div 
                key={media.id} 
                onClick={() => {
                  if (mediaSelectorTarget === 'add_project_image') {
                    const existing = formData.images || [];
                    handleFieldChange('images', [...existing, { 
                      media_id: media.id, 
                      path: media.path, 
                      is_primary: 0, 
                      display_order: existing.length 
                    }]);
                    setMediaSelectorOpen(false);
                  } else if (mediaSelectorTarget === 'add_project_document') {
                    const existing = formData.documents || [];
                    handleFieldChange('documents', [...existing, { 
                      media_id: media.id, 
                      name: media.name, 
                      path: media.path, 
                      display_order: existing.length 
                    }]);
                    setMediaSelectorOpen(false);
                  } else {
                    if (mediaSelectorTarget && (mediaSelectorTarget.endsWith('_id') || mediaSelectorTarget.endsWith('_media_id'))) {
                      handleMediaSelect(media.id);
                    } else {
                      handleMediaSelect(media.path);
                    }
                  }
                }}
                className="card-premium h-24 overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 hover:border-accent-500 transition-colors flex flex-col items-center justify-center p-2 text-center"
              >
                {isImg ? (
                  <img src={`/media/${media.thumbnail_path || media.path}`} alt={media.name} className="max-h-[80%] object-contain" />
                ) : (
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{media.name.split('.').pop()}</div>
                )}
                <span className="text-[9px] text-slate-500 font-semibold truncate max-w-[80px] mt-1">{media.name}</span>
              </div>
            );
          })}
          {mediaList.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-400 text-xs font-semibold">
              No files available in media library. Please upload files in Media Library module first!
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
