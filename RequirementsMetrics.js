function moveNext()
	{
		if(this.iElem > -1)
		{
			this.iElem++;
			if(this.iElem < this.Package.Count)
			{
				return true;
			}
			this.iElem = this.Package.Count;
		}
		return false;
	}

function item()
	{
		if( this.iElem > -1 && this.iElem < this.Package.Count)
		{
			return this.Package.GetAt(this.iElem);
		}
		return null;
	}

function atEnd()
	{
		if((this.iElem > -1) && (this.iElem < this.Package.Count))
		{
			return false;
		}
		Session.Output("at end!");
		return true;
	}

function Check( obj)
	{
		if(obj == undefined)
		{
			Session.Output("Undefined object");
			return false;
		}
		return true;
	}

function Enumerator( object )
{
	this.iElem = 0;
	this.Package = object;
	this.atEnd = atEnd;
	this.moveNext = moveNext;
	this.item = item;
	this.Check = Check;
	if(!Check(object))
	{
		this.iElem = -1;
	}
}

function RecursiveModelDump()
{
	Session.Output( "JScript RECURSIVE MODEL DUMP EXAMPLE" );
	Session.Output( "=======================================" );
	
	// Iterate through all models in the project
	var modelEnumerator = new Enumerator( Models );
	while ( !modelEnumerator.atEnd() )
	{
		var currentModel as EA.Package;
		currentModel = modelEnumerator.item();
		
		// Recursively process this package
		DumpPackage( "", currentModel );
		
		modelEnumerator.moveNext();
	}
	
	Session.Output( "Done!" );
}

function DumpPackage( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	// Add the current package's name to the list
	/*Session.Output( indent + currentPackage.Name + " (PackageID=" + 
		currentPackage.PackageID + ")" );*/
	
	// Dump the elements this package contains
	DumpElements( indent + "    ", currentPackage );
	
	// Recursively process any child packages
	var childPackageEnumerator = new Enumerator( currentPackage.Packages );
	while ( !childPackageEnumerator.atEnd() )
	{
		var childPackage as EA.Package;
		childPackage = childPackageEnumerator.item();
		
		DumpPackage( indent + "    ", childPackage );
		
		childPackageEnumerator.moveNext();
	}
}

function DumpElements( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	// Iterate through all elements and add them to the list
	var elementEnumerator = new Enumerator( currentPackage.Elements );
	while ( !elementEnumerator.atEnd() )
	{
		var currentElement as EA.Element;
		currentElement = elementEnumerator.item();
		
		/*Session.Output( indent + "::" + currentElement.Name +
			" (" + currentElement.Type +
			", ID=" + currentElement.ElementID + ")" );*/
		
		if (currentElement.Type === "Requirement") {
			Session.Output( indent + "::" + currentElement.Name +
				" (" + currentElement.Type +
				", ID=" + currentElement.ElementID + ")" )
			numOfRequirements++;
			var i = 0;
			var numOfRelationships = currentElement.Connectors.Count;
			while (i < numOfRelationships) {
				let stereotypeName = currentElement.Connectors.GetAt(i).Stereotype;
				Session.Output(currentElement.Connectors.GetAt(i).Type);
				Session.Output( indent + "   " + stereotypeName);
				switch (stereotypeName) {
					case "satisfy" :
						numOfRequirementswithSatisfyRelationship++;
						break;
					case "verify" :
						numOfRequirementswithVerifyRelationship++;
						break;
					case "allocate" :
						numOfRequirementswithAllocateRelationship++;
						break;
					default :
						break;
					}
				i++;
				}
		}
		
		elementEnumerator.moveNext();
	}
}

/*function testRequirements()
{
	Session.Output("==================================");
	Session.Output("This script will test requirements");

	
	var selectedPackage = Repository.GetTreeSelectedPackage(); //if element chosen is not a package than the parent package is chosen
	Session.Output(selectedPackage.Name);
	
	var iteratedElement = new Enumerator(selectedPackage.Elements);
	
	while (!iteratedElement.atEnd()) 
	{
		var currentElement as EA.Element;
		currentElement = iteratedElement.item();
		
		Session.Output(currentElement.Name);
		
		iteratedElement.moveNext();
	}
	Session.Output("==================================");
}*/

//RecursiveModelDump();
let numOfRequirements = 0;
let numOfRequirementswithSatisfyRelationship = 0;
let numOfRequirementswithAllocateRelationship = 0;
let numOfRequirementswithVerifyRelationship = 0;
DumpPackage("",Repository.GetTreeSelectedPackage());

Session.Output(`Number of Requirements Found = ${numOfRequirements}.`);
Session.Output(`Number of Requirements with Satisfy Relationships = ${numOfRequirementswithSatisfyRelationship}.`);
Session.Output(`Number of Requirements with Verify Relationships = ${numOfRequirementswithVerifyRelationship}.`);
Session.Output(`Number of Requirements with Allocate Relationships = ${numOfRequirementswithAllocateRelationship}.`);
