

/* ********** GENERAL SCRIPTING **********************

		This templates shows what you can do in this is module script
		All the code outside functions will be executed each time this script is loaded, meaning at file load, when hitting the "reload" button or when saving this file
*/


// You can add custom parameters to use in your script here, they will be replaced each time this script is saved
// var myFloatParam = script.addFloatParameter("My Float Param","Description of my float param",.1,0,1); 		//This will add a float number parameter (slider), default value of 0.1, with a range between 0 and 1

var targetUniverse = script.addTargetParameter("Input universe","Description of my target param"); 
targetUniverse.setAttribute ("root", local.values);
targetUniverse.setAttribute ("targetType", "container");
targetUniverse.setAttribute ("searchLevel",3);
var firstAddress = script.addIntParameter("First address", "Address of the first sequence", 1,1,512);

function init()
{
}

function scriptParameterChanged(param)
{
	//You can use the script.log() function to show an information inside the logger panel. To be able to actuallt see it in the logger panel, you will have to turn on "Log" on this script.
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
	} 
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
		var parentUniverse = value.getParent();
		inputUniverse = targetUniverse.getTarget();
		if (inputUniverse == "") {
			universes = local.values.getChild("Universes").getContainers();
			if (universes.length >0) {
				inputUniverse = universes[0];
			}
		} 

		if (parentUniverse == inputUniverse) {
			var id = value.niceName;
			var num = parseInt(id.substring(8,id.length))-firstAddress.get();
			var seq = root.sequences.getItemAt(num);
			if (seq) {
				var val = value.get();
				val = val / 255;
				var playing = seq.getChild("isPlaying").get();

				var layers = seq.layers.getContainers();
				for (var i = 0; i< layers.length; i++) {
					var lay = layers[i];
					var temp = util.getObjectProperties(lay, true, false);
					if (temp.indexOf("volume")>=0) {
						var vol = lay.getChild("Volume").set(val);
					}
				}
				if (val == 0 && playing) {
					seq.getChild("Stop").trigger();
				} 
				else if (val >0 && !playing) {
					seq.getChild("Play").trigger();
				}
			}
		}
	}
}
