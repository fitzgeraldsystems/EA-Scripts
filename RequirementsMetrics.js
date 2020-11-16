/////////////////////////////////////
//  Name: RequirementMetrics.js
//  Description: Script to recursively search for all requirements within a selected package
//	Outputs to Session:
//	* Number of requirements found
//	* Number of requirements which have 'verify' relationships
//	* Number of requirements which have 'satisfy' relationships
//	* Number of requirements that are approved
//	* Number of requirements with Issues
//	* Number of requirements with open Issues
//	* Number of requirements with open Defects
//
//  Language: javascript
//  Author: Terry Fitzgerald
//  Date: Nov. 15th, 2020
//  License: MIT License

function SearchPackage( thePackage, array )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	Session.Output("Package is :" + currentPackage.Name);
	
	array = SearchElements( currentPackage, array );
	
	let packCounter = 0;
	var numOfPackages = currentPackage.Packages.Count;
	
	while ( packCounter < numOfPackages ){
		var childPackage = currentPackage.Packages.GetAt( packCounter );
		SearchPackage ( childPackage, array );
		packCounter++;
	}
	return array;
}

function SearchElements( thePackage, array )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;

	// Iterate through all elements and check for Requirements
	let numOfElements = currentPackage.Elements.Count;
	let elCounter = 0;
	var nReq = array[0][1];
	var numOfReqWSatisfyRel = array[1][1];
	var numOfReqWVerifyRel = array[2][1];
	//var numOfReqWAllocateRel = array[3][1];
	var nReqApproved = array[4][1];
	var nReqWIssues = array[5][1];
	var nReqWOpenIssues = array[6][1];
	var nOpenDefects = array[7][1];
	
	while ( elCounter < numOfElements )
	{
		var currentElement as EA.Element;
		currentElement = currentPackage.Elements.GetAt( elCounter );
		//Session.Output("Current element name is :" + currentElement.Name);
		
		if (currentElement.Type === "Requirement") {
			/*Session.Output(currentElement.Name +
				" (" + currentElement.Type +
				", ID=" + currentElement.ElementID + ")" );*/
			
			let conCounter = 0;
			var numOfConnectors = currentElement.Connectors.Count;
			
			while (conCounter < numOfConnectors) {
				let stereotypeName = currentElement.Connectors.GetAt( conCounter ).Stereotype;
				let typeName = currentElement.Connectors.GetAt( conCounter ).Type;
				
				switch (stereotypeName) {
					case "satisfy" :
						numOfReqWSatisfyRel++;
						break;
					case "verify" :
						numOfReqWVerifyRel++;
						break;
					//case "allocate" :
					//	numOfReqWAllocateRel++;
					//	break;
					default :
						break;
				}
					
				/*switch (someAttribute) {
					case "someWantedAttributeValue" ://test whether the connected element is a particular Type
						var currentConnector as EA.Connector;
						currentConnector = currentElement.Connectors.GetAt( conCounter );

						//Fetch supplier element
						var supplierElement as EA.Element;
						supplierElement = Repository.GetElementByID(currentConnector.SupplierID);

						//let's test whether element type Issue
						if (supplierElement.Type === "someTypeValue") {
							nReqWIssues++;
							if (supplierElement.Status !== "someStatus") {// Validated implies the Issues has been Closed
								nReqWOpenIssues++;
							}
						}
						else if (supplierElement.Type === "Change") {//TODO
						}
						break;
					default :
						break;
				}*/
				conCounter++;
			}

			nReq++; //iterates number of Requirements found
			if (currentElement.Status === "Approved") {nReqApproved++;} //iterates number of Approved Requirements found
			
			//NOTE: the below block searched for ISSUES as created through the CONSTRUCT perspective. Issues directly created in the diagram are NOT Issue Class
			if (currentElement.Issues.Count > 0) {
				for ( let issCounter = 0; issCounter < currentElement.Issues.Count; issCounter++ ) {
					var currentIssue as EA.Issue;
					currentIssue = currentElement.Issues.GetAt( issCounter );
					
					switch (currentIssue.Type) {
						case "Issue" :
							nReqWIssues++; //iterates number of Requirements with Issues found
							if ( currentIssue.Status !== "Complete" && currentIssue.Status !== "Rejected" ) {nReqWOpenIssues++;} //iterates number of Requirements with OPEN Issues found
							break;
						case "Defect" :
							if ( currentIssue.Status !== "Complete" && currentIssue.Status !== "Rejected" ) {nOpenDefects++;} //iterates number of Requirements with OPEN Defects found
							break;
						case "Change" :
							//TODO
							break;
						default:
							break;
					}
				}
			}

			//NOTE: the below block searched for ISSUES as created through the CONSTRUCT perspective. Issues directly creating in the diagram are NOT Issue Class
			/*if (currentElement.Issues.Count > 0) {
				for ( let issCounter = 0; issCounter < currentElement.Issues.Count; issCounter++ ) {
					var currentIssue as EA.Issue;
					currentIssue = currentElement.Issues.GetAt( issCounter );
						
					if ( currentIssue.Status !== "Complete" && currentIssue.Status !== "Rejected" ) {nReqWOpenIssues++;} //iterates number of Requirements with OPEN Issues found
						
					nReqWIssues++; //iterates number of Requirements with Issues found
				}
			}*/
		}
		elCounter++;
	}
	
	array[0][1] = nReq;
	array[1][1] = numOfReqWSatisfyRel;
	array[2][1] = numOfReqWVerifyRel;
	//array[3][1] = numOfReqWAllocateRel;
	array[4][1] = nReqApproved;
	array[5][1] = nReqWIssues;
	array[6][1] = nReqWOpenIssues;
	array[7][1] = nOpenDefects;
	
	return array;
}

let arrayRequirementMetrics = 	[['Number of Requirements:',0],//0
								['Number of Requirements that are Satisfied:',0],//1
								['Number of Requirements that are Verified:',0],//2
								['Number of Requirements that are xxx:',0],//3
								['Number of Requirements that are Approved:',0],//4
								['Number of Requirements with Issues:',0],//5
								['Number of Requirements with Open Issues:',0],//6
								['Number of Open Defects:',0]];//7

var packageOfInterest = Repository.GetTreeSelectedPackage();

arrayRequirementMetrics = SearchPackage(packageOfInterest, arrayRequirementMetrics);
var string = "";
for (let i=0; i<arrayRequirementMetrics.length; i++){
	Session.Output(arrayRequirementMetrics[i][0] + "  " + arrayRequirementMetrics[i][1]);	
	string = string + arrayRequirementMetrics[i][0] + "  " + arrayRequirementMetrics[i][1] + "\n";
}

Session.Prompt(string,0);
