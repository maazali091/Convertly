import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon, UploadIcon, ArrowRight, Shield, Eye, FileText, FileImage, FileSpreadsheet, File as FileIcon, X, Check, ChevronRight, Sparkles } from 'lucide-react';

function Hero() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [detectedFile, setDetectedFile] = useState(null);
    const [selectedTool, setSelectedTool] = useState(null);
    // File type detection
    const detectFileType = (file) => {
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();

        if (fileType.startsWith('image/') ||
            fileName.endsWith('.jpg') ||
            fileName.endsWith('.jpeg') ||
            fileName.endsWith('.png') ||
            fileName.endsWith('.gif') ||
            fileName.endsWith('.webp') ||
            fileName.endsWith('.bmp')) {
            return 'image';
        }
        // PDF files
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            return 'pdf';
        }
        // Word documents
        if (fileType === 'application/msword' ||
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.doc') ||
            fileName.endsWith('.docx')) {
            return 'word';
        }
        // Excel spreadsheets
        if (fileType === 'application/vnd.ms-excel' ||
            fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            fileName.endsWith('.xls') ||
            fileName.endsWith('.xlsx') ||
            fileName.endsWith('.csv')) {
            return 'excel';
        }
        return 'unknown';
    };
    // Get tools based on file type (ONLY these 10 tools)
    const getToolsForFileType = (fileType) => {
        const allTools = {
            'Word to PDF': { path: '/word-to-pdf', fileTypes: ['word'] },
            'PDF to Word': { path: '/pdf-to-word', fileTypes: ['pdf'] },
            'Merge PDF': { path: '/merge-pdf', fileTypes: ['pdf'] },
            'Split PDF': { path: '/split-pdf', fileTypes: ['pdf'] },
            'Compress PDF': { path: '/compress-pdf', fileTypes: ['pdf'] },
            'PDF to JPG': { path: '/pdf-to-jpg', fileTypes: ['pdf'] },
            'JPG to PDF': { path: '/jpg-to-pdf', fileTypes: ['image'] },
            'Excel to PDF': { path: '/excel-to-pdf', fileTypes: ['excel'] },
            'PDF to Excel': { path: '/pdf-to-excel', fileTypes: ['pdf'] },
            'Rotate PDF': { path: '/rotate-pdf', fileTypes: ['pdf'] },
        };
        // Filter tools based on file type
        return Object.entries(allTools)
            .filter(([name, tool]) => tool.fileTypes.includes(fileType))
            .map(([name, tool]) => ({
                name,
                path: tool.path,
            }));
    };

    // Handle file upload
    const handleFileSelection = (file) => {
        if (!file) return;

        const fileType = detectFileType(file);

        setDetectedFile({
            file,
            fileType,
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2)
        });

        setSelectedTool(null);
    };

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;

        // If multiple PDF files, automatically go to merge
        if (files.length > 1 && detectFileType(files[0]) === 'pdf') {
            navigate('/merge-pdf', { state: { files: Array.from(files) } });
            return;
        }
        handleFileSelection(files[0]);
    };
    const handleInputChange = (e) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    // Navigate to tool with file
    const navigateToTool = (tool) => {
        setSelectedTool(tool);
        setTimeout(() => {
            if (detectedFile?.file) {
                navigate(tool.path, {
                    state: {
                        file: detectedFile.file,
                        fileName: detectedFile.fileName,
                        fileType: detectedFile.fileType
                    }
                });
            } else {
                navigate(tool.path);
            }
        }, 300);
    };
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const handleExploreTools = () => {
        navigate('/tools');
    };
    const clearFile = () => {
        setDetectedFile(null);
        setSelectedTool(null);
    };
    // Get file icon based on type
    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'image':
                return <FileImage className="size-5 text-blue-600" />;
            case 'pdf':
                return <FileText className="size-5 text-red-600" />;
            case 'word':
                return <FileText className="size-5 text-blue-700" />;
            case 'excel':
                return <FileSpreadsheet className="size-5 text-green-600" />;
            default:
                return <FileIcon className="size-5 text-gray-600" />;
        }
    };
    // Render
    const availableTools = detectedFile ? getToolsForFileType(detectedFile.fileType) : [];
    return (
        <div className='px-5 md:px-10 py-12 lg:grid lg:grid-cols-5 lg:gap-10 lg:justify-center lg:items-center xl:pt-15 xl:pb-30 xl:px-15 dark:bg-slate-900'>
            <div className='flex items-start flex-col gap-5 lg:col-span-3'>
                <span className='flex p-2 xl:px-3 text-sm xl:text-md border text-indigo-700 dark:bg-gray-700 font-medium rounded-full items-center gap-2 justify-start'>
                    <StarIcon size={18} /> AI-Powered Conversion
                </span>
                <h1 className='text-6xl/17 xl:text-7xl/20 md:max-w-100 xl:max-w-130 font-bold'>
                    Convert Files <span className='text-indigo-700'>in Seconds</span>
                </h1>
                <p className='text-lg/7 text-slate-400 md:max-w-130 tracking-wide'>
                    Lightning-fast file conversion with military-grade security. No ads, no limits, no signup required.
                </p>
                <div className='flex flex-wrap gap-3'>
                    <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>PDF</span>
                    <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>Word</span>
                    <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>Excel</span>
                    <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>PowerPoint</span>
                    <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>JPG</span>
                    <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>PNG</span>
                </div>
                <div className='flex flex-col md:flex-row justify-center items-center grid-cols-1 md:grid-cols-2 md:max-w-4/5 w-full gap-5'>
                    <button onClick={handleUploadClick} className='flex gap-3 cursor-pointer py-5 bg-indigo-700 font-medium mt-5 rounded-2xl text-xl lg:text-lg items-center text-slate-100 w-full justify-center hover:bg-indigo-800 transition'>
                        <UploadIcon /> Upload File Now <ArrowRight className='lg:hidden' />
                    </button>
                    <a href='#tools' className='flex gap-3 py-5 border border-slate-500 font-medium mt-2 md:mt-5 rounded-2xl text-xl md:text-lg items-center dark:text-slate-100 w-full justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition'>
                        Explore Tools
                    </a>
                </div>

                <div className='flex gap-5 text-sm font-medium dark:text-slate-300 text-slate-700 mt-2 md:mt-7'>
                    <span className='flex gap-2 items-center'><Shield className='text-emerald-700' /> Military-grade encryption</span>
                    <span className='flex gap-2 items-center'><Eye className='text-emerald-700' /> Zero data logging</span>
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div className='hidden lg:flex w-full h-4/6 xl:h-11/13 rounded-2xl lg:col-span-2 flex-col gap-4 justify-center items-center relative bg-violet-50 dark:bg-slate-800 lg:border-2 border-violet-200 dark:border-slate-700 p-6'>
                {!detectedFile ? (
                    <>
                        <div onClick={handleUploadClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                            className={`flex flex-col gap-5 justify-center items-center cursor-pointer transition-all duration-200 w-full h-full rounded-2xl ${isDragging ? 'bg-indigo-100 dark:bg-slate-700' : '' }`}>
                            <UploadIcon className={`size-20 p-5 rounded-3xl border-2 transition-colors ${isDragging
                                ? 'text-indigo-700 border-indigo-300 bg-indigo-200 dark:bg-slate-600 dark:border-indigo-400'
                                : 'dark:text-blue-600 border-indigo-200 dark:border-slate-500 bg-indigo-100 dark:bg-slate-600'
                                }`} />
                            <div className='text-center'>
                                <h3 className='font-bold text-gray-900 mb-1 dark:text-white text-lg'>
                                    {isDragging ? 'Drop file here!' : 'Drag & drop here'}
                                </h3>
                                <span className='text-md font-medium text-gray-500 dark:text-gray-400'>
                                    or click to browse files
                                </span>
                            </div>
                            <span className='text-xs text-gray-400 mt-2'>
                                Supports: PDF, Word, Excel, Images
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        {/* File info - small box */}
                        <div className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm">
                            <div className="shrink-0">
                                {getFileIcon(detectedFile.fileType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                    {detectedFile.fileName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {detectedFile.fileSize} MB
                                </p>
                            </div>
                            <button
                                onClick={clearFile}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition shrink-0"
                            >
                                <X size={16} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Available tools - clean list */}
                        <div className="w-full space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Choose conversion:
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {availableTools.map((tool, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigateToTool(tool)}
                                        className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 ${selectedTool?.name === tool.name
                                            ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700'
                                            : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-indigo-500'
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {tool.name}
                                            </p>
                                        </div>

                                        {selectedTool?.name === tool.name ? (
                                            <Check size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                        ) : (
                                            <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-600 transition shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" onChange={handleInputChange} className="hidden" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"/>
            </div>
            {/* Mobile upload button */}
            <div className="lg:hidden fixed bottom-5 right-5 z-40">
                <button onClick={handleUploadClick} className="flex items-center gap-2 px-5 py-3 bg-indigo-700 text-white rounded-full shadow-lg hover:bg-indigo-800 transition">
                    <UploadIcon size={20} />
                    <span className="text-sm font-medium">Upload File</span>
                </button>
            </div>
        </div>
    );
}
export default Hero;