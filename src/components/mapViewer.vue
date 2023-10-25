<template>
  <div id="cesiumContainer"></div>
</template>

<script>
let viewer;
export default {
  name: "mapViewer",
  props: ['gridSize'],
  data() {
    return {
      selGridId: null,
      selectGrid: []
    };
  },
  methods: {
    eventsInfor() {
      const self = this;
      this.$events.on('gridData', function (data) {
        self.drawGrid(data);
      });
    },
    init() {
      viewer = new Cesium.Viewer("cesiumContainer", {
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 7,
          show: false
        }),
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        timeline: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        clockViewModel: new Cesium.ClockViewModel(
            new Cesium.Clock({
              shouldAnimate: true
            })
        )
      });
      const scene = viewer.scene
      const ellipsoid = viewer.scene.globe.ellipsoid;
      viewer._cesiumWidget._creditContainer.style.display = "none";
      scene.globe.enableLighting = true;
      Cesium.Camera.DEFAULT_VIEW_FACTOR = 1.2;
      this.drawGrid()
      this.initView(viewer);
      this.eventsInfor();
      // this.getEntityByClick();
      const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      const self = this;
      handler.setInputAction(function (movement) {
        const pick = viewer.scene.pick(movement.position);
        if (pick && Cesium.defined(pick) && pick.id) {
          if (pick.id.name === 'box') {
            self.showBoxsInfor(pick.id.attribute);
          } else
            self.addVerticalBoxs(pick.id)
        } else {
          let cartesian = scene.globe.pick(viewer.camera.getPickRay(movement.position), scene);
          if (cartesian) {
            cartesian = ellipsoid.cartesianToCartographic(cartesian);
            let lat = Cesium.Math.toDegrees(cartesian.latitude);
            let lng = Cesium.Math.toDegrees(cartesian.longitude);
            let alt = cartesian.height;
            self.getGridArray(lng, lat, alt)
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    getGridArray(lng, lat, alt) {
      viewer.entities.removeAll()
      lng = parseInt(lng / 2) * 2
      lat = parseInt(lat / 2) * 2
      this.selectGrid = [lng, lat]
      viewer.entities.add({
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(lng, lat, lng + 2, lat + 2), // 最西、最南、最东、最北
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 4,
          material: Cesium.Color.RED.withAlpha(0.3)
        },
      })
      const scene = viewer.scene;
      const primitives = scene.primitives
      if (primitives.get(2)) {
        primitives.remove(primitives.get(2))
      }
      this.$emit('showData', true)
    },
    initView(viewer) {
      let initialPosition = new Cesium.Cartesian3.fromDegrees(103, 35, 20475000);
      let initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0);
      let initCameraView = {
        destination: initialPosition,
        orientation: {
          heading: initialOrientation.heading,
          pitch: initialOrientation.pitch,
          roll: initialOrientation.roll
        }
      };
      viewer.scene.camera.setView(initCameraView);
    },
    clipGird() {
      const gridSize = this.gridSize;
      const distance = 110000;
      const lon = this.selectGrid[0]
      const lat = this.selectGrid[1]
      const step = Number((gridSize / distance).toFixed(2))
      let grids = []
      for (let x = lon; x <= lon + 2; x += step) {
        for (let y = lat; y <= lat + 2; y += step) {
          grids.push([x, y, x + step, y + step])
        }
      }
      viewer.entities.removeAll()
      const scene = viewer.scene;
      const primitives = scene.primitives
      if (primitives.get(2)) {
        primitives.remove(primitives.get(2))
      }
      let instances = []
      grids.forEach((grid, i) => {
        viewer.entities.add({
          attribute: {
            id: i,
            coordinates: Cesium.Rectangle.fromDegrees(grid[0], grid[1], grid[2], grid[3]),
          },
          rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(grid[0], grid[1], grid[2], grid[3]), // 最西、最南、最东、最北
            material: Cesium.Color.RED.withAlpha(0),
          },
        })
        instances.push(new Cesium.GeometryInstance({
          geometry: new Cesium.RectangleOutlineGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(grid[0], grid[1], grid[2], grid[3]),
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.YELLOW)
          },
        }))
      })
      viewer.flyTo(viewer.entities)
      scene.primitives.add(new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.MaterialAppearance({})
      }));

      return
      //
      // data.forEach(item => {
      //   const {id,rtLon,rtLat,rbLon,rbLat,lbLon,lbLat,ltLon,ltLat} = item;
      //   const tempPoints = [rtLon,rtLat,rbLon,rbLat,lbLon,lbLat,ltLon,ltLat];
      //   cesiumUtils.addPolygon(viewer, id, tempPoints, item);
      // });
      // const {rtLon,rtLat} = data[0];
      // cesiumUtils.flyToTargetPoint(viewer, { lon: rtLon, lat: rtLat, alt: 6150000 });
    },
    drawGrid(data) {
      const scene = viewer.scene;
      let grids = []
      for (let x = -180; x <= 180; x += 2) {
        for (let y = -90; y <= 90; y += 2) {
          grids.push([x, y, x + 2, y + 2])
        }
      }
      let instances = []
      grids.forEach(grid => {
        instances.push(new Cesium.GeometryInstance({
          geometry: new Cesium.RectangleOutlineGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(grid[0], grid[1], grid[2], grid[3]),
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
          },
        }))
      })

      scene.primitives.add(new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.MaterialAppearance({})
      }));

      return
      //
      // data.forEach(item => {
      //   const {id,rtLon,rtLat,rbLon,rbLat,lbLon,lbLat,ltLon,ltLat} = item;
      //   const tempPoints = [rtLon,rtLat,rbLon,rbLat,lbLon,lbLat,ltLon,ltLat];
      //   cesiumUtils.addPolygon(viewer, id, tempPoints, item);
      // });
      // const {rtLon,rtLat} = data[0];
      // cesiumUtils.flyToTargetPoint(viewer, { lon: rtLon, lat: rtLat, alt: 6150000 });
    },
    getEntityByClick() {
      const self = this;
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(function (movement) {
        const pick = viewer.scene.pick(movement.position);
        if (pick && Cesium.defined(pick) && pick.id) {
          console.log("pick:", pick.id.attribute);
          if (pick.id.name === 'gridSurface') {
            if (self.selGridId === null) {
              self.selGridId = pick.id.id;
              self.addVerticalBoxs(pick.id);
              return;
            }
            if (self.selGridId == pick.id.id) {
              return;
            }
            if (self.selGridId && self.selGridId !== pick.id.id) {
              self.removeAllBoxs();
              self.selGridId = pick.id.id;
              self.addVerticalBoxs(pick.id);
            }
          }
          if (pick.id.name === 'box') {
            self.showBoxsInfor(pick.id.attribute);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    addVerticalBoxs(entity) {
      const {id, coordinates} = entity.attribute;
      const step = this.gridSize;
      const maxHeight = 300000;
      const center = Cesium.Rectangle.center(coordinates)
      let e = []
      viewer.entities.values.forEach(entity => {
        if (entity.name == "box") {
          e.push(entity)
        }
      })
      e.forEach(en => {
        viewer.entities.remove(en)
      })
      for (let i = 0; i <= maxHeight / step; i++) {
        viewer.entities.add({
          attribute: {
            gridinfoId: id,
            height: (i * step) + (step / 2),
          },
          name: "box",
          position: Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(center.longitude), Cesium.Math.toDegrees(center.latitude), (i * step) + (step / 2)),
          box: {
            dimensions: new Cesium.Cartesian3(step, step, step),
            fill: true,
            material: Cesium.Color.YELLOW.withAlpha(0.01),
            outline: true,
            outlineColor: Cesium.Color.YELLOW,
            zIndex: 9999,
          },
        });
      }
    },
    removeAllBoxs() {
      const boxIds = []
      viewer.entities.values.forEach(item => {
        if (item.name === 'box') {
          boxIds.push(item.id)
        }
      })
      boxIds.forEach(id => {
        const box = viewer.entities.getById(id);
        viewer.entities.remove(box);
      });
    },
    showBoxsInfor(attribute) {
      this.$events.emit("boxInfos", attribute);
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    gridSize(e) {
      this.clipGird()
    }
  }
};
</script>

<style scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}
</style>
