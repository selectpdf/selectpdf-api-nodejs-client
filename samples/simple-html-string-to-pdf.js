var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var html = 'This is a <b>test HTML</b>.';
    var localFile = 'Test.pdf'
    var apiKey = 'Your API key here';

    var client = new selectpdf.HtmlToPdfClient(apiKey);

    client
        .setPageSize('A4')
        .setMargins(0)  
        .setShowPageNumbers(false)
        .setPageBreaksEnhancedAlgorithm(true)
    ;

    client.convertHtmlStringToFile(html, localFile, 
        function(err, fileName) {
            if (err) return console.log("An error occurred: " + err);
            console.log("Finished successfully. Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
        }
    );

}
catch (ex) {
    console.log("An error occurred: " + ex);
}