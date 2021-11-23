var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var url = 'https://selectpdf.com';
    var localFile = 'Test.pdf'
    var apiKey = 'Your API key here';

    var client = new selectpdf.HtmlToPdfClient(apiKey);

    // set parameters - see full list at https://selectpdf.com/html-to-pdf-api/
    client
        // main properties
        
        .setPageSize('A4') // PDF page size
        .setPageOrientation('Portrait') // PDF page orientation
        .setMargins(0) // PDF page margins
        .setRenderingEngine('WebKit') // rendering engine
        .setConversionDelay(1) // conversion delay
        .setNavigationTimeout(30) // navigation timeout 
        .setShowPageNumbers(false) // page numbers
        .setPageBreaksEnhancedAlgorithm(true) // enhanced page break algorithm

        // additional properties
        
        // .setUseCssPrint('True') // enable CSS media print
        // .setDisableJavascript('True') // disable javascript
        // .setDisableInternalLinks('True') // disable internal links
        // .setDisableExternalLinks('True') // disable external links
        // .setKeepImagesTogether('True') // keep images together
        // .setScaleImages('True') // scale images to create smaller pdfs
        // .setSinglePagePdf('True') // generate a single page PDF
        // .setUserPassword('password') // secure the PDF with a password

        // generate automatic bookmarks
        
        // .setPdfBookmarksSelectors('H1, H2') // create outlines (bookmarks) for the specified elements
        // .setViewerPageMode(1) // display outlines (bookmarks) in viewer
    ;

    console.log("Starting conversion ...");

    // convert url to file
    client.convertUrlToFile(url, localFile, 
        function(err, fileName) {
            if (err) return console.log("An error occurred: " + err);
            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());

            var usageClient = new selectpdf.UsageClient(apiKey);
            usageClient.getUsage(false, function(err2, data) {
                if (err2) return console.error("An error occurred getting the usage info: " + err2);
                console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
            });
        }
    );

    // convert url to memory
    /*
    client.convertUrl(url,  
        function(err, pdf) {
            if (err) return console.error("An error occurred: " + err);

            console.log("Finished! Result is in variable 'pdf'. Number of pages: " + client.getNumberOfPages());

            var usageClient = new selectpdf.UsageClient(apiKey);
            usageClient.getUsage(false, function(err2, data) {
                if (err2) return console.error("An error occurred getting the usage info: " + err2);
                console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
            });
        }
    );
    */

    // convert html string to file
    /*
    client.convertHtmlStringToFile('This is some <b>html</b>.', localFile, 
        function(err, fileName) {
            if (err) return console.log("An error occurred: " + err);
            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());

            var usageClient = new selectpdf.UsageClient(apiKey);
            usageClient.getUsage(false, function(err2, data) {
                if (err2) return console.error("An error occurred getting the usage info: " + err2);
                console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
            });
        }
    );
    */

    // convert html string to memory
    /*
    client.convertHtmlString('This is some <b>html</b>.',  
        function(err, pdf) {
            if (err) return console.error("An error occurred: " + err);

            console.log("Finished! Result is in variable 'pdf'. Number of pages: " + client.getNumberOfPages());

            var usageClient = new selectpdf.UsageClient(apiKey);
            usageClient.getUsage(false, function(err2, data) {
                if (err2) return console.error("An error occurred getting the usage info: " + err2);
                console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
            });
        }
    );
    */
}
catch (ex) {
    console.log("An error occurred: " + ex);
}