import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Image as ImageIcon, AlertCircle, UploadCloud, Loader2 } from 'lucide-react';
import { storage } from '../firebaseConfig'; // Import storage
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const ImageUploader = ({ imageUrls, onImageUrlsChange, onFilesUploaded, defaultImageUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleImageUpload = async (event) => {
    setError('');
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    let uploadedUrls = [];
    let newFiles = [];

    const options = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width/height
      useWebWorker: true, // Use web worker for better performance
      fileType: 'image/jpeg' // Output as JPEG
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedFile = await imageCompression(file, options);
        newFiles.push(compressedFile);
        
        const storageRef = ref(storage, `images/${Date.now()}_${compressedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (uploadError) => {
              console.error("Upload error:", uploadError);
              setError("Failed to upload image. Please try again.");
              setUploading(false);
              reject(uploadError);
            }, 
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }

      onImageUrlsChange([...imageUrls, ...uploadedUrls]);
      if (onFilesUploaded) {
        onFilesUploaded(newFiles);
      }
      setUploading(false);

    } catch (e) {
      console.error("Image upload or compression error:", e);
      setError("An error occurred during upload. Please ensure files are images and try again.");
      setUploading(false);
    }
  };

  const handleRemoveImageUrl = (urlToRemove) => {
    onImageUrlsChange(imageUrls.filter(url => url !== urlToRemove));
  };

  const imagesToDisplay = imageUrls.length > 0 ? imageUrls : (defaultImageUrl ? [defaultImageUrl] : []);

  return (
    <div>
      <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Property Images</label>
      <div className="mb-4">
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        <label 
          htmlFor="file-upload" 
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all border ${uploading ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 cursor-pointer shadow-lg shadow-emerald-900/20'}`}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Uploading: {Math.round(uploadProgress)}%
            </>
          ) : (
            <>
              <UploadCloud size={20} /> Upload Images from Computer
            </>
          )}
        </label>
        {error && (
          <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </p>
        )}
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {imagesToDisplay.map((url, index) => (
          <div key={index} className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700 group hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-slate-700 relative">
               <img 
                 src={url} 
                 alt="Thumbnail" 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   e.target.style.display = 'none';
                   e.target.nextSibling.style.display = 'flex';
                 }}
               />
               <div className="hidden absolute inset-0 w-full h-full items-center justify-center text-slate-600 bg-slate-900">
                 <ImageIcon size={16} />
               </div>
            </div>
            <span className="text-slate-300 truncate flex-1 text-xs font-mono">{url}</span>
            <button
              type="button"
              onClick={() => handleRemoveImageUrl(url)}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Remove Image"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {imagesToDisplay.length === 0 && (
            <div className="flex items-center justify-center h-24 text-slate-500 bg-slate-800 rounded-lg border border-slate-700 text-sm">
                No images yet.
            </div>
        )}
      </div>
    </div>
  );
};

ImageUploader.propTypes = {
  imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
  onImageUrlsChange: PropTypes.func.isRequired,
  onFilesUploaded: PropTypes.func,
  defaultImageUrl: PropTypes.string, // New prop type
};

export default ImageUploader;