import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const DropzoneUploader = ({
    onDrop,
    defaultImage = null,
    onClear,
    height = 150,
    accept = { 'image/*': [] },
    message = "Drag and drop a file here or click"
}) => {
    const [preview, setPreview] = useState(defaultImage);
    const [isHovered, setIsHovered] = useState(false);

    // Update internal preview state if parent tells us to via defaultImage
    useEffect(() => {
        setPreview(defaultImage);
    }, [defaultImage]);

    const handleDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            if (onDrop) onDrop(file, objectUrl);
        }
    }, [onDrop]);

    const handleClear = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (onClear) onClear();
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept,
        multiple: false
    });

    const rootProps = getRootProps({
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false)
    });

    return (
        <div {...rootProps} className={`dropify-wrapper ${preview ? 'has-preview' : ''}`} style={{ height: `${height}px` }}>
            <input {...getInputProps()} />

            {preview ? (
                <>
                    <div className="dropify-preview" style={{ display: 'block' }}>
                        <span className="dropify-render">
                            <img src={preview} alt="Preview" style={{ maxHeight: `${height - 10}px`, maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
                        </span>

                        <div className="dropify-infos" style={{ opacity: isDragActive || isHovered ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
                            <div className="dropify-infos-inner">
                                <p className="dropify-infos-message">
                                    {isDragActive ? 'Drop new file to replace' : 'Click to add or edit'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="dropify-clear" onClick={handleClear} style={{ display: 'block', color: 'white' }}>
                        Remove
                    </button>
                    {/* Invisible message structure so Dropify CSS doesn't collapse */}
                    <div className="dropify-message" style={{ display: 'none' }}>
                        <span className="file-icon"></span>
                        <p>{message}</p>
                    </div>
                </>
            ) : (
                <div className="dropify-message" style={{ display: 'block' }}>
                    <span className="file-icon"></span>
                    <p>{isDragActive ? 'Drop file here...' : message}</p>
                </div>
            )}
        </div>
    );
};

export default DropzoneUploader;
