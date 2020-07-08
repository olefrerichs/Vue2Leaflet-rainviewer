<template>
  <div
    class="widgetwrapper"
    v-bind:class="{ 'is-fullscreen': fullScreen }"
    @click="toggleFullscreen"
  >
    <div class="widget" @click.prevent.stop>
      <header class="header">
        <div class="title">
          <div class="headline">Regenradar
            <div v-if="error">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <button v-if="!loading" @click="updateData(true)">
              <i class="fas fa-sync-alt"></i>
            </button>
            <div v-if="loading">
              <i class="fas fa-spin fa-sync-alt"></i>
            </div>
          </div>
          <div class="location">{{ locations[currentLocation].caption }}</div>
          <div class="date">{{ localDate }}</div>
        </div>
        <div class="controls">
          <div class="time">{{ localTime }}</div>
          <div class="controlbuttons">
            <button @click="move('back')" v-if="fullScreen">
              <i class="fas fa-backward"></i>
            </button>
            <button @click="play()" v-if="!playing">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <g>
                  <path
                    d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm115.7 272l-176 101c-15.8 8.8-35.7-2.5-35.7-21V152c0-18.4 19.8-29.8 35.7-21l176 107c16.4 9.2 16.4 32.9 0 42z"
                  ></path>
                  <path
                    d="M371.7 280l-176 101c-15.8 8.8-35.7-2.5-35.7-21V152c0-18.4 19.8-29.8 35.7-21l176 107c16.4 9.2 16.4 32.9 0 42z"
                  ></path>
                </g>
              </svg>
            </button>
            <button @click="pause()" v-if="playing">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <g>
                  <path
                    d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 328a16 16 0 0 1-16 16h-48a16 16 0 0 1-16-16V176a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16zm112 0a16 16 0 0 1-16 16h-48a16 16 0 0 1-16-16V176a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16z"
                  ></path>
                  <path
                    d="M224 160h-48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V176a16 16 0 0 0-16-16zm112 0h-48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V176a16 16 0 0 0-16-16z"
                  ></path>
                </g>
              </svg>
            </button>
            <button @click="move('next')" v-if="fullScreen">
              <i class="fas fa-forward"></i>
            </button>
          </div>
        </div>
      </header>
      <l-map
        class="rainmap"
        ref="rainmap"
        :zoom="locations[currentLocation].zoom"
        :center="locations[currentLocation].center"
        @ready="mapReady()"
      >
        <l-tile-layer
          :url="config.osmUrl"
          :attribution="config.osmAttribution"
          :opacity="osmOpacity"
        ></l-tile-layer>
        <l-tile-layer
          v-for="radarLayer in radarLayers"
          :key="radarLayer.url"
          :url="radarLayer.url"
          :opacity="radarLayer.opacity"
          @ready="layerReady(radarLayer.id)"
        ></l-tile-layer>
        <l-control position="topright" class="resize-button">
          <div @click="toggleFullscreen">
            <i class="fas fa-expand" v-if="!fullScreen"></i>
            <i class="fas fa-compress" v-if="fullScreen"></i>
          </div>
        </l-control>
        <l-control position="bottomleft" v-if="fullScreen">
          <div
            class="legend"
            v-bind:class="{ 'is-collapsed': legendCollapsed }"
            @click="toggleLegend"
          >
            <ul class="short-color-scheme">
              <li>
                <div class="cs-clouds"></div>
                <p>Drizzle</p>
              </li>
              <li>
                <div class="cs-percip-3"></div>
                <p>Light Rain</p>
              </li>
              <li>
                <div class="cs-rainfall-1"></div>
                <p>Rain</p>
              </li>
              <li>
                <div class="cs-storm-1"></div>
                <p>Heavy Rain</p>
              </li>
              <li>
                <div class="cs-storm-3"></div>
                <p>Storm</p>
              </li>
              <li>
                <div class="cs-hail-2"></div>
                <p>Hail</p>
              </li>
            </ul>
          </div>
        </l-control>
      </l-map>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import { LMap, LTileLayer, LControl } from "vue2-leaflet";
import moment from "moment";

export default {
  components: {
    LMap,
    LTileLayer,
    LControl
  },
  props: {
    currentLocation: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      config: {
        animationInterval: 3000,
        autostart: true,
        layerOpacity: 0.5,
        osmUrl: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
        osmAttribution:
          "&copy <a href='www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a>",
        osmAttributionLong:
          "&copy <a href='www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributers",
        rainviewerTimestampUrl: "https://api.rainviewer.com/public/maps.json",
        rainviewerTileCacheUrl: "https://tilecache.rainviewer.com/v2/radar/",
        rainviewerTileCacheUrl2: "/256/{z}/{x}/{y}/2/1_1.png",
        rainviewerAttribution:
          "<a href='https://www.rainviewer.com/' target='_blank'>Rainviewer</a>"
      },
      locations: [
        {
          center: [51.6838203, 7.0915903],
          zoom: 10,
          caption: "Chemiepark Marl",
          locale: "de"
        },
        {
          center: [51.4490952, 7.0137945],
          zoom: 10,
          caption: "Essen Campus",
          locale: "de"
        },
        {
          center: [40.8562698, -74.4154213],
          zoom: 10,
          caption: "Parsippany, NJ",
          locale: "en"
        },
        {
          center: [15.0033541, 74.0467685],
          zoom: 12,
          caption: "Canacona, Goa",
          locale: "en"
        }
      ],
      animationPosition: 0,
      animationPlayerTimer: null,
      osmOpacity: 1,
      loading: true,
      error: false,
      playing: false,
      fullScreen: false,
      legendCollapsed: false,
      map: null,
      radarLayers: [
        { id: null, url: "", timestamp: "", opacity: 0, loaded: false }
      ]
    };
  },
  computed: {
    localDate() {
      let date = moment.unix(
        this.radarLayers[this.animationPosition].timestamp
      );
      if (this.locations[this.currentLocation].locale === "de") {
        return date.isValid() ? date.format("DD. MMM YYYY") : "\xa0";
      } else {
        return date.isValid() ? date.format("ll") : "\xa0";
      }
    },
    localTime() {
      let time = moment.unix(
        this.radarLayers[this.animationPosition].timestamp
      );
      if (this.locations[this.currentLocation].locale === "en") {
        return time.isValid() ? time.format("hh:mm a") : "\xa0";
      } else {
        return time.isValid() ? time.format("HH:mm") : "\xa0";
      }
    }
  },
  watch: {
    currentLocation: function() {
      this.updateData();
    },
    animationPosition: function(newValue, oldValue) {
      this.fadeAnimation(oldValue, "out");
      this.fadeAnimation(newValue, "in");
    }
  },
  methods: {
    getData(fullRedraw) {
      const vm = this;
      const request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (this.readyState !== 4) {
          vm.loading = true;
          return;
        }
        if (this.status !== 200) {
          vm.error = true;
          console.error("Timestamp not found.");
          return;
        }
        const response = request.responseText;
        if (!response) {
          vm.error = true;
          return;
        } else {
          vm.radarLayers = [];
          JSON.parse(response).forEach(function(item, index) {
            vm.radarLayers.push({
              id: index,
              url:
                vm.config.rainviewerTileCacheUrl +
                item +
                vm.config.rainviewerTileCacheUrl2,
              timestamp: item,
              opacity: 0
            });
          });
          if (fullRedraw) {
            vm.$refs.rainmap.mapObject.eachLayer(function(layerObject) {
              layerObject.redraw();
            });
          }
          if (vm.radarLayers.length > 1 && vm.config.autostart) {
            vm.$nextTick(() => {
              vm.showLayer(Math.round(vm.radarLayers.length / 2));
              vm.play();
            });
          } else if (vm.radarLayers.length > 1) {
            vm.$nextTick(() => {
              vm.showLayer(vm.radarLayers.length - 4);
            });
          }
          vm.loading = false;
        }
      };
      request.open("GET", vm.config.rainviewerTimestampUrl);
      request.send();
    },
    updateData(manual) {
      this.pause();
      this.loading = true;
      this.getData(manual);
    },
    mapReady() {
      this.map = this.$refs.rainmap.mapObject;
      this.map.attributionControl.setPrefix("");
      this.loading = false;
    },
    layerReady(layerId) {
      const vm = this;
      if (layerId === vm.radarLayers.length - 1) {
        vm.map.eachLayer(function(layerObject) {
          if (layerObject instanceof L.TileLayer) {
            vm.layerLoadEvents(layerObject);
          }
        });
      }
    },
    layerLoadEvents(layerObject) {
      const vm = this;
      if (layerObject) {
        const radarLayer = vm.radarLayers.find(e => e.url === layerObject._url);

        if (radarLayer) {
          layerObject.on("load tileloadstart", function(event) {
            vm.loading = true;
            radarLayer.loaded = false;
          });
          layerObject.on("tileerror", function(event) {
            vm.error = true;
            radarLayer.loaded = false;
          });
          layerObject.on("load", function(event) {
            radarLayer.loaded = true;
            if (!vm.radarLayers.some(e => e.loaded === false)) {
              vm.loading = false;
              vm.error = false;
            }
          });
        }
      }
    },
    toggleFullscreen() {
      this.fullScreen = !this.fullScreen;
      this.$nextTick(() => {
        this.map.invalidateSize();
      });

      if (this.fullScreen) {
        this.toggleAttribution(
          this.config.rainviewerAttribution,
          this.config.osmAttribution,
          this.config.osmAttributionLong
        );
      } else {
        this.toggleAttribution(
          "",
          this.config.osmAttributionLong,
          this.config.osmAttribution
        );
      }
    },
    toggleAttribution(prefix, oldValue, newValue) {
      this.map.attributionControl.setPrefix(prefix);
      this.$nextTick(() => {
        this.map.attributionControl.removeAttribution(oldValue);
        this.map.attributionControl.addAttribution(newValue);
      });
    },
    toggleLegend() {
      this.legendCollapsed = !this.legendCollapsed;
    },
    pause() {
      this.playing = false;
      clearTimeout(this.animationPlayerTimer);
    },
    play() {
      this.playing = true;
      this.player();
    },
    move(direction) {
      this.pause();
      console.log("click");
      let target;
      let current = this.animationPosition;
      let last = this.radarLayers.length - 1;
      let move = direction === "next" ? 1 : -1;

      if (current !== last && current !== 0) {
        target = current + move;
      } else if (current === last) {
        target = direction === "next" ? 0 : current + move;
      } else {
        target = direction === "next" ? 1 : last;
      }

      if (this.radarLayers.find(e => e.id === target).loaded) {
        this.showLayer(target);
      }
    },
    player() {
      const vm = this;
      if (this.playing) {
        if (vm.animationPosition < vm.radarLayers.length - 1) {
          vm.showLayer(vm.animationPosition + 1);
          vm.animationPlayerTimer = setTimeout(function() {
            vm.player();
          }, vm.config.animationInterval);
        } else {
          vm.showLayer(0);
          vm.radarLayers.forEach(layer => {
            if (layer.id !== 0 && layer.id !== vm.radarLayers.length - 1) {
              layer.opacity = 0;
            }
          });
          vm.osmOpacity = 0.4;
          vm.animationPlayerTimer = setTimeout(function() {
            vm.osmOpacity = 1;
            vm.radarLayers.find(e => e.id === 0).opacity = 0.5;
          }, vm.config.animationInterval / 2);
          vm.animationPlayerTimer = setTimeout(function() {
            vm.player();
          }, vm.config.animationInterval);
        }
      }
    },
    showLayer(layerId) {
      this.animationPosition = layerId;
    },
    fadeAnimation(layerId, direction) {
      if (layerId && direction) {
        const layer = this.radarLayers.find(e => e.id === layerId);
        const factor = direction === "in" ? 0.05 : -0.05;

        const endTime = this.config.animationInterval / 3;
        const period = endTime / 10;
        let counter = 0;
        const fader = setInterval(function() {
          layer.opacity = Math.round((layer.opacity + factor) * 100) / 100;
          if (counter === endTime) {
            clearInterval(fader);
          }
          counter += period;
        }, period);
      }
    }
  },
  mounted: function() {
    this.updateData();
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

  div,
  button {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    margin-left: 0.5em;
    color: #991d85;
    font-size: 0.8em;
  }
  button {
    padding: 0;
    background-color: transparent;
    border: 0;
    outline: 0;
    cursor: pointer;
    opacity: 0;
  }
  &:hover {
    button {
      opacity: 1;
    }
  }
}
.rainmap {
  height: 277px;
}
.resize-button {
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    background-color: white;
    border: 1px solid #aaa;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #f4f4f4;
    }

    i {
      font-size: 1.3rem;
    }
  }
}
.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
}
.location {
  padding-top: 0.5rem;
  font-weight: 600;
}
.date {
  font-size: 0.9rem;
}
.controls {
  flex: 0 0 auto;

  .is-fullscreen & {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
.time {
  text-align: right;
  text-transform: uppercase;
  color: #991d85;
  font-size: 15px;
  margin: 0;
  font-weight: 700;
  .is-fullscreen & {
    text-align: center;
  }
}
.controlbuttons {
  display: flex;
  justify-content: flex-end;
  .is-fullscreen & {
    justify-content: center;
  }
  padding-top: 0.7rem;

  button {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.8rem;
    margin: 0;
    padding: 0;
    background-color: transparent;
    border: 0;
    outline: 0;
    cursor: pointer;

    i {
      font-size: 12px;
    }
    &:not(:first-of-type) {
      .is-fullscreen & {
        margin-left: 0.5rem;
      }
    }

    svg {
      width: 100%;
      height: auto;
      g {
        path:first-child {
          fill: #ae5ca0;
          opacity: 0.4;
        }
        path:last-child {
          fill: #991d85;
        }
      }
    }
    &:hover {
      svg {
        > path {
          fill: #991d85;
        }
        g {
          path:first-child {
            fill: #991d85;
            opacity: 1;
          }
          path:last-child {
            fill: #ffffff;
          }
        }
      }
    }
  }
}
.widgetwrapper.is-fullscreen {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(black, 0.4);
}
.is-fullscreen {
  .widget {
    width: 80vw;
    height: 80vh;
  }
  .rainmap {
    height: calc(80vh - 8rem);
  }
}

.legend {
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  background-color: white;
  border: 1px solid #aaa;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
  border-radius: 4px;
  user-select: none;
  cursor: pointer;
  font-family: EvonikProkyon, "Trebuchet MS", "Lucida Grande",
    "Lucida Sans Unicode", "Lucida Sans", Tahoma, Arial, sans-serif;
}

.short-color-scheme {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;

    + li {
      margin-top: 1px;
    }
  }
  div {
    flex: 0 0 auto;
    display: flex;
    width: 1.2rem;
    height: 1.2rem;
  }
  p {
    flex: 1 1 auto;
    display: flex;
    margin: 0;
    font-size: 0.8rem;
    padding-left: 0.4rem;

    .is-collapsed & {
      display: none;
    }
  }
}

.cs-clouds {
  background-color: #88eeee;
}
.cs-percip-3 {
  background-color: #005588;
}
.cs-rainfall-1 {
  background-color: #ffee00;
}
.cs-storm-1 {
  background-color: #ff4400;
}
.cs-storm-3 {
  background-color: #990000;
}
.cs-hail-2 {
  background-color: #ff77ff;
}
</style>