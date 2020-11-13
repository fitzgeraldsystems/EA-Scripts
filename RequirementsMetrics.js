/////////////////////////////////////
//  Name: RequirementMetrics.js
//  Description: Script to recursively search for all requirements within a selected package
//     Outputs to Session:
//     * Number of requirements found
//     * Number of requirements which have 'satisfy' relationships
//     * Number of requirements which have 'verify' relationships
//  Language: javascript
//  Author: Terry Fitzgerald
//  Date: Nov. 14th, 2020
//  License: MIT License

function SearchPackage( thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	Session.Output("Package is :" + currentPackage.Name);
	
	SearchElements( currentPackage );
	
	let packCounter = 0;
	var numOfPackages = currentPackage.Packages.Count;
	
	while ( packCounter < numOfPackages ){
		var childPackage = currentPackage.Packages.GetAt( packCounter );
		SearchPackage ( childPackage );
		packCounter++;
	}
	
}

function SearchElements( thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;

	// Iterate through all elements and check for Requirements
	let numOfElements = currentPackage.Elements.Count;
	let elCounter = 0;
	let nReq = numOfReq;
	
	while ( elCounter < numOfElements )
	{
		var currentElement as EA.Element;
		currentElement = currentPackage.Elements.GetAt( elCounter );
		//Session.Output("Current element name is :" + currentElement.Name);
		
		if (currentElement.Type === "Requirement") {
			Session.Output(currentElement.Name +
				" (" + currentElement.Type +
				", ID=" + currentElement.ElementID + ")" )
			
			nReq++;
			
			let conCounter = 0;
			var numOfConnectors = currentElement.Connectors.Count;
			
			while (conCounter < numOfConnectors) {
				let stereotypeName = currentElement.Connectors.GetAt( conCounter ).Stereotype;
				//Session.Output("Connector Type is: " + currentElement.Connectors.GetAt( conCounter ).Type);
				//Session.Output("Connector Stereotype is: " + stereotypeName);
				
				switch (stereotypeName) {
					case "satisfy" :
						numOfReqWSatisfyRel++;
						break;
					case "verify" :
						numOfReqWVerifyRel++;
						break;
					case "allocate" :
						numOfReqWAllocateRel++;
						break;
					default :
						break;
				}
				conCounter++;
			}
		}
		elCounter++;
	}
}

let numOfReq = 0;
let numOfReqWSatisfyRel = 0;
let numOfReqWAllocateRel = 0;
let numOfReqWVerifyRel = 0;

var packageOfInterest = Repository.GetTreeSelectedPackage();

SearchPackage(packageOfInterest);

Session.Output(`Number of Requirements Found = ${numOfReq}.`);
Session.Output(`Number of Requirements with Satisfy Relationships = ${numOfReqWSatisfyRel}.`);
Session.Output(`Number of Requirements with Verify Relationships = ${numOfReqWVerifyRel}.`);
Session.Output(`Number of Requirements with Allocate Relationships = ${numOfReqWAllocateRel}.`);
