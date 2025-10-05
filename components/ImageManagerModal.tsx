import React, { useState, useEffect, useCallback } from 'react';
import TrashIcon from './icons/TrashIcon';

interface ImageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectPath: string;
  productIndex: number;
  productName: string;
  onUpdate: () => void;
}

const ImageManagerModal: React.FC<ImageManagerModalProps> = ({ isOpen, onClose, projectPath, productIndex, productName, onUpdate }) => {
  const [images, setImages] = useState<{ path: string; src: string }[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!projectPath) return;
    setIsLoading(true);
    const imagePaths = await window.electronAPI.listImages(projectPath, productIndex);
    const imagesData = await Promise.all(
      imagePaths.map(async (path) => ({
        path,
        src: await window.electronAPI.getImageAsBase64(path),
      }))
    );
    setImages(imagesData.filter(img => img.src));
    setIsLoading(false);
  }, [projectPath, productIndex]);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, fetchImages]);

  const handleDownload = async () => {
    if (!imageUrl || !projectPath) return;
    setIsDownloading(true);
    const newPath = await window.electronAPI.downloadImage(projectPath, productIndex, imageUrl);
    if (newPath) {
        setImageUrl('');
        await fetchImages();
        onUpdate();
    } else {
        alert("Falha ao baixar a imagem. Verifique a URL e tente novamente.");
    }
    setIsDownloading(false);
  };

  const handleDelete = async (imagePath: string) => {
    await window.electronAPI.deleteImage(imagePath);
    await fetchImages();
    onUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-yt-dark-gray rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 pr-2 pl-6 flex justify-between items-center border-b border-gray-200 dark:border-yt-light-gray/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-yt-text-primary truncate pr-4">
            Gerenciar Imagens para: <span className="font-normal">{productName}</span>
          </h2>
          <button onClick={onClose} aria-label="Fechar modal" className="p-2 text-gray-500 hover:bg-gray-100 dark:text-yt-text-secondary dark:hover:bg-yt-light-gray rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-yt-text-secondary mb-1">URL da Imagem</label>
            <div className="flex gap-2">
              <input
                id="imageUrl"
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onPaste={e => {
                    const pastedUrl = e.clipboardData.getData('text');
                    setImageUrl(pastedUrl);
                }}
                placeholder="Cole o endereço da imagem aqui..."
                className="flex-grow block w-full bg-white dark:bg-yt-light-gray border-gray-300 dark:border-yt-light-gray rounded-lg py-2 px-3 text-gray-900 dark:text-yt-text-primary focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-yt-light-gray sm:text-sm"
              />
              <button onClick={handleDownload} disabled={!imageUrl || isDownloading} className="py-2 px-4 bg-gray-800 hover:bg-gray-900 dark:bg-yt-text-primary dark:hover:bg-white text-white dark:text-yt-black font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isDownloading ? 'Baixando...' : 'Baixar'}
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-yt-text-secondary mb-3">Imagens Salvas ({images.length})</h3>
            {isLoading ? (
              <p className="text-gray-500 dark:text-yt-text-secondary">Carregando...</p>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.path} className="relative group aspect-square">
                    <img src={image.src} alt={`Produto ${productIndex + 1} Imagem ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-yt-light-gray" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <button onClick={() => handleDelete(image.path)} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-yt-light-gray rounded-lg">
                <p className="text-gray-500 dark:text-yt-text-secondary">Nenhuma imagem salva para este produto.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageManagerModal;