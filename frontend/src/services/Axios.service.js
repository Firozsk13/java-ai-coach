import axios from "axios";
import { apiBaseUrl } from "../constants/constant.js";
import { getVariable, removeVariable } from "../utils/localStorage.js";

const AxiosClient = async (axiosParams) => {
  let data = null;
  let error = null;
  let loading = true;
  const token = getVariable("km_user_token");

  const config = {
    headers: {
      "Content-Type": axiosParams.contentType
        ? axiosParams.contentType
        : "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    let options = {
      ...axiosParams,
      url: apiBaseUrl + axiosParams.url,
      ...config,
    };

    const response = await axios.request(options);

    data = response.data;
  } catch (e) {
    error = e;
    if (e.response && e.response.status === 401) {
      removeVariable("km_user_token");
      window.location.href = "/login";
    }

    loading = false;
  } finally {
    loading = false;
  }
  return { data, error, loading };
};

export default AxiosClient;
