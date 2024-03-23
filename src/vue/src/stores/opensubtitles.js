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
          data.map((movie) => 
            [ movie.attributes.feature_details.movie_name,
              movie.attributes.feature_details.movie_name]
        ));
        titles = Array.from(unique_titles, ([name, value]) => (name));
      }
      return titles;
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
