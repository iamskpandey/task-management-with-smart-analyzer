const BASE_URL = "http://127.0.0.1:8000/api";

export const API = {
  async analyze(tasks, strategy) {
    return await this._post(`${BASE_URL}/analyze/?strategy=${strategy}`, tasks);
  },

  async suggest(tasks) {
    return await this._post(`${BASE_URL}/suggest/`, tasks);
  },

  async _post(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Server Error");
      }
      return result;
    } catch (error) {
      throw error;
    }
  },
};
