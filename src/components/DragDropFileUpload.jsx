import React, { useState, useRef, useEffect } from 'react';

const DragDropFileUpload = ({ label, name, currentFile, onFileSelect, accept = "image/*", height = "100px", required = false }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (currentFile) {
            if (typeof currentFile === 'string') {
                if (currentFile.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                    setPreview(currentFile);
                } else {
                    setPreview('file');
                }
            } else if (currentFile instanceof File) {
                if (currentFile.type.startsWith('image/')) {
                    const objectUrl = URL.createObjectURL(currentFile);
                    setPreview(objectUrl);
                    return () => URL.revokeObjectURL(objectUrl);
                } else {
                    setPreview('file');
                }
            }
        } else {
            setPreview(null);
        }
    }, [currentFile]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        onFileSelect(name, file);
    };

    const handleRemove = (e) => {
        e.stopPropagation(); 
        onFileSelect(name, null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div className="form-group" style={{ marginBottom: '15px' }}>
            <style>
                {`
                @keyframes moveStripes {
                    from { background-position: 0 0; }
                    to { background-position: 28px 0; }
                }
                `}
            </style>
            {label && (
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <div
                className={`drag-drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    border: 'none',
                    borderRadius: '2px',
                    padding: '2px 15px',
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: height,
                    maxHeight: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    background: (dragActive || isHovered) 
                        ? 'repeating-linear-gradient(-45deg, #fff, #fff 10px, #fdf7f0 10px, #fdf7f0 20px)' 
                        : '#fafafa',
                    backgroundSize: '28px 28px',
                    animation: (dragActive || isHovered) ? 'moveStripes 1s linear infinite' : 'none',
                    transition: 'background 0.3s ease',
                    overflow: 'hidden'
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

                {preview ? (
                    <div className="preview-container" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px', zIndex: 1 }}>
                        {preview === 'file' ? (
                            <i className="fa fa-file-o" style={{ fontSize: '24px', color: '#666' }}></i>
                        ) : (
                            <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    height: `calc(${height} - 16px)`,
                                    maxWidth: '80px',
                                    objectFit: 'contain',
                                    borderRadius: '1px',
                                    border: '1px solid #eee'
                                }}
                            />
                        )}
                        <span style={{ fontSize: '12px', color: '#333', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>
                            {currentFile instanceof File ? currentFile.name : (typeof currentFile === 'string' ? currentFile.split('/').pop() : 'File Selected')}
                        </span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                             <button
                                type="button"
                                onClick={handleRemove}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#f30',
                                    fontSize: '18px',
                                    padding: '0 5px',
                                    cursor: 'pointer'
                                }}
                                title="Remove File"
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="placeholder-text" style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                        <i className="fa fa-cloud-upload" style={{ fontSize: '20px', color: '#555' }}></i>
                        <span style={{ color: '#444', fontSize: '13px', fontFamily: 'inherit' }}>Drag and drop a file here or click</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DragDropFileUpload;
