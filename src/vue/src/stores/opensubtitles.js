import { defineStore } from "pinia";

const opensubtitlesUrl = "https://api.opensubtitles.com";
const userAgent = "Difficult words 0.0";

export const useOpensubtitlesStore = defineStore({
  id: "opensubtitles",
  state: () => ({
    api_key: "",
    error: "",
    loading: false,
    downloadURL: "",
  }),
  actions: {
    setApiKey(key) {
      this.api_key = key;
    },
    async fetchHints(text) {
      const data = await this.fetchTitles(text);
      let titles = [];
      if (data) {
        const unique_titles = new Map(
          data.map((movie) => [
            movie.attributes.feature_details.movie_name,
            movie.attributes.feature_details.movie_name,
          ]),
        );
        titles = Array.from(unique_titles, ([name, value]) => name);
      }
      return titles.sort();
    },
    async fetchSubtitlesText(title) {
      this.loading = true;
      this.downloadURL = "";
      let file_path = await this.fetchTitleFileURL(title);
      this.downloadURL = file_path;
      if (file_path != null && file_path != "") {
        var payload = await fetch(file_path).then((response) =>
          response.text(),
        );
        this.loading = false;
        return payload;
      }
      this.loading = false;
      return null;
    },
    async fetchTitleFileURL(title) {
      const file_id = await this.fetchTitleFile(title);
      console.log("file_id: ", file_id);
      if (file_id != null && file_id != "") {
        let url = new URL(`/api/v1/download`, opensubtitlesUrl);
        let payload = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "Api-Key": this.api_key,
            "X-User-Agent": userAgent,
          },
          method: "POST",
          body: JSON.stringify({ file_id: file_id }),
        }).then((response) => response.json());
        if (typeof payload.link !== "undefined") {
          return payload.link;
        }
      }
    },
    async fetchTitleFile(title) {
      const data = await this.fetchTitles(title);
      console.log("fetchTitleFile data: ", data);
      try {
        return data[0].attributes.files[0].file_id;
      } catch {
        return null;
      }
    },
    async fetchTitles(text) {
      this.error = "";
      if (text.length < 3) {
        return [];
      }
      const encodedText = encodeURIComponent(text);
      var url = new URL(
        `/api/v1/subtitles?query=${encodedText}&foreign_parts_only=exclude&languages=en`,
        opensubtitlesUrl,
      );
      var payload = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.api_key,
          "X-User-Agent": userAgent,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .catch((response) => {
          this.error = "Failed to fetch titles";
          if (typeof response.status !== "undefined") {
            this.response = response;
            this.error += ": Status " + response.status;
            return response.text();
          }
          if (typeof response.message !== "undefined") {
            this.error += ": " + response.message;
          }
        })
        .then((payload) => {
          if (typeof payload !== "undefined") {
            if (typeof payload.data !== "undefined") {
              return payload;
            }
            // it means json failed
            this.error += ", " + payload;
            if (this.response.status == 403) {
              this.error += "<br>Is the API_KEY valid?";
            }
          }
        });
      if (
        typeof payload !== "undefined" &&
        typeof payload.data !== "undefined"
      ) {
        return payload.data;
      }
      return [];
    },
  },
});
