import { Auth } from "aws-amplify";
import axios from "axios";

const _gateway = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
const noTrailingSlash = _gateway?.replace(/\/+$/, "");
const api_gateway_url = noTrailingSlash ?? "";

export const apiClient = axios.create({
    baseURL: api_gateway_url,
    timeout: 5000,
});

apiClient.interceptors.request.use(async (config) => {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    if (!config.headers) {
        config.headers = {};
    }
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
    return config;
});