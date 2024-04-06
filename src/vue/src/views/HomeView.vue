<script setup>
import { storeToRefs } from "pinia";
import { useWordsStore } from "../stores/words";
import { useOpensubtitlesStore } from "../stores/opensubtitles";
const { words, lookedUpCount, wordsFrequency, wordsContext, loading } =
  storeToRefs(useWordsStore());
const { setApiKey } = useOpensubtitlesStore();

if (typeof import.meta.env.VITE_OPENSUBTITLES_API_KEY !== "undefined") {
  setApiKey(import.meta.env.VITE_OPENSUBTITLES_API_KEY);
}
if (localStorage.getItem("API_KEY") !== null) {
  setApiKey(JSON.parse(localStorage.getItem("API_KEY")));
}
</script>

<template>
  <main>
    <div id="search-box">
      <label for="search">Search the film:</label>
      <input list="title-suggestions" v-model="search_input" id="search" />
      <datalist id="title-suggestions">
        <option
          v-for="suggestion in title_suggestions"
          :value="suggestion"
        ></option>
      </datalist>
    </div>
    <div>
      <label for="file">Or choose file to scan</label>
      <input
        type="file"
        id="file"
        name="file"
        ref="fileInput"
        accept=".srt, .text, .txt"
      />
    </div>
    <div>
      <button @click="scan">Scan</button>
    </div>
    <div>
      <progress
        v-if="loading"
        :value="(100 * lookedUpCount) / wordsFrequency.size"
        id="lookingup"
        max="100"
      ></progress>
    </div>
    <div v-for="word in words">
      <h2>{{ word.word }}</h2>
      <h3 v-if="word.word">
        occurres {{ wordsFrequency.get(word.word) }} time(s)
      </h3>
      <h4 v-if="word.word">
        context: <i>{{ wordsContext.get(word.word) }}</i>
      </h4>
      <ul>
        <li v-for="def in word.definitions">
          {{ def }}
        </li>
      </ul>
    </div>
  </main>
</template>
<script>
export default {
  data() {
    return {
      search_input: [],
    };
  },
  methods: {
    async scan(event) {
      var reader = new FileReader();
      const { fetchSubtitlesText } = useOpensubtitlesStore();
      var reading = function (text) {
        const { reset, storeWords, enrichWords } = useWordsStore();
        reset();
        storeWords(text);
        enrichWords();
      };
      const file_name = this.$refs.fileInput.value;
      if (file_name == "") {
        // No file so downloading from OpenSubtitles.
        let text = await fetchSubtitlesText(this.search_input);
        reading(text);
      } else {
        reader.readAsText(this.$refs.fileInput.files[0]);
        reader.onload = function () {
          var text = reader.result;
          // Process the text here.
          reading(text);
        };
      }
    },
  },
  asyncComputed: {
    async title_suggestions() {
      const { fetchHints } = useOpensubtitlesStore();
      if (this.search_input != "") {
        return await fetchHints(this.search_input);
      }
      return [];
    },
  },
};
</script>

<style scoped>
input {
  padding: 5px;
}

#search-box {
  padding: 10px;
}

#search {
  min-width: 90%;
}
</style>
