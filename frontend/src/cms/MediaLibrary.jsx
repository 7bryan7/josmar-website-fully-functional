import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import { 
  FolderPlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  ArrowUpTrayIcon, 
  MagnifyingGlassIcon,
  FolderOpenIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Client-side image compression and WebP converter utility
const compressAndResizeImage = (file, maxWidth, maxHeight, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratios
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve({
                file: compressedFile,
                width,
                height
              });
            } else {
              reject(new Error('Canvas conversion to WebP failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState([]);
  const [folders, setFolders] = useState(['/']);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [previewMedia, setPreviewMedia] = useState(null);
  const [renameMedia, setRenameMedia] = useState(null);
  const [newName, setNewName] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [newCaption, setNewCaption] = useState('');
  
  // Folder Creation state
  const [newFolderInput, setNewFolderInput] = useState('');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  const loadMedia = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (currentFolder) query.set('folder', currentFolder);
      if (search) query.set('search', search);

      const data = await api.get(`/api/admin/media?${query.toString()}`);
      setMediaList(data);
      
      const folderList = await api.get('/api/admin/media/folders');
      setFolders(folderList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [currentFolder, search]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError('');
    
    try {
      for (const file of files) {
        setUploadProgress(`Processing ${file.name}...`);
        
        let fileToUpload = file;
        let thumbnailBlob = null;
        let width = null;
        let height = null;

        // If file is an image, compress client-side and generate a thumbnail
        if (file.type.startsWith('image/')) {
          setUploadProgress(`Compressing and converting ${file.name} to WebP...`);
          const compressed = await compressAndResizeImage(file, 1920, 1080, 0.82);
          fileToUpload = compressed.file;
          width = compressed.width;
          height = compressed.height;

          setUploadProgress(`Generating thumbnail...`);
          const thumb = await compressAndResizeImage(file, 200, 200, 0.7);
          thumbnailBlob = thumb.file;
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('folder', currentFolder);
        formData.append('name', fileToUpload.name);
        if (width) formData.append('width', width);
        if (height) formData.append('height', height);
        if (thumbnailBlob) formData.append('thumbnail', thumbnailBlob);

        setUploadProgress(`Uploading ${fileToUpload.name} to storage...`);
        await api.uploadMedia(formData);
      }
      
      setUploadProgress('Upload completed successfully!');
      setTimeout(() => setUploadProgress(''), 2000);
      loadMedia();
    } catch (err) {
      setError(err.message || 'Failed to upload files.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media? This will permanently remove the file from storage.')) return;
    try {
      await api.delete(`/api/admin/media/delete/${mediaId}`);
      loadMedia();
      setPreviewMedia(null);
    } catch (e) {
      alert(e.message || 'Failed to delete media.');
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/media/rename/${renameMedia.id}`, {
        name: newName,
        alt_text: newAltText,
        caption: newCaption,
        folder: renameMedia.folder
      });
      setRenameMedia(null);
      loadMedia();
    } catch (e) {
      alert(e.message || 'Failed to rename media.');
    }
  };

  const openRenameModal = (media) => {
    setRenameMedia(media);
    setNewName(media.name);
    setNewAltText(media.alt_text || '');
    setNewCaption(media.caption || '');
  };

  const createFolder = (e) => {
    e.preventDefault();
    if (!newFolderInput) return;
    
    // Format folder name
    const formatted = '/' + newFolderInput.replace(/^\/+|\/+$/g, '');
    if (!folders.includes(formatted)) {
      setFolders([...folders, formatted]);
    }
    setCurrentFolder(formatted);
    setNewFolderInput('');
    setIsFolderModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-sans">Media Library</h1>
          <p className="text-slate-500 text-xs mt-1">Manage files, images, brochures, and application resumes inside Cloudflare R2.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Create folder btn */}
          <button 
            onClick={() => setIsFolderModalOpen(true)}
            className="button-secondary text-xs py-2 flex items-center gap-1.5"
          >
            <FolderPlusIcon className="h-5 w-5" />
            New Folder
          </button>

          {/* Upload file btn input */}
          <label className="button-primary text-xs py-2 flex items-center gap-1.5 cursor-pointer">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload File(s)
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Upload progress & error display */}
      {uploading && (
        <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-accent-400 border-t-transparent rounded-full animate-spin"></div>
            <span>{uploadProgress}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-500 text-xs font-bold px-4 py-3 rounded-xl shadow-soft">
          {error}
        </div>
      )}

      {/* Directory structure & Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Folder List */}
        <div className="lg:col-span-1 card-premium bg-white p-4 space-y-2">
          <h3 className="font-bold text-xs uppercase text-slate-400 border-b border-slate-100 pb-2 mb-3 tracking-wider">Directory Folders</h3>
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setCurrentFolder(folder)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                currentFolder === folder 
                  ? 'bg-accent-50 text-accent-500 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FolderOpenIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{folder === '/' ? 'Root (/)' : folder}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Media Files Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search toolbar */}
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files in this folder..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>

          {/* Media grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mediaList.map((media) => {
                const isImage = media.mime_type.startsWith('image/');
                const displayPath = media.thumbnail_path || media.path;

                return (
                  <div key={media.id} className="card-premium group bg-white border border-slate-100 flex flex-col justify-between">
                    {/* Media item preview */}
                    <div 
                      onClick={() => setPreviewMedia(media)}
                      className="h-28 bg-slate-100 relative cursor-pointer overflow-hidden flex items-center justify-center border-b border-slate-50"
                    >
                      {isImage ? (
                        <img 
                          src={`/media/${displayPath}`} 
                          alt={media.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <span className="font-bold text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider block mb-1">
                            {media.name.split('.').pop()}
                          </span>
                          <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[80px]">{media.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Media Info and operations */}
                    <div className="p-3 flex items-center justify-between text-xs gap-2">
                      <span className="truncate text-slate-600 font-semibold max-w-[100px]" title={media.name}>{media.name}</span>
                      <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openRenameModal(media)}
                          className="p-1 rounded text-slate-400 hover:text-accent-500 hover:bg-slate-50" 
                          title="Rename/Edit Metadata"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(media.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50" 
                          title="Delete File"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {mediaList.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-400 font-semibold bg-white rounded-2xl border border-slate-100">
                  No files found in folder "{currentFolder}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewMedia && (
        <Modal
          isOpen={!!previewMedia}
          onClose={() => setPreviewMedia(null)}
          title="Media Preview"
          size="lg"
        >
          <div className="space-y-6">
            <div className="max-w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
              {previewMedia.mime_type.startsWith('image/') ? (
                <img 
                  src={`/media/${previewMedia.path}`} 
                  alt={previewMedia.name} 
                  className="max-h-[50vh] max-w-full object-contain" 
                />
              ) : (
                <div className="py-20 text-center text-slate-400">
                  <p className="font-bold text-lg mb-2">Non-Image Document File</p>
                  <p className="text-xs">Type: {previewMedia.mime_type} | Size: {Math.round(previewMedia.size / 1024)} KB</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-400">File URL (R2 Key)</p>
                <p className="font-bold text-slate-700 select-all truncate mt-0.5">/media/{previewMedia.path}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400">File Type & Size</p>
                <p className="font-bold text-slate-700 mt-0.5">{previewMedia.mime_type} ({Math.round(previewMedia.size / 1024)} KB)</p>
              </div>
              {previewMedia.alt_text && (
                <div className="col-span-2">
                  <p className="font-semibold text-slate-400">Alt Text</p>
                  <p className="font-bold text-slate-700 mt-0.5">{previewMedia.alt_text}</p>
                </div>
              )}
              {previewMedia.caption && (
                <div className="col-span-2">
                  <p className="font-semibold text-slate-400">Caption / Description</p>
                  <p className="font-bold text-slate-700 mt-0.5">{previewMedia.caption}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <a 
                href={`/media/${previewMedia.path}`} 
                download 
                className="button-secondary text-xs py-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download File
              </a>
              <button 
                onClick={() => handleDelete(previewMedia.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Delete File
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rename & Metadata Modal */}
      {renameMedia && (
        <Modal
          isOpen={!!renameMedia}
          onClose={() => setRenameMedia(null)}
          title="Edit File Details"
          size="md"
        >
          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">File Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Alt Text</label>
              <input
                type="text"
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                placeholder="Describe this image for screen readers..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Caption / description</label>
              <textarea
                rows={3}
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Enter caption to display under the image..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setRenameMedia(null)} 
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button-primary text-sm font-bold"
              >
                Save Details
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Create New Folder"
        size="sm"
      >
        <form onSubmit={createFolder} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1 font-sans">Folder Name</label>
            <input
              type="text"
              required
              value={newFolderInput}
              onChange={(e) => setNewFolderInput(e.target.value)}
              placeholder="e.g. projects, logos, documents"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsFolderModalOpen(false)} 
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button-primary text-sm font-bold"
            >
              Create Folder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
