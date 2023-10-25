export default {
    //相机飞到指定点正上方
    flyToTargetPoint(viewer, point, orientation) {
        !point && (point = { lon: 106.96, lat: 34.6, alt: 21500000 });
        !orientation && (orientation = { h: 0, p: -90, r: 0 });
        const { lon, lat, alt } = point;
        const { h, p, r } = orientation;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
            orientation: {
                heading: Cesium.Math.toRadians(h),
                pitch: Cesium.Math.toRadians(p),
                roll: r,
            }
        });
    },
    
    //计算两点之间的距离，单位：km
    getDistance(points) {
        if (points.length === 2) {
            const point1cartographic = Cesium.Cartographic.fromDegrees(
                points[0][0], points[0][1]
            );
            const point2cartographic = Cesium.Cartographic.fromDegrees(
                points[1][0], points[1][1]
            );
            /**根据经纬度计算出距离**/
            const geodesic = new Cesium.EllipsoidGeodesic(point1cartographic, point2cartographic);
            return geodesic.surfaceDistance / 1000;
        }
    },

    //添加格网多边形
    addPolygon(viewer, id, points, attribute){
        const isExist = viewer.entities.getById(id);
        if (isExist) {
            return;
        }
        viewer.entities.add({
            id:id,
            name: "gridSurface",
            attribute:attribute,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(points),
              material: Cesium.Color.RED.withAlpha(0.5),
              outline: true,
              outlineColor: Cesium.Color.BLACK,
            //   outlineWidth:10,
              height:0,
            },
          });
    },
}