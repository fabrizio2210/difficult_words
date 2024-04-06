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
      <autocomplete
      placeholder="Search the film"
      :search="search"
      @submit="onSearchSubmit"
      ></autocomplete>
    </div>
    <div>
      <label for="file">Or choose file to scan</label>
      <input
        type="file"
        id="file"
        name="file"
        ref="fileInput"
        v-on:change="fileSelectInput"
        accept=".srt, .text, .txt"
      />
    </div>
    <div>
      <button :disabled='isScanDisabled' @click="scan">Scan</button>
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
      fileInput: ""
    }
  },
  methods: {
    reading(text) {
      const { reset, storeWords, enrichWords } = useWordsStore();
      reset();
      storeWords(text);
      enrichWords();
    },
    async scan(event) {
      var reader = new FileReader();
      const { fetchSubtitlesText } = useOpensubtitlesStore();
      const file_name = this.fileInput;
      if (file_name != "") {
        reader.readAsText(this.$refs.fileInput.files[0]);
        reader.reading = this.reading;
        reader.onload = function () {
          var text = reader.result;
          // Process the text here.
          this.reading(text);
        };
      }
    },
    async onSearchSubmit(result) {
      // No file so downloading from OpenSubtitles.
      const { fetchSubtitlesText } = useOpensubtitlesStore();
      let text = await fetchSubtitlesText(result);
      this.reading(text);
    },
    async search(input) {
      const { fetchHints } = useOpensubtitlesStore();
      return await fetchHints(input);
    },
    fileSelectInput() {
      this.fileInput = this.$refs.fileInput.value;
    },
  },
  computed: {
    isScanDisabled: function() {
      return this.fileInput == "";
    }
  },
  asyncComputed: {
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
