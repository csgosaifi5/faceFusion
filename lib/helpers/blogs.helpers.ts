import utils from "../utils";
import axios from "axios";

export default class BlogHelpers {
  async addBlog(payload: any, url: string) {
    const config = {
      headers: {
        content: "multipart/form-data",
      },
      withCredentials: true,
    };

    try {
      const response: any = await axios.post(`/api/${url}`, payload, config);
      if (response.error) {
        throw new Error(response.err);
      } else {
        return response.data;
      }
    } catch (err) {
      return { error: err };
    }
  }

  async editBlog(payload: any) {
    const config = {
      headers: {
        content: "multipart/form-data",
      },
      withCredentials: true,
    };

    try {
      const response: any = await axios.put(`/api/blogs`, payload, config);
      if (response.error) {
        throw new Error(response.err);
      } else {
        return response.data;
      }
    } catch (err) {
      return { error: err };
    }
  }

  async fetchAllBlogs(payload: any) {
    return utils
      .sendApiRequest(`/api/blogs`, "PATCH", true, payload)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  }
  deleteBlog(dataId: string) {
    return utils.sendApiRequest("/api/blogs/" + dataId, "DELETE", true, {}).then(
      (response) => {
        return response;
      },
      (error) => {
        throw new Error(error);
      }
    );
  }
  async getDetailsBySlug(dataId: string, url: string) {
    return utils
      .sendApiRequest(`api/blogs/` + dataId, "PUT", true, {})
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  }
}
