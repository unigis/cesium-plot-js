import Base from '../base';
import * as Utils from '../utils';
// @ts-ignore
import { Cartesian3 } from 'cesium';
import { PolygonStyle } from '../interface';
// 半月面
export default class gatheringPlace extends Base {
  points: Cartesian3[] = [];
  freehand: boolean;
  minPointsForShape: number;
  HALF_PI: number;
  FITTING_COUNT: number;
  growUp:boolean;

  constructor(cesium: any, viewer: any, style?: PolygonStyle) {
    super(cesium, viewer, style);
    this.cesium = cesium;
    this.freehand = true;
    this.HALF_PI = Math.PI / 2;
    this.FITTING_COUNT = 100;
    this.setState('drawing');
    this.minPointsForShape = 3;
    this.growUp = true;
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
    } else if (this.points.length === 2) {
    } else if (this.points.length > 2) {
      this.finishDrawing();
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.points, cartesian];
    const geometryPoints = this.createGatheringPlace(tempPoints);
    this.setGeometryPoints(geometryPoints);
    this.drawPolygon();
  }

  /**
   * In edit mode, drag key points to update corresponding key point data.
   */
  updateDraggingPoint(cartesian: Cartesian3, index: number) {
    this.points[index] = cartesian;
    const geometryPoints = this.createGatheringPlace(this.points);
    this.setGeometryPoints(geometryPoints);
    this.drawPolygon();
  }

  createGraphic(positions: Cartesian3[]) {
    const lnglatPoints = positions.map((pnt) => {
      return this.cartesianToLnglat(pnt);
    });
    let lnglats = [];
    if(this.growUp){
      const endPoint = this.cartesianToLnglat(this.points[2]);
      const mid = Utils.Mid(lnglatPoints[0], lnglatPoints[1]);
      // 距离比例
      const ratioD=Utils.MathDistance(lnglatPoints[2], mid)/Utils.MathDistance(endPoint, mid);
      // 计算中心点
      const midXYZ =this.getPointsCenter();
      // 计算三个控制点坐标
      const pnt1  = this.cartesianToLnglat(this.cesium.Cartesian3.lerp(midXYZ, this.points[0], ratioD, new this.cesium.Cartesian3()));
      const pnt2  = this.cartesianToLnglat(this.cesium.Cartesian3.lerp(midXYZ, this.points[1], ratioD, new this.cesium.Cartesian3()));
      const pnt3  = this.cartesianToLnglat(this.cesium.Cartesian3.lerp(midXYZ, this.points[2], ratioD, new this.cesium.Cartesian3()));
         // 就算结果
     lnglats = [pnt1,pnt2,pnt3];
    }else{
      lnglats = lnglatPoints;
    }

    const mid1 = Utils.Mid(lnglats[0], lnglats[2]);

    lnglats.push(mid1, lnglats[0], lnglats[1]);
    let normals = [];
    for (let i = 0; i < lnglats.length - 2; i++) {
      let pnt1 = lnglats[i];
      let pnt2 = lnglats[i + 1];
      let pnt3 = lnglats[i + 2];
      let normalPoints = Utils.getBisectorNormals(0.4, pnt1, pnt2, pnt3);
      normals = normals.concat(normalPoints);
    }

    let count = normals.length;
    normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
    let pList = [];

    for (let i = 0; i < lnglats.length - 2; i++) {
      let pnt1 = lnglats[i];
      let pnt2 = lnglats[i + 1];
      pList.push(pnt1)
      for (let t = 0; t <= this.FITTING_COUNT; t++) {
        let pnt = Utils.getCubicValue(
          t / this.FITTING_COUNT,
          pnt1,
          normals[i * 2],
          normals[i * 2 + 1],
          pnt2
        )
        pList.push(pnt)
      }
      pList.push(pnt2)
    }
    const temp = [].concat(...pList);
    const cartesianPoints = this.cesium.Cartesian3.fromDegreesArray(temp);
    return cartesianPoints;
  }

  createGraphic_growUp(positions: Cartesian3[]) {
    // 逐个点复原绘图过程
    // 设置  minPointsForShape = 2 ；
    const lnglatPoints = positions.map((pnt) => {
      return this.cartesianToLnglat(pnt);
    });

    if (lnglatPoints.length === 2) {
      const mid = Utils.Mid(lnglatPoints[0], lnglatPoints[1]);
      const d = Utils.MathDistance(lnglatPoints[0], mid) / 1;
      const pnt = Utils.getThirdPoint(lnglatPoints[0], mid, Math.PI / 2, d, true);
      lnglatPoints.push(pnt);
    }

    const mid = Utils.Mid(lnglatPoints[0], lnglatPoints[2]);
    lnglatPoints.push(mid, lnglatPoints[0], lnglatPoints[1]);
    let normals = [];
    for (let i = 0; i < lnglatPoints.length - 2; i++) {
      let pnt1 = lnglatPoints[i];
      let pnt2 = lnglatPoints[i + 1];
      let pnt3 = lnglatPoints[i + 2];
      let normalPoints = Utils.getBisectorNormals(0.4, pnt1, pnt2, pnt3);
      normals = normals.concat(normalPoints);
    }

    let count = normals.length;
    normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
    let pList = [];

    for (let i = 0; i < lnglatPoints.length - 2; i++) {
      let pnt1 = lnglatPoints[i];
      let pnt2 = lnglatPoints[i + 1];
      pList.push(pnt1)
      for (let t = 0; t <= this.FITTING_COUNT; t++) {
        let pnt = Utils.getCubicValue(
          t / this.FITTING_COUNT,
          pnt1,
          normals[i * 2],
          normals[i * 2 + 1],
          pnt2
        )
        pList.push(pnt)
      }
      pList.push(pnt2)
    }

    const temp = [].concat(...pList);
    const cartesianPoints = this.cesium.Cartesian3.fromDegreesArray(temp);
    return cartesianPoints;
  }

  createGatheringPlace(positions: Cartesian3[]) {
    const lnglatPoints = positions.map((pnt) => {
      return this.cartesianToLnglat(pnt);
    });
    if (lnglatPoints.length === 2) {
      const mid = Utils.Mid(lnglatPoints[0], lnglatPoints[1]);
      const d = Utils.MathDistance(lnglatPoints[0], mid) / 0.9;
      const pnt = Utils.getThirdPoint(lnglatPoints[0], mid, Math.PI / 2, d, false);
      lnglatPoints.push(pnt);
    }

    const mid = Utils.Mid(lnglatPoints[0], lnglatPoints[2]);
    lnglatPoints.push(mid, lnglatPoints[0], lnglatPoints[1]);
    let normals = [];
    for (let i = 0; i < lnglatPoints.length - 2; i++) {
      let pnt1 = lnglatPoints[i];
      let pnt2 = lnglatPoints[i + 1];
      let pnt3 = lnglatPoints[i + 2];
      let normalPoints = Utils.getBisectorNormals(0.4, pnt1, pnt2, pnt3);
      normals = normals.concat(normalPoints);
    }

    let count = normals.length;
    normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
    let pList = [];

    for (let i = 0; i < lnglatPoints.length - 2; i++) {
      let pnt1 = lnglatPoints[i];
      let pnt2 = lnglatPoints[i + 1];
      pList.push(pnt1)
      for (let t = 0; t <= this.FITTING_COUNT; t++) {
        let pnt = Utils.getCubicValue(
          t / this.FITTING_COUNT,
          pnt1,
          normals[i * 2],
          normals[i * 2 + 1],
          pnt2
        )
        pList.push(pnt)
      }
      pList.push(pnt2)
    }
    const temp = [].concat(...pList);
    const cartesianPoints = this.cesium.Cartesian3.fromDegreesArray(temp);
    return cartesianPoints;
  }

  getPoints() {
    return this.points;
  }
}
