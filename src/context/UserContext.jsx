// context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utils/apiErrorHandler";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch all users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth("https://bkdemo1.clinicpro.cc/users/user-list");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
            // toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Add new user
    const addUser = async (userData) => {
        try {
            // ✅ Create FormData (multipart/form-data)
            const formData = new FormData();
            const token = localStorage.getItem("access_token");

            if (
                userData.sign &&
                typeof userData.sign === "string" &&
                userData.sign.startsWith("data:image")
            ) {
                const base64ToFile = (base64, filename) => {
                    const arr = base64.split(",");
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) u8arr[n] = bstr.charCodeAt(n);
                    return new File([u8arr], filename, { type: mime });
                };

                const file = base64ToFile(userData.sign, "signature.png");
                formData.append("sign", file); // ✅ UploadFile
            }

            Object.entries(userData).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                if (key === "sign") return; // already handled

                // 🔥 availability MUST be JSON string
                if (key === "availability") {
                    formData.append("availability", JSON.stringify(value));
                    return;
                }

                // Arrays of primitives (speciality, qualification)
                if (Array.isArray(value)) {
                    value.forEach(v => {
                        if (v !== null && v !== undefined) {
                            formData.append(key, v.toString());
                        }
                    });
                    return;
                }

                // Objects → stringify
                if (typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                    return;
                }

                // Primitive values
                formData.append(key, value.toString());
            });

            console.log("FormData being sent:");
            for (let pair of formData.entries()) {
                        console.log(pair[0], pair[1]);
            }


            // ✅ Send FormData without manually setting Content-Type
            const res = await fetch("https://bkdemo1.clinicpro.cc/users/register", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                console.error("Server returned error:", errorData);
                throw new Error(
                    errorData?.detail
                        ? JSON.stringify(errorData.detail)
                        : errorData?.message || "Failed to create user"
                );
            }

            const newUser = await res.json();
            setUsers((prev) => [...prev, newUser]);
            toast.success("User created successfully!");
            return newUser;
        } catch (err) {
            console.error("Error adding user:", err);
            toast.error(err.message || "Failed to create user");
            throw err;
        }
    };


    // Login User
    const loginUser = async (userData) => {
        try {
            const res = await fetchWithAuth("https://bkdemo1.clinicpro.cc/users/token", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    username: userData.username,
                    password: userData.password,
                    remember_me: true,
                }).toString(),
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.detail || `HTTP error! status: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            console.error('Error logged in user:', error);
            throw error;
        }
    }

    // Logout User
    const logoutUser = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const res = await fetchWithAuth("https://bkdemo1.clinicpro.cc/users/logout", {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                console.error("Logout API error:", error);
                throw new Error(error.detail || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log("✅ Logout recorded:", data);

            const rememberedUsername = localStorage.getItem("rememberedUsername");
            const rememberedPassword = localStorage.getItem("rememberedPassword");

            localStorage.clear();
            sessionStorage.clear();

            if (rememberedUsername) localStorage.setItem("rememberedUsername", rememberedUsername);
            if (rememberedPassword) localStorage.setItem("rememberedPassword", rememberedPassword);

            toast.success("Logout successful!");
            return data;
        } catch (error) {
            console.error('Error logged in user:', error);
            toast.error(error.message || "Logout failed");
            throw error;
        }
    }

    // ✅ Update user
    const updateUser = async (id, updatedData) => {
        try {
            console.log('📤 Sending update request for user:', id);
            console.log('📤 Update payload:', updatedData);

            const res = await fetchWithAuth(`https://bkdemo1.clinicpro.cc/users/update-user/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            console.log('📥 Update response status:', res.status);

            if (!res.ok) {
                // Get the error response from server
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to update user: ${res.status}`);
            }

            const responseData = await res.json();
            console.log('Raw API Response:', responseData);

            // Handle different possible response structures
            let updatedUser;

            if (responseData.user_id) {
                // Current API response structure: { message: "...", user_id: 1, role: "..." }
                updatedUser = {
                    id: responseData.user_id,
                    ...updatedData,
                    role: responseData.role || updatedData.role,
                };
            } else if (responseData.id) {
                // If API ever returns full user object with id
                updatedUser = responseData;
            } else if (responseData.data && responseData.data.id) {
                // If API returns { data: { user object } }
                updatedUser = responseData.data;
            } else {
                // Fallback: create user object from updatedData
                updatedUser = {
                    id: id,
                    ...updatedData
                };
            }

            console.log('Final updated user:', updatedUser);
            setUsers(prev => prev.map(u =>
                u.id === id ? { ...u, ...updatedUser } : u
            ));
            toast.success(responseData.message || "User updated successfully!");
            return updatedUser;
        } catch (err) {
            console.error("Error updating user:", err);
            toast.error("Failed to update user");
            throw err;
        }
    };

    // ✅ Delete user
    const deleteUser = async (id) => {
        try {
            const res = await fetchWithAuth(`https://bkdemo1.clinicpro.cc/users/delete-user/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete user");

            setUsers((prev) => prev.filter((u) => u.id !== id));
            toast.success("User deleted successfully!");
        } catch (err) {
            console.error("Error deleting user:", err);
            toast.error("Failed to delete user");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <UserContext.Provider
            value={{
                users,
                loading,
                loginUser,
                fetchUsers,
                logoutUser,
                addUser,
                updateUser,
                deleteUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => useContext(UserContext);
