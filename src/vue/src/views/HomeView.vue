<script setup>
import { storeToRefs } from "pinia";
import { useWordsStore } from "../stores/words";
const { words } = storeToRefs(useWordsStore());
</script>

<template>
  <main>
    <div>
      <label for="file">Choose file to scan</label>
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
    <div v-for="word in words">
      <h2>{{ word.word }}</h2>
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
  methods: {
    scan(event) {
      const file_name = this.$refs.fileInput.value;
      console.log(file_name);
      var reader = new FileReader();
      reader.onload = function () {
        var text = reader.result;
        // Process the text here.
        const { storeWords, enrichWords } = useWordsStore();
        storeWords(text);
        enrichWords();
      };
      reader.readAsText(this.$refs.fileInput.files[0]);
    },
  },
};
</script>
