import Base from '../base';
// @ts-ignore
import { Cartesian3 } from 'cesium';

import { PolygonStyle } from '../interface';

export default class Rectangle extends Base {
  points: Cartesian3[] = [];
  minPointsForShape: number;

  constructor(cesium: any, viewer: any, style?: PolygonStyle) {
    super(cesium, viewer, style);
    this.cesium = cesium;
    this.minPointsForShape = 2;
    this.setState('drawing');
  }

  getType(): 'polygon' | 'line' {
    return 'polygon';
  }

  getPointsCenter(){
    // 计算中心点,重心
    const midXYZ = new this.cesium.Cartesian3();
    this.points.map((pt)=>{
     midXYZ.x = midXYZ.x+ pt.x;
     midXYZ.y = midXYZ.y+ pt.y;
     midXYZ.z = midXYZ.z+ pt.z;
    })
    midXYZ.x = midXYZ.x/this.points.length;
    midXYZ.y = midXYZ.y/this.points.length;
    midXYZ.z = midXYZ.z/this.points.length;
    return midXYZ;
 }

  /**
   * Add points only on click events
   */
  addPoint(cartesian: Cartesian3) {
    this.points.push(cartesian);
    if (this.points.length === 1) {
      this.onMouseMove();
    } else if (this.points.length > 1) {
      this.finishDrawing();
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.points, cartesian];
    const geometryPoints = this.createRectangle(tempPoints);
    this.setGeometryPoints(geometryPoints);
    this.drawPolygon();
  }

  /**
   * In edit mode, drag key points to update corresponding key point data.
   */
  updateDraggingPoint(cartesian: Cartesian3, index: number) {
    this.points[index] = cartesian;
    const geometryPoints = this.createRectangle(this.points);
    this.setGeometryPoints(geometryPoints);
    this.drawPolygon();
  }
  
  createGraphic(positions: Cartesian3[]) {
    return this.createRectangle(positions);
  }

  createRectangle(positions: Cartesian3[]) {
    const [p1, p2] = positions.map(this.cartesianToLnglat);
    const coords = [...p1, p1[0], p2[1], ...p2, p2[0], p1[1], ...p1];
    const cartesianPoints = this.cesium.Cartesian3.fromDegreesArray(coords);
    return cartesianPoints;
  }

  getPoints() {
    return this.points;
  }
}
