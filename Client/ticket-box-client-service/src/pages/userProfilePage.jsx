import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
    useUpdateUserMutation,
    useChangePasswordMutation,
    useUpdateAvatarMutation
} from '../hooks/useUserHook';
import {
    User,
    Mail,
    Lock,
    Camera,
    Save,
    Key,
    Loader2,
    CheckCircle,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const UserProfilePage = () => {
    const { user } = useAuthStore();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const updateUserMutation = useUpdateUserMutation();
    const changePasswordMutation = useChangePasswordMutation();
    const updateAvatarMutation = useUpdateAvatarMutation();

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        reset: resetProfile,
        formState: { errors: profileErrors }
    } = useForm({
        defaultValues: {
            fullName: user?.fullName || "",
            email: user?.email || ""
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        watch: watchPassword,
        formState: { errors: passwordErrors }
    } = useForm();

    const newPassword = watchPassword("newPassword");

    useEffect(() => {
        if (user) {
            resetProfile({
                fullName: user.fullName || "",
                email: user.email || ""
            });
            setAvatarPreview(user.avatar?.url || null);
        }
    }, [user, resetProfile]);

    const onProfileSubmit = (data) => {
        updateUserMutation.mutate(data);
    };

    const onPasswordSubmit = (data) => {
        changePasswordMutation.mutate(data, {
            onSuccess: () => resetPassword()
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('image', selectedFile);
        updateAvatarMutation.mutate(formData, {
            onSuccess: () => setSelectedFile(null)
        });
    };

    return (
        <div className="min-h-screen bg-[#0d1117] px-4 py-12 text-white selection:bg-blue-500/30">
            <div className="container mx-auto max-w-5xl">
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-10">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-24 w-24 overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-gray-800 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-blue-600/10 text-blue-500">
                                        <User className="h-10 w-10" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110 active:scale-95">
                                <Camera className="h-4 w-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white mb-2">{user?.fullName || user?.username}</h1>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                                    @{user?.username}
                                </span>
                                {user?.roles?.map(role => (
                                    <span key={role.id} className="inline-flex items-center rounded-lg bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                                        {role.name.replace('ROLE_', '')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            disabled={user?.roles?.some(role => role.name === 'ROLE_APPROVER')}
                            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                            onClick={() => alert("Upgrade request sent! (Dummy Action)")}
                        >
                            <ShieldCheck className="h-5 w-5" />
                            {user?.roles?.some(role => role.name === 'ROLE_APPROVER') ? "Already Approver" : "Upgrade to Approver"}
                        </button>

                        {selectedFile && (
                            <button
                                onClick={handleAvatarUpload}
                                disabled={updateAvatarMutation.isPending}
                                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg shadow-green-900/20 transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50"
                            >
                                {updateAvatarMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save New Avatar
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Personal Information */}
                    <div className="rounded-3xl bg-[#161b22] p-8 shadow-2xl border border-gray-800">
                        <div className="mb-8 flex items-center gap-3 text-xl font-bold text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500">
                                <User className="h-5 w-5" />
                            </div>
                            Personal Information
                        </div>

                        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        {...registerProfile("fullName", { required: "Full name is required" })}
                                        className="w-full rounded-2xl border border-gray-700 bg-gray-900/50 py-4 pl-12 pr-4 text-white placeholder-gray-600 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {profileErrors.fullName && <p className="text-xs text-red-500 mt-1 ml-1">{profileErrors.fullName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        {...registerProfile("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        className="w-full rounded-2xl border border-gray-700 bg-gray-900/50 py-4 pl-12 pr-4 text-white placeholder-gray-600 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {profileErrors.email && <p className="text-xs text-red-500 mt-1 ml-1">{profileErrors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={updateUserMutation.isPending}
                                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
                            >
                                {updateUserMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <CheckCircle className="h-6 w-6 text-white" />}
                                Update Profile
                            </button>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="rounded-3xl bg-[#161b22] p-8 shadow-2xl border border-gray-800">
                        <div className="mb-8 flex items-center gap-3 text-xl font-bold text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-500">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            Security Settings
                        </div>

                        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Current Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="password"
                                        {...registerPassword("currentPassword", { required: "Current password is required" })}
                                        className="w-full rounded-2xl border border-gray-700 bg-gray-900/50 py-4 pl-12 pr-4 text-white placeholder-gray-600 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1 ml-1">{passwordErrors.currentPassword.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">New Password</label>
                                <div className="relative group">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="password"
                                        {...registerPassword("newPassword", {
                                            required: "New password is required",
                                            minLength: { value: 6, message: "Minimum 6 characters" }
                                        })}
                                        className="w-full rounded-2xl border border-gray-700 bg-gray-900/50 py-4 pl-12 pr-4 text-white placeholder-gray-600 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1 ml-1">{passwordErrors.newPassword.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Confirm New Password</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="password"
                                        {...registerPassword("confirmPassword", {
                                            required: "Please confirm your password",
                                            validate: value => value === newPassword || "Passwords do not match"
                                        })}
                                        className="w-full rounded-2xl border border-gray-700 bg-gray-900/50 py-4 pl-12 pr-4 text-white placeholder-gray-600 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{passwordErrors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white shadow-xl shadow-purple-900/20 transition-all hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50"
                            >
                                {changePasswordMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Lock className="h-6 w-6 text-white" />}
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 rounded-3xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-8 border border-gray-800 text-center">
                    <p className="text-gray-400 mb-6">Want to see your ticket status and history?</p>
                    <Link to="/order-history" className="inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors group">
                        Browse your order history <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
