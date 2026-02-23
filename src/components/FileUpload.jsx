import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

const FileUpload = ({ label, onChange, selectedFile, existingFile, name = "file", accept }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            // Create synthetic event to match standard input change handler expectance if needed, 
            // or just pass file directly. The parent expects event usually?
            // Let's pass the file directly to onChange if it handles value.
            // But looking at StudentDiaryList logic: 
            // const { name, value, files } = e.target;
            // It expects an event-like object.

            // We can construct a synthetic event:
            const syntheticEvent = {
                target: {
                    name: name,
                    files: [droppedFile],
                    value: '' // value usually path string, irrelevant for processing file object
                }
            };
            onChange(syntheticEvent);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onChange(e);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        const syntheticEvent = {
            target: {
                name: name,
                files: [],
                value: ''
            }
        };
        onChange(syntheticEvent);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="form-group">
            {label && <label>{label}</label>}
            <div
                className={`file-upload-container ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
                style={{
                    border: `2px dashed ${isDragging ? '#9055e8' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? '#f8f4fc' : '#f9f9f9',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    name={name}
                    accept={accept}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                {selectedFile ? (
                    <div className="selected-file-preview" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#e0e0e0', padding: '8px', borderRadius: '50%' }}>
                            <FileText size={24} color="#666" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '500', fontSize: '14px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {selectedFile.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888' }}>
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </div>
                        </div>
                        <button
                            onClick={handleRemove}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '5px',
                                marginLeft: '10px'
                            }}
                        >
                            <X size={18} color="#FF0000" />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload size={32} color={isDragging ? '#9055e8' : '#aaa'} style={{ marginBottom: '10px' }} />
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                            Drag and drop a file here or <span style={{ color: '#9055e8', fontWeight: '500' }}>click to upload</span>
                        </p>
                    </>
                )}
            </div>
            {existingFile && !selectedFile && (
                <small className="help-block" style={{ marginTop: '5px', display: 'block', color: '#888' }}>
                    Current File: {existingFile}
                </small>
            )}
        </div>
    );
};

export default FileUpload;
