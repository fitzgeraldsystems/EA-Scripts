!INC Local Scripts.EAConstants-JScript
!INC EAScriptLib.JScript-Logging

/* This code has been included from the default Project Browser template.
 * If you wish to modify this template, it is located in the Config\Script Templates
 * directory of your EA install path.   
 * 
 * Script Name: Populate Estimate Data
 * Author: Terry Fitzgerald
 * Purpose: Retrieve certain data (limited to mass for now) from an SDF (simulation model from Gazebo)
 * Date: December 2020
 * Use: In the Project Browser select the block that contains the mass property you want to update...
 * 		Right click on the block, Specialize->Scripts->javascript_pullDataFromXML
 */

/*
 * Project Browser Script main function
 */
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	
	// Handling Code: Uncomment any types you wish this script to support
	// NOTE: You can toggle comments on multiple lines that are currently
	// selected with [CTRL]+[SHIFT]+[C].
	//Session.Output(treeSelectedType);
	switch ( treeSelectedType )
	{
		case otElement :
		{
			// Code for when an element is selected
			var theElement as EA.Element;
			theElement = Repository.GetTreeSelectedObject();
			return (theElement);
		}
		default:
		{
			// Error message
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

function XMLReadXMLFromFile( path )
{
	var xmlDOM = new COMObject( "MSXML2.DOMDocument.6.0");
	xmlDOM.validateOnParse = true;
	xmlDOM.async = true;

	var loaded = xmlDOM.load ( path ) ;
	
	//Session.Output(loaded)
	if ( !loaded) {
		LOGWarning (_XMLDescribeParseError(xmlDOM.parseError) );
			xmlDOM = null;
		}
	return xmlDOM;
}
	
function _XMLDescribeParseError( parseError )
{
	var reason = "Unknown Error";
	
	// If we have an error
	if ( typeof(parseError) != "undefined" )
	{
		// Format a description of the error
		reason = "XML Parse Error at [line: " + parseError.line + ", pos: " + 
			parseError.linepos + "] " + parseError.reason;
	}
	return reason;
}

function testElementForLinkedFileFormat (eaElement, format)
{
	// tests the provided element to see whether it has a connection to an Artifact which has a link to a file.
	// this file is tested whether last three characters are same as 'format'.
	var eaConnector as EA.Connector;
	var eaClientElement as EA.Element;
	var eaFile as EA.File;
	let iConCounter = 0;
	let iFileCounter = 0;
	var nConnector = eaElement.Connectors.Count;
	var nFile = 0;
	var szFileofInterest = 0;

	if (nConnector === 0) {LOGWarning("Expected file is connected to selected element");}
	else {
		while ( iConCounter < nConnector ) {
			eaConnector = eaElement.Connectors.GetAt(iConCounter);
			if (eaConnector.Stereotype.includes("trace")) {
				eaClientElement = Repository.GetElementByID(eaConnector.ClientID);
				if (eaClientElement.Type = "Artifact") {
					nFile = eaClientElement.Files.Count;
					if ( nFile > 0) {
						while ( iFileCounter < nFile ){
							eaFile = eaClientElement.Files.GetAt(iFileCounter);
							if (eaFile.Name.substring(eaFile.Name.length - format.length) === format){
								szFileofInterest = eaFile.Name;
								break;
							}
							iFileCounter = iFileCounter + 1;
						}
					}
				}
			}
			iConCounter = iConCounter + 1;
		}
	}
	return (szFileofInterest);
}

function sumValuesFromXML (xmlFile, str)
{
	var runningValue = 0;
	var parsedXML = XMLReadXMLFromFile(xmlFile);

	objNodeList = parsedXML.getElementsByTagName(str);
	for (let i = 0; i < objNodeList.length; i++) {
		runningValue = runningValue + parseFloat(objNodeList.item(i).nodeTypedValue);
	}

	return (runningValue);
}

function testElementForCurrentValue(e, str)
{
	var eaPart as EA.Element;
	var nSubElements = 0;
	var nCustomProperties = 0;
	var value = 0;
	let iCounter = 0;
	let iProperties = 0;
	
	nSubElements = e.Elements.Count;
	while ( iCounter < nSubElements ) {
		eaPart = e.Elements.GetAt( iCounter );
		//Session.Output( `looking in ${e.Elements.GetAt( iCounter ).Name}` );
		if (eaPart.Name === str) {
			//Session.Output( `eaPart.Name==str returned TRUE` );
			nCustomProperties = eaPart.CustomProperties.Count;
			while ( iProperties < nCustomProperties ) {
				//Session.Output( `looking in ${eaPart.CustomProperties.GetAt( iProperties ).Name}` );
				if (eaPart.CustomProperties.GetAt(iProperties).Name === "default") {
					value = eaPart.CustomProperties.GetAt(iProperties).Value;
					if ( value === "" ){ value=0; }
					//Session.Output(`Property ${eaPart.CustomProperties.GetAt(iProperties).Name} has value ${value}`)
					break;
				}
				iProperties = iProperties + 1;
			}
		}
		iCounter = iCounter + 1;
	}
	return (value);
}

function updateModel( element,partName,newValue )
{
	var eaPart as EA.Element;
	var nCustomProperties;
	let iProperties = 0;
	
	eaPart = element.Elements.GetByName(partName);
	nCustomProperties = eaPart.CustomProperties.Count;
	
	while (iProperties < nCustomProperties) {
		if (eaPart.CustomProperties.GetAt(iProperties).Name === "default"){
			eaPart.CustomProperties.GetAt(iProperties).Value = newValue;
			eaPart.Update();
			break;
		}
		iProperties = iProperties + 1;
	}
}


var element = OnProjectBrowserScript();

var formatOfInterest = Session.Input("Type in the relevant file format");
var filePath = testElementForLinkedFileFormat(element, formatOfInterest);
Session.Output(filePath);
var fileName = filePath.substring(filePath.lastIndexOf('\\')+1);
Session.Prompt(`Relevant file found is ${fileName}`, promptOK);
//LOG_Warning if file = ""

var elementOfInterestInFile = Session.Input("Type in the element of interest in file");
var extFileValue = sumValuesFromXML (filePath, elementOfInterestInFile);
Session.Prompt(`Value for ${elementOfInterestInFile} in ${fileName} is ${extFileValue}`, promptOK);

var elementOfInterestInModel = Session.Input("Type in the property of name you want to reference against");
var intModelValue = testElementForCurrentValue(element, elementOfInterestInModel);
Session.Prompt(`Value for ${elementOfInterestInModel} for ${element.Name} is ${intModelValue}`, promptOK);

var result = Session.Prompt(`Shall update ${elementOfInterestInModel} from ${intModelValue} to ${extFileValue}?`, promptYESNO);

if (result === 3) {//resultYes
	updateModel (element, elementOfInterestInModel, extFileValue)
} else {
	Session.Prompt("Thanks for tying this function out");
}