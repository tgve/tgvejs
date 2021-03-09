function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true
  });
}

// TODO: change to domain name 
define("PRD_URL", 'https://layik.github.io/eAtlas')
define("DEV_URL", 'http://localhost:8000')

define("UI_LIST", [
  "checkbox",
  "radio",
  "buttongroups",
  "dropdown",
  "slider"]) 
define("LAYERSTYLES", [
  "arc",
  "geojson",
  "grid",
  "heatmap",
  "hex",
  "icon",
  "line",
  "path",
  "scatterplot",
  "sgrid",
  "barvis"
])

define("DECKGL_INIT", {
  longitude: -1.6362,
  latitude: 53.8321,
  zoom: 10,
  pitch: 55,
  bearing: 0,
})

define("LIGHT_SETTINGS", {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
})

define("PLOT_W", 250)

define("TURQUOISE_RANGE", ['#12939A','#1293FF'])

define("BLANKSTYLE", {
  "version": 8, "name": "Blank", "center": [0, 0],
  "zoom": 0, "sources": {},
  "layers": [{
    "id": "background", "type": "background", "paint":
      { "background-color": "rgba(255,255,255,1)" }
  }], "id": "blank"
})

define("ICONLIMIT", 500)
define("ELEVATION", 4)
define("RADIUS", 100)

define("DATE_REGEX", "date|time|datetime|year")