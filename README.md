virus-link-scanner
==================


Description: 
	This extension uses the Metascan Online API to analyze file links for potential virus threats. This extension adds a context menu option when right clicking on a link to scan the file before downloading. Results page will be shown for risky files.

Chrome extension : virus link scanner 

How to install: To use this extension, you will either need to use the compiled extension or the unpacked files in the source folder.

Instructions: Unpacked extension

	On the extensions section in chrome, select developer mode.

	Once selected, you can load an unpacked extension and load up the files.

	In this case you will load from the source folder in the directory of this git repo.

	You will be prompted to adding your key by the extension. If no extension is added, then it will alert you that it cant complete the call because it lacks a key.

	* When inserting an api key, it will be checked by initiating an api call with an example hash to ensure that the key is valid. When confirmed that it is valid, it will be saved to localstorage. If incorrect, it will not save it.


Instructions: Compiled extension - ie. virus_scanner.crx in build folder of git repo.

	On the extensions section in chrome, select developer mode.

	Drag and drop the crx extension file onto the extension web page. 

	You will be prompeted to install the extension. Allow it.

	It will then be installed. Installer page will start then.


User Instructions:

	While on a web page, select and right click on a link that your interested in scanning for viruses.
	
	In the context menu, select the following option : "Scan link for viruses"
	
	The extension will begin analyzing the file url and when results are available, a results page will open.
	
	If you enable the "Scan all downloads" feature in the popup menu, all new downloads will be scanned automatically without using the right click feature. This feature is disabled by default, but it may be enabled in the popup menu.
	
~Agustin Roldan
metarco.com

