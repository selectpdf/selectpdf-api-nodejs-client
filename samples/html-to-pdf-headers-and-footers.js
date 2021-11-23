var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var url = 'https://selectpdf.com';
    var localFile = 'Test.pdf'
    var apiKey = 'Your API key here';

    var client = new selectpdf.HtmlToPdfClient(apiKey);

    // set parameters - see full list at https://selectpdf.com/html-to-pdf-api/
    client
        .setMargins(0) // PDF page margins
        .setPageBreaksEnhancedAlgorithm(true) // enhanced page break algorithm

        // header properties
        .setShowHeader('True') // display header
        // .setHeaderHeight(50) // header height
        // .setHeaderUrl(url) // header url
        .setHeaderHtml('This is the <b>HEADER</b>!!!!') // header html

        // footer properties
        .setShowFooter('True') // display footer
        // .setFooterHeight(60) // footer height
        // .setFooterUrl(url) // footer url
        .setFooterHtml('This is the <b>FOOTER</b>!!!!') // footer html

        // footer page numbers
        .setShowPageNumbers('True') // show page numbers in footer
        .setPageNumbersTemplate('{page_number} / {total_pages}') // page numbers template
        .setPageNumbersFontName('Verdana') // page numbers font name
        .setPageNumbersFontSize(12) // page numbers font size
        .setPageNumbersAlignment(2) // page numbers alignment (2-Center)
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