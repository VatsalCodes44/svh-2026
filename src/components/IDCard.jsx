import React, { useState, useRef } from 'react';
import { motion } from 'motion';
import { ArrowLeft, Upload, User, Mail, Download, FileImage, FileText, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import { generateIdCard, getTemplateImage, CARD_WIDTH, CARD_HEIGHT } from '../utils/generateIDCard';

const IDCard = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        image: null,
        imagePreview: null
    });

    const [isVerifying, setIsVerifying] = useState(false);
    const [userData, setUserData] = useState(null);
    const [generatedCardUrl, setGeneratedCardUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    /* ================= FILE UPLOAD ================= */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file?.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onloadend = () =>
            setFormData({ ...formData, image: file, imagePreview: reader.result });
        reader.readAsDataURL(file);
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    image: file,
                    imagePreview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Verify user from Supabase
    const handleVerifyUser = async () => {
        if (!formData.email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsVerifying(true);

        try {
            const { data, error } = await supabase
                .from('id_card_users')
                .select('*')
                .eq('email_id', formData.email.toLowerCase())
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    toast.error('User not found in database. Please check your email.');
                } else {
                    toast.error('Error verifying user. Please try again.');
                }
                setUserData(null);
                setShowPreview(false);
            } else {
                setUserData(data);
                setFormData({
                    ...formData,
                    name: data.name || formData.name
                });
                toast.success('User verified successfully!');
            }
        } catch (err) {
            console.error('Verification error:', err);
            toast.error('An unexpected error occurred');
            setUserData(null);
            setShowPreview(false);
        } finally {
            setIsVerifying(false);
        }
    };

    // Generate ID Card with Canvas
    const handleGenerateCard = async () => {
        if (!formData.imagePreview || !userData) {
            if (!userData) {
                toast.error('Please verify your email first');
            } else if (!formData.imagePreview) {
                toast.error('Please upload your photo');
            }
            return;
        }

        setIsGenerating(true);
        toast.loading('Generating your ID card...', { id: 'generating' });

        try {
            const imageUrl = await generateIdCard({
                templateSrc: getTemplateImage(userData.user_type),
                userImageSrc: formData.imagePreview,
                name: userData.name,
                team: userData.team,
                teamPosition: userData.team_position,
                role: userData.user_type,
            });

            setGeneratedCardUrl(imageUrl);
            setShowPreview(true);
            toast.success('ID card generated successfully!', { id: 'generating' });
        } catch (error) {
            console.error('Error generating ID card:', error);
            toast.error('Failed to generate ID card. Please try again.', { id: 'generating' });
        } finally {
            setIsGenerating(false);
        }
    };

    // Download as Image
    const handleDownloadImage = () => {
        if (!generatedCardUrl) {
            toast.error('Please generate the ID card first');
            return;
        }

        const link = document.createElement('a');
        link.href = generatedCardUrl;
        link.download = `${userData.name.replace(/\s+/g, '_')}_ID_Card.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('ID card downloaded as PNG!');
    };

    // Download as PDF
    const handleDownloadPDF = () => {
        if (!generatedCardUrl) {
            toast.error('Please generate the ID card first');
            return;
        }

        try {
            // Create PDF with custom dimensions to match ID card aspect ratio
            // Using mm units: 101.2mm × 153.6mm (1012px × 1536px at 10px/mm)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [101.2, 153.6]
            });

            // Add generated image to PDF
            pdf.addImage(generatedCardUrl, 'PNG', 0, 0, 101.2, 153.6);

            // Download PDF
            pdf.save(`${userData.name.replace(/\s+/g, '_')}_ID_Card.pdf`);
            toast.success('ID card downloaded as PDF!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF. Please try again.');
        }
    };

    // Remove uploaded image
    const handleRemoveImage = () => {
        setFormData({
            ...formData,
            image: null,
            imagePreview: null
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Get user role display text
    const getUserRoleDisplay = (userType) => {
        const roleMap = {
            'student_coordinator': 'Student Coordinator',
            'volunteer': 'Volunteer',
            'mentor': 'Mentor',
            'student_participant': 'Student Participant'
        };
        return roleMap[userType] || userType;
    };

    return (
        <div className="min-h-screen w-full pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Toast Container */}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1a1410',
                        color: '#fff1ce',
                        border: '1px solid rgba(245, 188, 34, 0.3)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#f5bc22',
                            secondary: '#fff1ce',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff1ce',
                        },
                    },
                }}
            />
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-yellow-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/5 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold">Back to Home</span>
                </motion.button>

                {/* Header */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 mb-4"
                    >
                        Generate ID Card
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base"
                    >
                        Upload your photo and enter your details to generate your INNOVIT 2026 ID card
                    </motion.p>
                </div>

                {/* Main Content - Horizontal Layout */}
                <div className="space-y-8">
                    {/* Top Row - Upload and Fields */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Upload Box */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-strong p-6 md:p-8 rounded-2xl border border-yellow-500/10 bg-[#111]/80 backdrop-blur-xl shadow-2xl"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                <Upload className="w-6 h-6" />
                                Upload Photo
                            </h2>

                            {/* Drag and Drop Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer
                                    transition-all duration-300
                                    ${isDragging
                                        ? 'border-yellow-400 bg-yellow-400/10 scale-105'
                                        : 'border-yellow-500/30 hover:border-yellow-400/50 hover:bg-yellow-400/5'
                                    }
                                `}
                            >
                                {formData.imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={formData.imagePreview}
                                            alt="Preview"
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage();
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <p className="mt-4 text-sm text-gray-400">Click to change image</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-yellow-400" />
                                        <p className="text-[#fff1ce] font-semibold mb-2 text-sm md:text-base">
                                            Drag & drop your photo here
                                        </p>
                                        <p className="text-gray-400 text-xs md:text-sm mb-4">
                                            or click to browse
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            Supported formats: JPG, PNG, WEBP
                                        </p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </motion.div>

                        {/* User Details Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-strong p-6 md:p-8 rounded-2xl border border-yellow-500/10 bg-[#111]/80 backdrop-blur-xl shadow-2xl"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                <User className="w-6 h-6" />
                                Your Details
                            </h2>

                            <div className="space-y-5">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-[#fff1ce] font-semibold mb-2 text-sm md:text-base">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/50" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className="w-full pl-12 pr-4 py-3 md:py-4 bg-[#0a0a0f]/50 border border-yellow-500/20 rounded-xl text-[#fff1ce] placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all text-sm md:text-base"
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label className="block text-[#fff1ce] font-semibold mb-2 text-sm md:text-base">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/50" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email address"
                                            className="w-full pl-12 pr-4 py-3 md:py-4 bg-[#0a0a0f]/50 border border-yellow-500/20 rounded-xl text-[#fff1ce] placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all text-sm md:text-base"
                                        />
                                    </div>
                                </div>

                                {/* Verify Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleVerifyUser}
                                    disabled={!formData.email || isVerifying}
                                    className={`
                                        w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base
                                        transition-all duration-300 flex items-center justify-center gap-2
                                        ${formData.email && !isVerifying
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {isVerifying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Verify Email
                                        </>
                                    )}
                                </motion.button>

                                {/* User Data Display */}
                                {userData && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Verified User
                                        </p>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-[#fff1ce]"><span className="text-gray-400">Name:</span> {userData.name}</p>
                                            <p className="text-[#fff1ce]"><span className="text-gray-400">Role:</span> {getUserRoleDisplay(userData.user_type)}</p>
                                            {userData.team && <p className="text-[#fff1ce]"><span className="text-gray-400">Team:</span> {userData.team}</p>}
                                            {userData.team_position && <p className="text-[#fff1ce]"><span className="text-gray-400">Position:</span> {userData.team_position}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Generate Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerateCard}
                                    disabled={!userData || !formData.imagePreview || isGenerating}
                                    className={`
                                        w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base
                                        transition-all duration-300 flex items-center justify-center gap-2
                                        ${userData && formData.imagePreview && !isGenerating
                                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-[#0a0a0f] hover:shadow-lg hover:shadow-yellow-400/50'
                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate ID Card'
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Row - Full Width Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-strong p-6 md:p-8 rounded-2xl border border-yellow-500/10 bg-[#111]/80 backdrop-blur-xl shadow-2xl"
                    >
                        <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-6">
                            ID Card Preview
                        </h2>

                        {showPreview && generatedCardUrl ? (
                            <div className="space-y-6">
                                {/* Generated ID Card Preview */}
                                <div className="flex justify-center">
                                    <div
                                        style={{
                                            width: 'auto',
                                            height: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#0a0a0f',
                                            borderRadius: '16px',
                                            boxShadow: '0 0 40px rgba(245,188,34,0.15)'
                                        }}
                                    >
                                        <img
                                            src={generatedCardUrl}
                                            alt="Generated ID Card"
                                            style={{
                                                width: 'auto',
                                                height: 'auto',
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Download Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDownloadImage}
                                        className="flex items-center justify-center gap-2 py-3 md:py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-[#0a0a0f] rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-400/50 transition-all text-sm md:text-base"
                                    >
                                        <FileImage className="w-5 h-5" />
                                        Download as Image
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDownloadPDF}
                                        className="flex items-center justify-center gap-2 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-[#0a0a0f] rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all text-sm md:text-base"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Download as PDF
                                    </motion.button>
                                </div>
                            </div>
                        ) : userData ? (
                            <div className="space-y-6">
                                {/* Show template image after user verification */}
                                <div className="flex justify-center">
                                    <div
                                        style={{
                                            width: 'auto',
                                            height: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#0a0a0f',
                                            borderRadius: '16px',
                                            boxShadow: '0 0 40px rgba(245,188,34,0.15)'
                                        }}
                                    >
                                        <img
                                            src={getTemplateImage(userData.user_type)}
                                            alt="ID Card Template"
                                            style={{
                                                width: 'auto',
                                                height: 'auto',
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-center text-gray-400 text-sm">
                                    Upload your photo and click 'Generate ID Card' to create your personalized card
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-400/10 flex items-center justify-center mb-6">
                                    <Download className="w-10 h-10 md:w-12 md:h-12 text-yellow-400/50" />
                                </div>
                                <p className="text-[#fff1ce] text-base md:text-lg font-semibold mb-2">
                                    No Preview Available
                                </p>
                                <p className="text-gray-400 text-xs md:text-sm max-w-xs">
                                    Verify your email to see your ID card template
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div >
        </div >
    );
};

export default IDCard;