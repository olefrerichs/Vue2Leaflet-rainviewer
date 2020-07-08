import Vue from "vue";
import moment from "moment";
import App from "./App";
import "leaflet/dist/leaflet.css";

Vue.prototype.moment = moment;

new Vue({
  el: "#app",
  template: "<App/>",
  components: { App }
});
