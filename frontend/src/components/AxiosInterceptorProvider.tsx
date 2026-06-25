import React, { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../services/api";

interface AxiosInterceptorProviderProps {
  children: React.ReactNode;
}

export const AxiosInterceptorProvider: React.FC<AxiosInterceptorProviderProps> = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error setting Clerk auth token on Axios request:", error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  return <>{children}</>;
};
