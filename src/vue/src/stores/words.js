import { defineStore } from "pinia";
import commonWords from "../assets/10000-most-common-words.js";

const datamuseUrl = "https://api.datamuse.com/words";

export const useWordsStore = defineStore({
  id: "words",
  state: () => ({
    wordsFrequency: new Map(),
    words: [],
    lookedUpCount: 0,
    loading: false,
  }),
  actions: {
    reset() {
      this.wordsFrequency.clear();
      this.words = [];
      this.loading = false;
      this.lookedUpCount = 0;
    },
    validString(string) {
      var pass = true;
      /\d/.test(string) && (pass = false);
      /--/.test(string) && (pass = false);
      /[a-z\-]{3,}/.test(string) || (pass = false);
      commonWords.includes(string) && (pass = false);
      /[^s]s$/.test(string) &&
        commonWords.includes(string.substring(0, string.length - 1)) &&
        (pass = false);
      /ing$/.test(string) &&
        commonWords.includes(string.substring(0, string.length - 3)) &&
        (pass = false);
      /ed$/.test(string) &&
        commonWords.includes(string.substring(0, string.length - 2)) &&
        (pass = false);
      return pass;
    },
    polishString(string) {
      var polished = string.toLowerCase();
      polished = polished.replace(/\.|,|\?|!|\(|\)|\[|\]|&|:/gm, "");
      polished = polished.replace(/<i>/gm, "");
      polished = polished.replace(/<\/i>/gm, "");
      return polished;
    },
    storeWords(text) {
      this.loading = true;
      var words = text.split(/\s+|\n|'/);
      for (var i = 0; i < words.length; i += 1) {
        var word = this.polishString(words[i]);
        if (this.validString(word)) {
          if (this.wordsFrequency.get(word)) {
            this.wordsFrequency.set(word, this.wordsFrequency.get(word) + 1);
          } else {
            this.wordsFrequency.set(word, 1);
          }
        }
      }
    },
    async enrichWords() {
      for (let key of this.wordsFrequency.keys()) {
        this.words.push(this.fetchDefinition(key));
      }
      this.words = await Promise.all(this.words);
      this.words = this.words.filter((e) => e);
      this.words = this.words.sort((a, b) => a.frequency - b.frequency);
      this.loading = false;
    },
    async fetchDefinition(word) {
      var url = new URL(`?sp=${word}&md=fd&max=1`, datamuseUrl);
      try {
        var payload = await fetch(url).then((response) => response.json());
        var d = payload[0];
        var frequency = d["tags"][0];
        frequency = parseFloat(frequency.split(":")[1]);
        var definitions = d["defs"];
        this.lookedUpCount = this.lookedUpCount + 1;
        if (definitions) {
          return { word, frequency, definitions };
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    },
  },
});
