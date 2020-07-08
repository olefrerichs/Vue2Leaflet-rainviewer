<template>
  <div>
    <div class="widget">
      <div class="headline">Regenradar-Konfiguration</div>
      <select v-model="currentlocation">
        <option
          v-for="option in options"
          v-bind:value="option.value"
          v-bind:key="option.value"
        >{{ option.text }}</option>
      </select>
    </div>

    <Rainviewerwidget :current-location="currentlocation"></Rainviewerwidget>
  </div>
</template>

<script>
import Rainviewerwidget from "./Rainviewerwidget.vue";

export default {
  components: {
    Rainviewerwidget
  },
  data() {
    return {
      currentlocation: 0,
      options: [
        { text: "Chemiepark Marl", value: 0 },
        { text: "Essen Campus", value: 1 },
        { text: "Parsippany, NJ", value: 2 },
        { text: "Canacona, Goa", value: 3 }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.headline {
  display: flex;
  text-transform: uppercase;
  color: #991d85;
  font-size: 15px;
  margin: 0;
  word-wrap: break-word;
  font-weight: 700;
}
select {
  width: 100%;
  margin-top: 0.6rem;
  outline: 0;
}
</style>
