

/* ********** GENERAL SCRIPTING **********************

		This templates shows what you can do in this is module script
		All the code outside functions will be executed each time this script is loaded, meaning at file load, when hitting the "reload" button or when saving this file
*/

var dmxInput = script.addTargetParameter("DMX Universe","DMX universe"); 			//This will add a target parameter (to reference another parameter)
dmxInput.setAttribute ("root", local.values);
dmxInput.setAttribute ("targetType", "container");
dmxInput.setAttribute ("searchLevel",1);

var firstDmxAdress = script.addIntParameter("DMX Address", "Address", 1, 1, 512);

// You can add custom parameters to use in your script here, they will be replaced each time this script is saved
//var myFloatParam = script.addFloatParameter("My Float Param","Description of my float param",.1,0,1); 		//This will add a float number parameter (slider), default value of 0.1, with a range between 0 and 1

//Here are all the type of parameters you can create
/*
var myTrigger = script.addTrigger("My Trigger", "Trigger description"); 									//This will add a trigger (button)
var myBoolParam = script.addBoolParameter("My Bool Param","Description of my bool param",false); 			//This will add a boolean parameter (toggle), defaut unchecked
var myFloatParam = script.addFloatParameter("My Float Param","Description of my float param",.1,0,1); 		//This will add a float number parameter (slider), default value of 0.1, with a range between 0 and 1
var myIntParam = script.addIntParameter("My Int Param","Description of my int param",2,0,10); 				//This will add an integer number parameter (stepper), default value of 2, with a range between 0 and 10
var myStringParam = script.addStringParameter("My String Param","Description of my string param", "cool");	//This will add a string parameter (text field), default value is "cool"
var myColorParam = script.addColorParameter("My Color Param","Description of my color param",0xff0000ff); 	//This will add a color parameter (color picker), default value of opaque blue (ARGB)
var myP2DParam = script.addPoint2DParameter("My P2D Param","Description of my p2d param"); 					//This will add a point 2d parameter
var myP3DParam = script.addPoint3DParameter("My P3D Param","Description of my p3d param"); 					//This will add a point 3d parameter
var myTargetParam = script.addTargetParameter("My Target Param","Description of my target param"); 			//This will add a target parameter (to reference another parameter)
var myEnumParam = script.addEnumParameter("My Enum Param","Description of my enum param",					//This will add a enum parameter (dropdown with options)
											"Option 1", 1,													//Each pair of values after the first 2 arguments define an option and its linked data
											"Option 2", 5,												    //First argument of an option is the label (string)
											"Option 3", "banana"											//Second argument is the value, it can be whatever you want
											); 	

var myFileParam = script.addFileParameter("My File Param", "Description of my file param");					//Adds a file parameter to browse for a file. Can have a third argument "directoryMode" 										
*/


//you can also declare custom internal variable
//var myValue = 5;

/*
 The init() function will allow you to init everything you want after the script has been checked and loaded
 WARNING it also means that if you change values of your parameters by hand and set their values inside the init() function, they will be reset to this value each time the script is reloaded !
*/
function init()
{
	//myFloatParam.set(5); //The .set() function set the parameter to this value.
	//myColorParam.set([1,.5,1,1]);	//for a color parameter, you need to pass an array with 3 (RGB) or 4 (RGBA) values.
	//myP2DParam.set([1.5,-5]); // for a Point2D parameter, you need to pass 2 values (XY)
	//myP3DParam.set([1.5,2,-3]); // for a Point3D parameter, you need to pass 3 values (XYZ)
}

/*
 This function will be called each time a parameter of your script has changed
*/

function logObj(obj) {
	var propNames = util.getObjectProperties(obj, true, true);
	for (var i = 0; i< propNames.length; i++) {
		script.log(propNames[i]+" - "+obj[propNames[i]]);
	}
	var methods= util.getObjectMethods(obj);
	for (var i = 0; i< methods.length; i++) {
		script.log(methods[i]+"()");
	}
}

function scriptParameterChanged(param)
{

}


/* ********** MODULE SPECIFIC SCRIPTING **********************

	The "local" variable refers to the object containing the scripts. In this case, the local variable refers to the module.
	It means that you can access any control inside  this module by accessing it through its address.
	For instance, if the module has a float value named "Density", you can access it via local.values.density
	Then you can retrieve its value using local.values.density.get() and change its value using local.values.density.set()
*/

/*
 This function will be called each time a parameter of this module has changed, meaning a parameter or trigger inside the "Parameters" panel of this module
 This function only exists because the script is in a module
*/
function moduleParameterChanged(param)
{
	if(param.isParameter())
	{
		script.log("Module parameter changed : "+param.name+" > "+param.get());
	}else 
	{
		script.log("Module parameter triggered : "+param.name);	
	}
}

/*
 This function will be called each time a value of this module has changed, meaning a parameter or trigger inside the "Values" panel of this module
 This function only exists because the script is in a module
*/
function moduleValueChanged(value)
{
	if(value.isParameter())
	{
		if (value.name.substring(0,7) == "channel") {
			var dataUniverse = value.getParent().getControlAddress();
			var inUniverse = dmxInput.getTarget();
			if (inUniverse == null) {
				var children = local.values.universes.getContainers();
				if (children.length > 0) {
					var inUniverse = children[0];
				}
			}
			if(inUniverse.getControlAddress() == dataUniverse) {
				var index = parseInt(value.name.substring(7,value.name.length));
				index -= firstDmxAdress.get();
				script.log(index);
				var sequences = root.sequences.getItems();
				if (index >= 0 && index < sequences.length) {
					var seq = sequences[index];
					var v = value.get();
					var vol = 0;
					if (v == 0) {
						seq.stop.trigger();
					}
					else if (v == 1) {
						seq.pause.trigger();
					} else {
						if (!seq.isPlaying.get()) {
							seq.play.trigger();
						}
						vol = (v-2)/253;
					}
					var layers = seq.layers.getItems();
					for (var iLayer = 0; iLayer < layers.length; iLayer++) {
						if (layers[iLayer]["volume"]) {
							layers[iLayer].volume.set(vol);
						}
					}

				}
			}


		}
		//script.log("Module value changed : "+value.name+" > "+value.get());	
	} 
	else 
	{
		script.log("Module value triggered : "+value.name);	
	}
}

