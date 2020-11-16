# EA-Scripts
Scripts to automate metrics and processes in Enterprise Architect

Scripts tested on Enterprise Architect version is 15.1.1526. Scripts are intended to be used on models written in SysML (though it is extendable to other type of models).

To enable Scripting go through the following steps:
Precondition: EA is open!
1) (Optional) In Ribbon: Configure->Model->Options
2) (Optional) Tick 'Required' checkbox in MDGTechnologies -> EAScriptLib
3) (Optional) Close
4) In Ribbon: Specialize->Tools->Scripting
5) In the new Scripting window: Scripts->Create New Group->New Project Browser Group
6) Name the new group something like 'Custom Project Browser Scripts' (right click new group and change name/type in 'Group Properties'
7) Right click new group and select 'New <scripting language>script'. You have a choice between VBScript, JScript or Javascript. I've chosen Javascript.
8) Give the script a name
9) Open the script and copy and paste (?!) scripts in this repository into the new script.
10) Save As (within the script editor)
11) Run (either within the script editor or select any element in the Project Browser). Session Output can be seen in System Output window, Script tab. This output window should open automatically.

Reference documentation on the EA object and important classes can be found here:
1) Repository Class https://sparxsystems.com/enterprise_architect_user_guide/15.2/automation/repository3.html
2) Package Class https://sparxsystems.com/enterprise_architect_user_guide/15.2/automation/package_2.html
3) Element Class https://sparxsystems.com/enterprise_architect_user_guide/15.2/automation/element2.html
4) Collection Class https://sparxsystems.com/enterprise_architect_user_guide/15.2/automation/collection.html
