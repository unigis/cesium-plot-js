import CesiumPlot from '../src';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
let raster = new Cesium.ArcGisMapServerImageryProvider({
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
});

const viewer = new Cesium.Viewer('cesiumContainer', {
  animation: false,
  shouldAnimate: true,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  fullscreenButton: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  baseLayerPicker: false,
  imageryProvider: raster,
  contextOptions: {
    requestWebgl2: true,
  },
});

viewer.scene.postProcessStages.fxaa.enabled = true;
viewer.scene.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(107.857, 35.594498, 10000),
});

let geometry: any;
const dragStartHandler = () => {
  console.error('start');
};
const drawUpdateHandler = (cartesian: Cesium.Cartesian3) => {
  console.error('update', cartesian);
};

const drawEndHandler = (geometryPoints: any) => {
  console.error('drawEnd', geometryPoints);
};

const editStartHandler = () => {
  console.error('editStart');
};

const editEndHandler = (geometryPoints: any) => {
  console.error('editEnd', geometryPoints);
};

const buttonGroup = document.getElementById('button-group') as HTMLElement;
buttonGroup.onclick = (evt) => {
  const targetElement = evt.target as HTMLElement;
  switch (targetElement.id) {
    case 'drawCircle':
      geometry = new CesiumPlot.Circle(Cesium, viewer);
      break;
    case 'drawPolygon':
      geometry = new CesiumPlot.Polygon(Cesium, viewer);
      break;
    case 'drawReactangle':
      geometry = new CesiumPlot.Reactangle(Cesium, viewer);
      break;
    case 'drawTriangle':
      geometry = new CesiumPlot.Triangle(Cesium, viewer);
      break;
    case 'drawFineArrow':
      geometry = new CesiumPlot.FineArrow(Cesium, viewer, {
        material: Cesium.Color.fromCssColorString('rgba(59, 178, 208, 0.5)'),
        outlineMaterial: Cesium.Color.fromCssColorString('rgba(59, 178, 208, 1)'),
        outlineWidth: 3,
      });
      break;
    case 'drawAttackArrow':
      geometry = new CesiumPlot.AttackArrow(Cesium, viewer, {
        outlineMaterial: Cesium.Color.RED,
      });
      break;
    case 'drawSwallowtailAttackArrow':
      geometry = new CesiumPlot.SwallowtailAttackArrow(Cesium, viewer, {
        outlineMaterial: Cesium.Color.BLUE,
      });
      break;
    case 'drawSquadCombat':
      geometry = new CesiumPlot.SquadCombat(Cesium, viewer, {
        outlineMaterial: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.RED,
          dashLength: 16.0,
        }),
      });
      break;
    case 'drawSwallowtailSquadCombat':
      geometry = new CesiumPlot.SwallowtailSquadCombat(Cesium, viewer);
      break;
    case 'drawStraightArrow':
      geometry = new CesiumPlot.StraightArrow(Cesium, viewer, {
        material: Cesium.Color.RED,
      });
      break;
    case 'drawAssaultDirection':
      geometry = new CesiumPlot.AssaultDirection(Cesium, viewer);
      break;
    case 'drawCurvedArrow':
      geometry = new CesiumPlot.CurvedArrow(Cesium, viewer, {
        material: Cesium.Color.BLUE,
      });
      break;
    case 'drawDoubleArrow':
      geometry = new CesiumPlot.DoubleArrow(Cesium, viewer, {
        outlineMaterial: Cesium.Color.GREEN,
      });
      break;
    case 'drawFreehandLine':
      geometry = new CesiumPlot.FreehandLine(Cesium, viewer);
      break;
    case 'drawCurve':
      geometry = new CesiumPlot.Curve(Cesium, viewer);
      break;
    case 'drawEllipse':
      geometry = new CesiumPlot.Ellipse(Cesium, viewer);
      break;
    case 'drawLune':
      geometry = new CesiumPlot.Lune(Cesium, viewer);
      break;
    case 'drawFreehandPolygon':
      geometry = new CesiumPlot.FreehandPolygon(Cesium, viewer, {
        material: Cesium.Color.GREEN,
        outlineMaterial: Cesium.Color.fromCssColorString('rgba(59, 178, 208, 1)'),
        outlineWidth: 2,
      });
      break;
    case 'hide':
      geometry &&
        geometry.hide({
          duration: 1000,
          delay: 0,
        });
      break;
    case 'show':
      geometry && geometry.show();
      break;
    case 'remove':
      geometry && geometry.remove();
      geometry = null;
      break;
    case 'addEvent':
      if (geometry) {
        geometry.on('drawStart', dragStartHandler);
        geometry.on('drawUpdate', drawUpdateHandler);
        geometry.on('drawEnd', drawEndHandler);
        geometry.on('editStart', editStartHandler);
        geometry.on('editEnd', editEndHandler);
      }
      break;
    case 'removeEvent':
      if (geometry) {
        geometry.off('drawStart', dragStartHandler);
        geometry.off('drawUpdate', drawUpdateHandler);
        geometry.off('drawEnd', drawEndHandler);
        geometry.off('editStart', editStartHandler);
        geometry.off('editEnd', editEndHandler);
      }
      break;

    case 'startGrowthAnimation':
      if (geometry) {
        geometry.startGrowthAnimation();
      }
      break;
    default:
      break;
  }
};
