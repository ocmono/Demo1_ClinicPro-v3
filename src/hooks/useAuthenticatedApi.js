import { useAuth } from '../contentApi/AuthContext';

export const useAuthenticatedApi = () => {
    const authContext = useAuth();

    return {
        authContext
    };
};