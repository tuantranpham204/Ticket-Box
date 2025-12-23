import { useMutation } from "@tanstack/react-query";
import apiClient, { handleApiResponse } from "../api/apiClient";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

export const useUpdateUserMutation = () => {
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: async (data) => {
            return await handleApiResponse(apiClient.put(`/users/update/${user?.id}`, data));
        },
        onSuccess: (updatedUser) => {
            setUser(updatedUser);
            toast.success("Profile updated successfully!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update profile.");
        }
    });
};

export const useChangePasswordMutation = () => {
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (data) => {
            return await handleApiResponse(apiClient.put(`/users/change-password/${user?.id}`, data));
        },
        onSuccess: () => {
            toast.success("Password changed successfully!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to change password.");
        }
    });
};

export const useUpdateAvatarMutation = () => {
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: async (formData) => {
            return await handleApiResponse(apiClient.put(`/users/avatar/${user?.id}`, formData));
        },
        onSuccess: (updatedUser) => {
            setUser(updatedUser);
            toast.success("Avatar updated successfully!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update avatar.");
        }
    });
};
