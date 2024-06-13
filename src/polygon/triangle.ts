import Base from '../base';
// @ts-ignore
import { Cartesian3 } from 'cesium';
import * as Utils from '../utils';
import { PolygonStyle } from '../interface';

export default class Triangle extends Base {
  points: Cartesian3[] = [];
  minPointsForShape: number;
  growUp: boolean;

  constructor(cesium: any, viewer: any, style?: PolygonStyle) {
    super(cesium, viewer, style);
    this.cesium = cesium;
    this.minPointsForShape = 3;
    this.growUp = true;
    this.setState('drawing');
  }

  getType(): 'polygon' | 'line' {
    return 'polygon';
  }

  /**
   * Add points only on click events
   */
  addPoint(cartesian: Cartesian3) {
    this.points.push(cartesian);
    if (this.points.length === 1) {
      this.onMouseMove();
    } else if (this.points.length === 3) {
      this.finishDrawing();
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.points, cartesian];
    this.setGeometryPoints(tempPoints);
    if (tempPoints.length === 2) {
      this.addFirstLineOfTheArrow();
    } else {
      this.drawPolygon();
    }
  }

  /**
   * In edit mode, drag key points to update corresponding key point data.
   */
  updateDraggingPoint(cartesian: Cartesian3, index: number) {
    this.points[index] = cartesian;
    this.setGeometryPoints(this.points);
    this.drawPolygon();
  }

  createGraphic(positions: Cartesian3[]) {
    if (this.growUp) {
      const [p1, p2, p3] = positions.map(this.cartesianToLnglat);

      const endPoint = this.cartesianToLnglat(this.points[2]);

      const mid = Utils.Mid(p1, p2);
      // 距离比例
      const ratioD = Utils.MathDistance(p3, mid) / Utils.MathDistance(endPoint, mid);
      // 计算中心点
      const midXYZ = this.getPointsCenter();
      // 计算三个控制点坐标
      const pnt1 = this.cartesianToLnglat(this.cesium.Cartesian3.lerp(midXYZ, this.points[0], ratioD, new this.cesium.Cartesian3()));
      const pnt2 = this.cartesianToLnglat(this.cesium.Cartesian3.lerp(midXYZ, this.points[1], ratioD, new this.cesium.Cartesian3()));
      const pnt3 = this.cartesianToLnglat(this.cesium.Cartesian3.lerp(midXYZ, this.points[2], ratioD, new this.cesium.Cartesian3()));

      const coords = [...pnt1, ...pnt2, ...pnt3];
      const cartesianPoints = this.cesium.Cartesian3.fromDegreesArray(coords);
      return cartesianPoints;
    }
    else {
      return this.createTriangle(positions);
    }
  }

  createTriangle(positions: Cartesian3[]) {
    const [p1, p2, p3] = positions.map(this.cartesianToLnglat);
    const coords = [...p1, ...p2, ...p3];
    const cartesianPoints = this.cesium.Cartesian3.fromDegreesArray(coords);
    return cartesianPoints;
  }

  getPoints() {
    return this.points;
  }
}
