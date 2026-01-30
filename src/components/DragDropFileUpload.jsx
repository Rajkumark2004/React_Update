import React, { useState, useRef, useEffect } from 'react';

const DragDropFileUpload = ({ label, name, currentFile, onFileSelect, accept = "image/*", height = "100px" }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (currentFile) {
            if (typeof currentFile === 'string') {
                setPreview(currentFile);
            } else if (currentFile instanceof File) {
                const objectUrl = URL.createObjectURL(currentFile);
                setPreview(objectUrl);
                return () => URL.revokeObjectURL(objectUrl);
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
        e.stopPropagation(); // Prevent triggering click on parent
        onFileSelect(name, null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <div
                className={`drag-drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                style={{
                    border: '2px dashed #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: dragActive ? '#f0f8ff' : '#fafafa'
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
                    <div className="preview-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: height,
                                objectFit: 'contain'
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="btn btn-xs btn-danger"
                            style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                borderRadius: '50%',
                                padding: '2px 6px'
                            }}
                        >
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                ) : (
                    <div className="placeholder-text">
                        <i className="fa fa-cloud-upload" style={{ fontSize: '24px', color: '#999' }}></i>
                        <p style={{ margin: '5px 0 0', color: '#666', fontSize: '12px' }}>Drag & Drop or Click to Upload</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DragDropFileUpload;
