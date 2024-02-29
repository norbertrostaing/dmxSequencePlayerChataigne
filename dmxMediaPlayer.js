

/* ********** GENERAL SCRIPTING **********************

		This templates shows what you can do in this is module script
		All the code outside functions will be executed each time this script is loaded, meaning at file load, when hitting the "reload" button or when saving this file
*/

var dmxInput = script.addTargetParameter("DMX Universe","DMX universe"); 			//This will add a target parameter (to reference another parameter)
dmxInput.setAttribute ("root", root.modules);
dmxInput.setAttribute ("targetType", "container");
dmxInput.setAttribute ("searchLevel",4);

var firstDmxAdress = script.addIntParameter("DMX Address", "Address", 1, 1, 512);

var execButton = script.addTrigger("Create state", "");
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

function initStateMultiplex() {
		var universe = dmxInput.getTarget();
		if (!universe.niceName) {
			return;
		}

		var startAddress = firstDmxAdress.get();

		var state = root.states.addItem();
		state.setName("DMX Player");
		var multiplex = state.processors.addItem("Multiplex");

		var seqs = root.sequences.getItems();
		var num = seqs.length;
		multiplex.count.set(num);

		var multiplexAdrList = multiplex.lists.addItem("Target");
		var multiplexSeqList = multiplex.lists.addItem("Target");
		var multiplexAudioList = multiplex.lists.addItem("Target");

		multiplexSeqList.setName("Sequences");
		multiplexAudioList.setName("Audio");

		for (var i = 0; i < num; i++) {
			multiplexSeqList["#"+(i+1)].setAttribute("targetType", "container");
			multiplexSeqList["#"+(i+1)].set(seqs[i].getControlAddress());
			multiplexAdrList["#"+(i+1)].set(universe["channel"+(i+startAddress)].getControlAddress());
			var layers = seqs[i].layers.getItems();
			var audioOk = false;
			for (var iLayer = 0; iLayer < layers.length && !audioOk; iLayer++) {
				if (layers[iLayer]["volume"]) {
					multiplexAudioList["#"+(i+1)].setAttribute("targetType", "container");
					multiplexAudioList["#"+(i+1)].set(layers[iLayer].getControlAddress());
				}
			}
		}

		var mapping = multiplex.processors.addItem("Mapping");
		var action = multiplex.processors.addItem("Action");
		mapping.setName("Volume");
		action.setName("Start / Stop");

		var inputVal = mapping.inputs.addItem("Input List");
		mapping.inputs.inputList.inputList.set(multiplexAdrList.getControlAddress());

		var remap = mapping.filters.addItem("Remap");
		remap.filterParams.inputMin_Max.set(0,255);

		var output = mapping.outputs.addItem("MappingOutput");
		var command = output.setCommand("sequences", "Audio", "Set Layer Volume");		

}

function initState() {
		var universe = dmxInput.getTarget();
		if (!universe.niceName) {
			return;
		}

		var startAddress = firstDmxAdress.get();

		var state = root.states.addItem();
		state.setName("DMX Player");

		var seqs = root.sequences.getItems();
		var num = seqs.length;

		for (var i = 0; i < num; i++) {

			var address = startAddress + i;
			var seqName = seqs[i].niceName;
			var mapping = state.processors.addItem("Mapping");
			mapping.setName("Volume "+address+" - "+seqName);

			mapping.inputs.addItem("Input Value");
			mapping.inputs.inputValue.inputValue.set(universe["channel"+address].getControlAddress());

			var remap = mapping.filters.addItem("Remap");
			remap.filterParams.useCustomInputRange.set(true);
			remap.filterParams.inputMin_Max.set(0,255);

			var mapOutput = mapping.outputs.addItem("MappingOutput");
			var mapCommand = mapOutput.setCommand("sequences", "Audio", "Set Layer Volume");		
			var layers = seqs[i].layers.getItems();
			var audioOk = false;
			for (var iLayer = 0; iLayer < layers.length && !audioOk; iLayer++) {
				if (layers[iLayer]["volume"]) {
					mapCommand.target.set(layers[iLayer].getControlAddress());
					audioOk	= true;
				}
			}
			
			var action = state.processors.addItem("Action");
			action.setName("Play "+address+" - "+seqName);
			action.conditions.addItem("From Input Value");
			action.conditions.fromInputValue.inputValue.set(universe["channel"+address].getControlAddress());
			action.conditions.fromInputValue.comparator.comparisonFunction.set(">");

			var consequenceTrue = action.consequencesTRUE.addItem("Consequence");
			consequenceTrue.setCommand("sequences", "Playback", "Play Sequence");
			consequenceTrue.command.target.set(seqs[i].getControlAddress());
			consequenceTrue.command.playFromStart.set(true);

			var consequenceFalse = action.consequencesFALSE.addItem("Consequence");
			consequenceFalse.setCommand("sequences", "Playback", "Stop Sequence");
			consequenceFalse.command.target.set(seqs[i].getControlAddress());
			//root.states.dmxPlayer.processors.play1.consequencesTRUE.consequence.command.target

/*			multiplexSeqList["#"+(i+1)].setAttribute("targetType", "container");
			multiplexSeqList["#"+(i+1)].set(seqs[i].getControlAddress());
			multiplexAdrList["#"+(i+1)].set();
			var layers = seqs[i].layers.getItems();
			var audioOk = false;
			for (var iLayer = 0; iLayer < layers.length && !audioOk; iLayer++) {
				if (layers[iLayer]["volume"]) {
					multiplexAudioList["#"+(i+1)].setAttribute("targetType", "container");
					multiplexAudioList["#"+(i+1)].set(layers[iLayer].getControlAddress());
				}
			}
*/		}


}

function scriptParameterChanged(param)
{

	if (param.is(execButton)) 
	{
		initState();
	}
/*	//You can use the script.log() function to show an information inside the logger panel. To be able to actuallt see it in the logger panel, you will have to turn on "Log" on this script.
	script.log("Parameter changed : "+param.name); //All parameters have "name" property
	if(param.is(myTrigger)) 
	{
		script.log("Trigger !"); //You can check if two variables are the reference to the same parameter or object with the method .is()
		//Here we can for example show a "Ok cancel" box. The result will be called in the messageBoxCallback function below
		//util.showOkCancelBox("myBoxId", "Super warning!", "This is a warning for you", "warning", "Got it","Naaah");
	}
	else if(param.is(myEnumParam))
	{
		script.log("Key = "+param.getKey()+", data = "+param.get()); //The enum parameter has a special function getKey() to get the key associated to the option. .get() will give you the data associated
	}
	else
	{
		script.log("Value is "+param.get()); //All parameters have a get() method that will return their value
	} */
}

/*
 This function, if you declare it, will launch a timer at 50hz, calling this method on each tick
*/
/*
function update(deltaTime)
{
	script.log("Update : "+util.getTime()+", delta = "+deltaTime); //deltaTime is the time between now and last update() call, util.getTime() will give you a timestamp relative to either the launch time of the software, or the start of the computer.
}
*/

/*
 This function, if you declare it, will be called when after a user has made a choice from a okCancel box or YesNoCancel box that you launched from this script 
*/
/*
function messageBoxCallback(id, result)
{
	script.log("Message box callback : "+id+" > "+result); //deltaTime is the time between now and last update() call, util.getTime() will give you a timestamp relative to either the launch time of the software, or the start of the computer.
}
*/

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
		script.log("Module value changed : "+value.name+" > "+value.get());	
	}else 
	{
		script.log("Module value triggered : "+value.name);	
	}
}
