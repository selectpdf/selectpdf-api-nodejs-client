var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var testUrl = 'https://selectpdf.com/demo/files/selectpdf.pdf';
    var testPdf = 'Input.pdf';
    var localFile = 'Result.txt';
    var apiKey = 'Your API key here';

    var client = new selectpdf.PdfToTextClient(apiKey);

    // set parameters - see full list at https://selectpdf.com/pdf-to-text-api/
    client
        .setStartPage(1) // start page (processing starts from here)
        .setEndPage(0) // end page (set 0 to process file til the end)
        .setOutputFormat(0) // set output format (0-Text or 1-HTML)
    ;

    console.log('Starting pdf to text ...');

    // convert local pdf to local text file
    client.getTextFromFileToFile(testPdf, localFile, 
        function(err, fileName) {
            if (err) return console.error("An error occurred: " + err);
            console.log("Finished! Result is in file '" + fileName + "'. Number of pages processed: " + client.getNumberOfPages());

            var usageClient = new selectpdf.UsageClient(apiKey);
            usageClient.getUsage(false, function(err2, data) {
                if (err2) return console.error("An error occurred getting the usage info: " + err2);
                console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
            });
        }
    );

    // extract text from local pdf to memory
    /*
    client.getTextFromFile(testPdf,  
        function(err, text) {
            if (err) return console.error("An error occurred: " + err);
            console.log("Finished! Result is in variable 'text'. Number of pages processed: " + client.getNumberOfPages());
            console.log(text);

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