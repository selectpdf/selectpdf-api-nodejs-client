var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var testUrl = 'https://selectpdf.com/demo/files/selectpdf.pdf';
    var testPdf = 'Input.pdf';
    var localFile = 'Result.pdf';
    var apiKey = 'Your API key here';

    var client = new selectpdf.PdfMergeClient(apiKey);

    // set parameters - see full list at https://selectpdf.com/pdf-merge-api/
    client
        // specify the pdf files that will be merged (order will be preserved in the final pdf)
        
        .addFile(testPdf) // add PDF from local file
        .addUrlFile(testUrl) // add PDF From public url
        //.addFile(testPdf, "pdf_password") // add PDF (that requires a password) from local file
        //.addUrlFile(testUrl, "pdf_password") // add PDF (that requires a password) from public url
    ;

    console.log('Starting pdf merge ...');

    // merge pdfs to local file
    client.saveToFile(localFile, 
        function(err, fileName) {
            if (err) return console.error("An error occurred: " + err);
            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());

            var usageClient = new selectpdf.UsageClient(apiKey);
            usageClient.getUsage(false, function(err2, data) {
                if (err2) return console.error("An error occurred getting the usage info: " + err2);
                console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
            });
        }
    );

    // merge pdfs to memory
    /*
    client.save(
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