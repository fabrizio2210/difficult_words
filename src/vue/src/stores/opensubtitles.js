import { defineStore } from "pinia";

const opensubtitlesUrl = "https://api.opensubtitles.com";

export const useOpensubtitlesStore = defineStore({
  id: "opensubtitles",
  state: () => ({
    api_key: "",
    loading: false,
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
      return titles;
    },
    async fetchSubtitlesText(title) {
      let file_path = await this.fetchTitleFileURL(title);
      console.log("file_path: ", file_path);
      if ((file_path != null) && (file_path != "")){
        let result = null;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", file_path, false);
        xmlhttp.send();
        if (xmlhttp.status == 200) {
          result = xmlhttp.responseText;
        }
        console.log("result: ", result);
        return result;
      }
      return null;
    },
    async fetchTitleFileURL(title) {
      const file_id = await this.fetchTitleFile(title);
      console.log("file_id: ", file_id); 
      if ((file_id != null) && (file_id != "")) {
        let url = new URL(`/api/v1/download`, opensubtitlesUrl);
        let payload = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "Api-Key": this.api_key,
            "User-Agent": "Difficult words 0.0",
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
      if (text.length < 3) {
        return [];
      }
      const encodedText = encodeURIComponent(text);
      var url = new URL(
        `/api/v1/subtitles?query=${encodedText}`,
        opensubtitlesUrl,
      );
      var payload = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.api_key,
          "User-Agent": "Difficult words 0.0",
        },
      }).then((response) => response.json());
      if (typeof payload.data !== "undefined") {
        return payload.data;
      }
      return [];
    },
  },
});