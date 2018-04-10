// just a Boolean variable to say if we picked the tile
var picked=false;
// identifying the canvas id
var canvas = document.getElementById("fpCanvas");
// creation of the engine itself
var engine = new BABYLON.Engine(canvas,true);
// attaching a scene to the engine. This is where our game will take place
var scene = new BABYLON.Scene(engine);
// adding a little fog to the scene, to give some kind of "depth" to the scene
scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
// the density is very high, so a low value is recommended
scene.fogDensity = 0.05;
// creation of a camera, the type is "AcrRotate".
// this mean the camera is bound along two arcs, one running from north to south, the other from east to west
// the first argument is the came of the camera instance
// the second argument is the angle along the north-south arc, in radians (3 * Math.PI / 2)
// the 3rd argumentis the angle along the east-west arc, in radians (3*Math.PI/4)
// the 4th argument is the radius of such arcs (20)
// the 5th argument is the camera target (BABYLON.Vector3.Zero()) in this case the origin
// finally, the scene where to attach the camera ("scene")
var camera = new BABYLON.ArcRotateCamera("camera",3 * Math.PI / 2, 11*Math.PI/16, 20, BABYLON.Vector3.Zero(), scene);
// adding touch controls to camera, that's where hand.js come into play
camera.attachControl(canvas, false);
// we need a directional light in order to cast a shadow
var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(5,0,20), scene);
light.position = new BABYLON.Vector3(1,1,-10);

// this is the table material. We will map an image called "wood.jpg" on it
var tableMaterial = new BABYLON.StandardMaterial("tableMaterial", scene);
tableMaterial.diffuseTexture = new BABYLON.Texture("wood.jpg", scene);

// card material will be made with 2 different materials.
// The first material is "cardMaterial", a yellow color
var cardMaterial = new BABYLON.StandardMaterial("cardMaterial", scene);
cardMaterial.diffuseColor = new BABYLON.Color3(1,1,0);
// the second material is "cardBackMaterial", a purple color
var cardBackMaterial = new BABYLON.StandardMaterial("cardBackMaterial", scene);
cardBackMaterial.diffuseColor = new BABYLON.Color3(1,0,1);

// with these two colors in mind, let's built a multi material
var cardMultiMat = new BABYLON.MultiMaterial("cardMulti", scene);
// here is how we push the materials into a multimaterial
cardMultiMat.subMaterials.push(cardMaterial);
cardMultiMat.subMaterials.push(cardBackMaterial);
// this is the content of our multi material - 0: CardMaterial, 1: CardBackMaterial

// THE TABLE
var table = BABYLON.Mesh.CreateBox("table", 10, scene);
table.scaling.z = 0.025;
table.scaling.x = 2;
table.material=tableMaterial
// we must specify that the table is receving shadows
table.receiveShadows = true;

// THE CARD
var card = BABYLON.Mesh.CreateBox("card", 2, scene);
card.scaling.z = 0.125;
card.position = new BABYLON.Vector3(0,0,-0.25);
// defining two different meshes, one for the bottom face and one for the rest of the card
card.subMeshes=[];
// arguments of Submesh are:
// 1: the index of the material to use
// 2: the index of the first vertex
// 3: the number of verices used
// 4: index of the first indice to use
// 5: the number of indices
// 6: the main mesh
card.subMeshes.push(new BABYLON.SubMesh(0, 4, 20, 6, 30, card));
card.subMeshes.push(new BABYLON.SubMesh(1, 0, 4, 0, 6, card));

// finally assigning the multi material to the card
card.material=cardMultiMat

// attaching the light to shadow generator
var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
// here is how we say the card should cast shadows
shadowGenerator.getShadowMap().renderList.push(card);

engine.runRenderLoop(function () {
     scene.render();
});

// a simple click listener
window.addEventListener("click", function (evt) {
	// with "scene.pick" we can obtain information about the stuff we picked/clicked
	var pickResult = scene.pick(evt.clientX, evt.clientY);
	// if we haven't already picked anything and we are picking a mesh and that mesh is called "card"...
	if(!picked && pickResult.pickedMesh!=null && pickResult.pickedMesh.name=="card"){
		// set "picked" to true as we won't be able to pick it again
		picked=true;
		// let's start the animation
		var moveAnimation = new BABYLON.Animation(
			"moveAnimation", // name I gave to the animation
			"position.z", // property I am going to change
			30, // animation speed
			BABYLON.Animation.ANIMATIONTYPE_FLOAT, // animation type
               BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT // animation loop mode
			// play with BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE,
			// BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
			// BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
		);

        	var rotateAnimation = new BABYLON.Animation(
			"rotateAnimation",
			"rotation.y", // this time I rotate the tile around y axis
			30,
			BABYLON.Animation.ANIMATIONTYPE_FLOAT,
               BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
		);

		// now let's add keyframes to our animations
		var moveKeys = [
			{
				frame: 0,
				value: -0.25
			},
			{
				frame: 20,
				value: -2
			}
		];

    		var rotateKeys = [
			{
				frame: 0,
        			value: 0
			},
			{
				frame: 20,
        			value: 0
			},
			{
				frame: 40,
        			value: Math.PI
			}
		]

    		// adding keyframes to animation
    		moveAnimation.setKeys(moveKeys);
    		rotateAnimation.setKeys(rotateKeys);

    		// adding animations to the card
    		card.animations.push(moveAnimation);
    		card.animations.push(rotateAnimation);

    		// launching animation
		scene.beginAnimation(card, 0, 40, true);
    }
});
