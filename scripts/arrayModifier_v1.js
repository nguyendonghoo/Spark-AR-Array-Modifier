//This script is relate to Array Modifier in Blender
//Uses for Spark AR Studio
//Copyright by Nguyen Dong Ho from fomalia.com
//Reference https://docs.blender.org/manual/en/2.93/modeling/modifiers/generate/array.html
//Reactive Module Added

const Patches = require('Patches');
const Scene = require('Scene');
const Diagnostics = require('Diagnostics');
const Reactive = require('Reactive');

const sceneRoot = Scene.root;

(async function() {
  const objects = await Promise.all([
    sceneRoot.findFirst('planeTracker0'),
    sceneRoot.findByPath('planeTracker0/objectA/Octahedron*'),
  ]); 

  const planeTracker = objects[0];
  const objectsArray = objects[1];
  const n = objectsArray.length;
  const PI = Math.PI;;
  Diagnostics.log("Number of objects = " + n);

  function radian(Degrees) {
    return Reactive.mul(Degrees, PI/180);
  };

  const myBoolean = true;
  // Send the boolean value to the Patch Editor under the name 'myBoolean'
  await Patches.inputs.setBoolean('myBoolean', myBoolean);
  // Get the 'positionType' string value from the Patch Editor
  const positionType = (await Patches.outputs.getString('positionType')).pinLastValue();

  //=====================================
  //Function OBJECTS ARRAY MODIFIER
  //Fixed Count
  //Relative Offset
  //Factor X Y Z
  //=====================================

  //Position X Y Z Modifier
  // Get the 'positionType' string value from the Patch Editor
  const positionSteps = (await Patches.outputs.getVector('positionSteps'));

  var xValue = positionSteps.x; //Input X
  var yValue = positionSteps.y; //Input Y
  var zValue = positionSteps.z; //Input Z
  switch(positionType) {
    case "linear":
      const xArrayLinear = new Array(objectsArray.length).fill(Number).map((_, i) => (Reactive.mul(xValue,i)));
      const yArrayLinear = new Array(objectsArray.length).fill(Number).map((_, i) => (Reactive.mul(yValue, i)));
      const zArrayLinear = new Array(objectsArray.length).fill(Number).map((_, i) => (Reactive.mul(zValue, i)));
      
      for (let i = 0; i<n; i++) {
        objectsArray[i].transform.x = xArrayLinear[i];
        objectsArray[i].transform.y = yArrayLinear[i];
        objectsArray[i].transform.z = zArrayLinear[i];
      };
      break;
    case "ellipse": 
      // Get the 'rotateDirection' string value from the Patch Editor
      const rotateDirection = (await Patches.outputs.getString('rotateDirection')).pinLastValue(); //Value can be XY YZ | Default = XZ

      //Ellipse quation x^2/Ra^2 +y^2/Rb^2 = 1
      //Ellipse = Circle => Ra = Rb = Radius ; Ra^2 = Rb^2 + Rc^2 => Rc = 0
      //Ellipse Document: https://en.wikipedia.org/wiki/Ellipse
      const ellipseRadius = (await Patches.outputs.getPoint2D('ellipseRadius'))
      var Ra = ellipseRadius.x; //INPUT Ellipse Width
      var Rb = ellipseRadius.y; //INPUT Ellipse Height

      //Begin Angle and End Angle 
      const ellipseAngle = (await Patches.outputs.getPoint2D('ellipseAngle'))
      var beginAngle = radian(ellipseAngle.x); //INPUT Begin Angle
      var endAngle = radian(ellipseAngle.y); //INPUT End Angle
      switch (rotateDirection) {
        case "XY" :
          const xArrayCircleXY = new Array(n).fill(Number).map((_, i) => (Reactive.mul(Rb, Reactive.cos(Reactive.add(beginAngle, Reactive.mul((Reactive.sub(endAngle, beginAngle)), i/n)))))); //(Rb*Math.cos(beginAngle + i*(endAngle - beginAngle)/n))
          const yArrayCircleXY = new Array(n).fill(Number).map((_, i) => (Reactive.mul(Ra, Reactive.sin(Reactive.add(beginAngle, Reactive.mul((Reactive.sub(endAngle, beginAngle)), i/n)))))); //(Rb*Math.sin(beginAngle + i*(endAngle - beginAngle)/n))
      
          for (let i = 0; i<n; i++) {
            objectsArray[i].transform.x = xArrayCircleXY[i];
            objectsArray[i].transform.y = yArrayCircleXY[i];
            objectsArray[i].transform.z = zValue;
          }; 
          break;
        case "YZ" :
          const yArrayCircleYZ = new Array(n).fill(Number).map((_, i) => (Reactive.mul(Rb, Reactive.cos(Reactive.add(beginAngle, Reactive.mul((Reactive.sub(endAngle, beginAngle)), i/n))))));
          const zArrayCircleYZ = new Array(n).fill(Number).map((_, i) => (Reactive.mul(Ra, Reactive.sin(Reactive.add(beginAngle, Reactive.mul((Reactive.sub(endAngle, beginAngle)), i/n))))));     
      
          for (let i = 0; i<n; i++) {
            objectsArray[i].transform.x = xValue;
            objectsArray[i].transform.y = yArrayCircleYZ[i];
            objectsArray[i].transform.z = zArrayCircleYZ[i];
          }; 
          break;
        default :
          const xArrayCircleXZ = new Array(n).fill(Number).map((_, i) => (Reactive.mul(Rb, Reactive.cos(Reactive.add(beginAngle, Reactive.mul((Reactive.sub(endAngle, beginAngle)), i/n))))));
          const zArrayCircleXZ = new Array(n).fill(Number).map((_, i) => (Reactive.mul(Ra, Reactive.sin(Reactive.add(beginAngle, Reactive.mul((Reactive.sub(endAngle, beginAngle)), i/n))))));    
      
          for (let i = 0; i<n; i++) {
            objectsArray[i].transform.x = xArrayCircleXZ[i];
            objectsArray[i].transform.y = yValue;
            objectsArray[i].transform.z = zArrayCircleXZ[i];
          }; 
          break;
      };     
      break;
    default:

      break;
  };
  
  //Scale XYZ Modifier
  const scaleStep = (await Patches.outputs.getVector('scaleSteps'))
  const scaleXValue = scaleStep.x; //Input X Scale
  const scaleYValue = scaleStep.y; //Input Y Scale
  const scaleZValue = scaleStep.y; //Input Z Scale   
  const scaleBeginValue = (await Patches.outputs.getVector('scaleBeginValue'))
  const scaleBeginX = scaleBeginValue.x; //INPUT begin scale X
  const scaleBeginY = scaleBeginValue.y; //INPUT begin scale Y
  const scaleBeginZ = scaleBeginValue.z; //INPUT begin scale Z
  const scaleXArray = new Array(n).fill(Number).map((_, i) => (Reactive.add(scaleBeginX, Reactive.mul(scaleXValue, i)))); //(scaleBeginX + scaleXValue*i)
  const scaleYArray = new Array(n).fill(Number).map((_, i) => (Reactive.add(scaleBeginY, Reactive.mul(scaleYValue, i)))); //(scaleBeginY + scaleYValue*i)
  const scaleZArray = new Array(n).fill(Number).map((_, i) => (Reactive.add(scaleBeginZ, Reactive.mul(scaleZValue, i)))); //(scaleBeginZ + scaleZValue*i)

  //Rotation XYZ Modifier
  const rotationSteps = (await Patches.outputs.getVector('rotationSteps'))
  const rotationXValue = rotationSteps.x; //Input X Degrees
  const rotationYValue = rotationSteps.y; //Input Y Degrees
  const rotationZValue = rotationSteps.z; //Input Z Degrees

  const rotationXArray = new Array(n).fill(Number).map((_, i) => (Reactive.mul(radian(rotationXValue), i)));
  const rotationYArray = new Array(n).fill(Number).map((_, i) => (Reactive.mul(radian(rotationYValue), i)));
  const rotationZArray = new Array(n).fill(Number).map((_, i) => (Reactive.mul(radian(rotationZValue), i)));

  for (let i = 0; i<n; i++) {
    objectsArray[i].transform.scaleX = scaleXArray[i];
    objectsArray[i].transform.scaleY = scaleYArray[i];
    objectsArray[i].transform.scaleZ = scaleZArray[i];
    objectsArray[i].transform.rotationX = rotationXArray[i];
    objectsArray[i].transform.rotationY = rotationYArray[i];
    objectsArray[i].transform.rotationZ = rotationZArray[i];
  };
})();
 