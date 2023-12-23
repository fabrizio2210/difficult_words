import { defineStore } from "pinia";
import commonWords from "../assets/10000-most-common-words.js";

const datamuseUrl = "https://api.datamuse.com/words";

export const useWordsStore = defineStore({
  id: "words",
  state: () => ({
    wordsFrequency: new Map(),
    words: [],
  }),
  actions: {
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
      console.log(this.words);
      this.words = this.words.sort((a, b) => a.frequency - b.frequency);
    },
    async fetchDefinition(word) {
      var url = new URL(`?sp=${word}&md=fd&max=1`, datamuseUrl);
      try {
        var payload = await fetch(url).then((response) => response.json());
        var d = payload[0];
        var frequency = d["tags"][0];
        frequency = parseFloat(frequency.split(":")[1]);
        var definitions = d["defs"];
        return { word, frequency, definitions };
      } catch (error) {
        console.log(error);
      }
      return null;
    },
  },
});
