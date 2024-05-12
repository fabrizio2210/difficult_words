<script setup>
import { storeToRefs } from "pinia";
import { useWordsStore } from "../stores/words";
import { useOpensubtitlesStore } from "../stores/opensubtitles";
import MoonLoader from "vue-spinner/src/MoonLoader.vue";
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
    <div class="input-box">
      <div :hidden="!isSearchDisabled">
        You need to populate API_KEY varaible in setting to use the search.
      </div>
      <div :class="{ disableddiv: isSearchDisabled }" id="search-input-box">
        <label for="search">Search the film and click on the result:</label>
        <autocomplete
          placeholder="Search the film and click on the result"
          auto-select
          :submitOnEnter=true
          :search="search"
          :debounce-time="500"
          @submit="onSearchSubmit"
        ></autocomplete>
      </div>
    </div>
    <div class="input-box">
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
        <button :hidden="isScanDisabled" @click="scan">Scan</button>
      </div>
    </div>
    <div>
      <a v-if="downloadURL" target="_blank" :href="downloadURL" download
        >Download subtitle</a
      >
    </div>
    <div>
      <MoonLoader v-if="opensubtitlesLoading"></MoonLoader>
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
      fileInput: "",
    };
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
    isScanDisabled: function () {
      return this.fileInput == "";
    },
    isSearchDisabled: function() {
      const store = useOpensubtitlesStore();
      return store.api_key == "";
    },
    opensubtitlesLoading: function () {
      const store = useOpensubtitlesStore();
      return store.loading;
    },
    downloadURL: function () {
      const store = useOpensubtitlesStore();
      return store.downloadURL;
    },
  },
  asyncComputed: {},
};
</script>

<style scoped>
input {
  padding: 5px;
}

.disableddiv {
  pointer-events: none;
  opacity: 0.2;
}

.input-box {
  padding: 10px;
  margin: 20px;
  border-radius: 25px;
  border: 2px solid var(--color-border);
}

#search {
  min-width: 90%;
}
</style>
