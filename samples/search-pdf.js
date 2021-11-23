var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var testUrl = 'https://selectpdf.com/demo/files/selectpdf.pdf';
    var testPdf = 'Input.pdf';
    var apiKey = 'Your API key here';

    var client = new selectpdf.PdfToTextClient(apiKey);

    // set parameters - see full list at https://selectpdf.com/pdf-to-text-api/
    client
        .setStartPage(1) // start page (processing starts from here)
        .setEndPage(0) // end page (set 0 to process file til the end)
    ;

    console.log('Starting search pdf ...');

    // search local pdf
    client.searchFile(testPdf, 'pdf', false, false,
        function(err, results) {
            if (err) return console.error("An error occurred: " + err);

            console.log("Search results: " + JSON.stringify(results) +".\nSearch results count: " + results.length + ".");
            console.log("Finished! Number of pages processed: " + client.getNumberOfPages());

            var usageClient = new selectpdf.UsageClient(apiKey);
            usageClient.getUsage(false, function(err2, data) {
                if (err2) return console.error("An error occurred getting the usage info: " + err2);
                console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
            });
        }
    );

    // search pdf from public url
    /*
    client.searchUrl(testUrl, 'pdf', false, false,
        function(err, results) {
            if (err) return console.error("An error occurred: " + err);

            console.log("Search results: " + JSON.stringify(results) +".\nSearch results count: " + results.length + ".");
            console.log("Finished! Number of pages processed: " + client.getNumberOfPages());

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