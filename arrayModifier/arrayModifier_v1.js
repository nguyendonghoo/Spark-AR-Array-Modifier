//This script is relate to Array Modifier in Blender
//Uses for Spark AR Studio
//Copyright by Nguyen Dong Ho from fomalia.com
//Reference https://docs.blender.org/manual/en/2.93/modeling/modifiers/generate/array.html

const Scene = require('Scene');
const Diagnostics = require('Diagnostics');

const sceneRoot = Scene.root;
//Objects clooner target holder
//const holder //String = name objects

  Promise.all([
    sceneRoot.findFirst('planeTracker0'),
    sceneRoot.findByPath('planeTracker0/Octahedron*'),
  ])

  .then(function(objects) {
    const planeTracker = objects[0];
    const objectsArray = objects[1];

    const n = objectsArray.length;
    const PI = Math.PI;

    Diagnostics.log("==============================");
    Diagnostics.log("Number of objects = " + n);

    var positionType = "ellipse";
    //=====================================
    //Function OBJECTS ARRAY MODIFIER
    //Fixed Count
    //Relative Offset
    //Factor X Y Z
    //=====================================

    //Position X Y Z Modifier
    var xValue = 0.1; //Input X
    var yValue = 0.1; //Input Y
    var zValue = 0.1; //Input Z
    switch(positionType) {
      case "linear":
        const xArrayLinear = new Array(objectsArray.length).fill(Number).map((_, i) => (xValue*i));
        const yArrayLinear = new Array(objectsArray.length).fill(Number).map((_, i) => (yValue*i));
        const zArrayLinear = new Array(objectsArray.length).fill(Number).map((_, i) => (zValue*i));
        
        for (let i = 0; i<n; i++) {
          objectsArray[i].transform.x = xArrayLinear[i];
          objectsArray[i].transform.y = yArrayLinear[i];
          objectsArray[i].transform.z = zArrayLinear[i];
        };
        break;
      case "ellipse":
        const rotateDirection = "XY"; //Value can be XY YZ | Default = XZ
        //Ellipse quation x^2/Ra^2 +y^2/Rb^2 = 1
        //Ellipse = Circle => Ra = Rb = Radius ; Ra^2 = Rb^2 + Rc^2 => Rc = 0
        //Ellipse Document: https://en.wikipedia.org/wiki/Ellipse
        const Ra = 1; //INPUT Ellipse Width
        const Rb = 1; //INPUT Ellipse Height

        //Begin Angle and End Angle 
        const beginAngle = radian(0); //INPUT Begin Angle
        const endAngle = radian(360); //INPUT End Angle
        switch (rotateDirection) {
          case "XY" :
            const xArrayCircleXY = new Array(n).fill(Number).map((_, i) => (Rb*Math.cos(beginAngle + i*(endAngle - beginAngle)/n)));
            const yArrayCircleXY = new Array(n).fill(Number).map((_, i) => (Ra*Math.sin(beginAngle + i*(endAngle - beginAngle)/n)));
        
            for (let i = 0; i<n; i++) {
              objectsArray[i].transform.x = xArrayCircleXY[i];
              objectsArray[i].transform.y = yArrayCircleXY[i];
              objectsArray[i].transform.z = zValue;
            }; 
            break;
          case "YZ" :
            const yArrayCircleYZ = new Array(n).fill(Number).map((_, i) => (Rb*Math.cos(beginAngle + i*(endAngle - beginAngle)/n)));
            const zArrayCircleYZ = new Array(n).fill(Number).map((_, i) => (Ra*Math.sin(beginAngle + i*(endAngle - beginAngle)/n)));     
        
            for (let i = 0; i<n; i++) {
              objectsArray[i].transform.x = xValue;
              objectsArray[i].transform.y = yArrayCircleYZ[i];
              objectsArray[i].transform.z = zArrayCircleYZ[i];
            }; 
            break;
          default :
            const xArrayCircleXZ = new Array(n).fill(Number).map((_, i) => (Rb*Math.cos(beginAngle + i*(endAngle - beginAngle)/n)));
            const zArrayCircleXZ = new Array(n).fill(Number).map((_, i) => (Ra*Math.sin(beginAngle + i*(endAngle - beginAngle)/n)));    
        
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
    
    //Scale XYZ And Rotation XYZ Modifier
    const scaleXValue = 0.2; //Input X Scale
    const scaleYValue = 0.2; //Input Y Scale
    const scaleZValue = 0.2; //Input Z Scale   
    const beginScale = 1; //INPUT begin scale
    const scaleXArray = new Array(n).fill(Number).map((_, i) => (beginScale + scaleXValue*i));
    const scaleYArray = new Array(n).fill(Number).map((_, i) => (beginScale + scaleYValue*i));
    const scaleZArray = new Array(n).fill(Number).map((_, i) => (beginScale + scaleZValue*i));

    const rotationXValue = 0; //Input X Degrees
    const rotationYValue = 0; //Input Y Degrees
    const rotationZValue = 0; //Input Z Degrees
    function radian(Degrees) {
      return PI*Degrees/180;
    };
    const rotationXArray = new Array(n).fill(Number).map((_, i) => (radian(rotationXValue)*i));
    const rotationYArray = new Array(n).fill(Number).map((_, i) => (radian(rotationYValue)*i));
    const rotationZArray = new Array(n).fill(Number).map((_, i) => (radian(rotationZValue)*i));

    for (let i = 0; i<n; i++) {
      objectsArray[i].transform.scaleX = scaleXArray[i];
      objectsArray[i].transform.scaleY = scaleYArray[i];
      objectsArray[i].transform.scaleZ = scaleZArray[i];
      objectsArray[i].transform.rotationX = rotationXArray[i];
      objectsArray[i].transform.rotationY = rotationYArray[i];
      objectsArray[i].transform.rotationZ = rotationZArray[i];
    };
   
    
    
  });
