<script setup>
import { useOpensubtitlesStore } from "../stores/opensubtitles";
</script>

<template>
  <div class="setting">
    <h1>Settings</h1>
    <ul>
      <li v-for="setting in settings" :key="setting.key">
        <div class="tooltip">
          <label class="desc" :for="setting.key">{{ setting.key }} :</label>
          <span class="tooltiptext" v-html="setting.description"></span>
        </div>
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
      settings: [
      { key: "API_KEY",
        value: "",
        description: "API key to query OpenSubtitles. Follow instruction at <a href='https://opensubtitles.stoplight.io/docs/opensubtitles-api/e3750fd63a100-getting-started' target='_blank'>their documentation</a>", 
      }],
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
/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
  width: 240px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px;
  border-radius: 6px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 1s;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 0.75;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
