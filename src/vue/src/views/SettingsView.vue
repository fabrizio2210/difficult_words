<script setup>
import { useOpensubtitlesStore } from "../stores/opensubtitles";
</script>

<template>
  <div class="setting">
    <h1>Settings</h1>
    <ul>
      <li v-for="setting in settings" :key="setting.key">
        <label class="desc" :for="setting.key">{{ setting.key }} :</label>
        <input :id="setting.key" v-model="setting.value" size="30" />
      </li>
    </ul>
    <div>
      <button @click="save">Save</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      settings: [{ key: "API_KEY", value: "" }],
    };
  },
  methods: {
    save(event) {
      const { setApiKey } = useOpensubtitlesStore();
      for (const setting of this.settings) {
        if (setting.key == "API_KEY") {
          setApiKey(setting.value);
        }
        localStorage.setItem(setting.key, JSON.stringify(setting.value));
      }
    },
  },
  mounted() {
    for (const setting of this.settings) {
      setting.value = JSON.parse(localStorage.getItem(setting.key));
    }
  },
};
</script>

<style>
ul {
  list-style: none;
}

.desc {
  padding: 10px;
}
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
