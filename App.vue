<template>
  <div id="app">
    <Rainviewer/>
  </div>
</template>

<script>
import Rainviewer from "./components/Rainviewer.vue";

export default {
  components: {
    Rainviewer
  }
};
</script>

<style lang="scss">
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 11.746031746px;
  font-family: EvonikProkyon, "Trebuchet MS", "Lucida Grande",
    "Lucida Sans Unicode", "Lucida Sans", Tahoma, Arial, sans-serif;
}
html,
body {
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.widget {
  width: 312px;
  padding: 1.5rem;
  background-color: #e9e6df;
}
.widgetwrapper {
  margin-top: 1rem;
}
</style>