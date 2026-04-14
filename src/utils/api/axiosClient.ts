import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  responseType: "json",
});

export const ACCESS_TOKEN = "jwt";

axiosClient.interceptors.request.use(
  async (req: InternalAxiosRequestConfig) => {
    const accessToken = Cookies.get(ACCESS_TOKEN);

    if (accessToken) {
      req.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return req;
  },

  (err: AxiosError) => Promise.reject(err),
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{ statusCode?: number }>) => {
    if (error?.response?.data?.statusCode === 401) {
      Cookies.remove(ACCESS_TOKEN);
    }
    return Promise.reject(error);
  },
);
