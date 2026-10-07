var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var url = 'https://selectpdf.com';
    var localFile = 'Test.pdf';

    // Web elements lookup requires a paid API key (the demo endpoint
    // does not expose the elements service).
    var apiKey = 'Your API key here';

    var client = new selectpdf.HtmlToPdfClient(apiKey);

    // CSS selectors used to identify HTML elements whose location in
    // the resulting PDF should be reported back. See the API docs for
    // selector syntax: https://selectpdf.com/html-to-pdf-api/
    client
        .setPageSize('A4')
        .setMargins(0)
        .setPdfWebElementsSelectors('H1, H2, *.menu, *#footer')
    ;

    console.log("Starting conversion ...");

    client.convertUrlToFile(url, localFile,
        function(err, fileName) {
            if (err) return console.log("An error occurred: " + err);

            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());

            // Retrieve element rectangles. Returns an empty list if no element
            // matched the configured selectors.
            client.getWebElements(function(err2, elements) {
                if (err2) return console.log("An error occurred getting the web elements: " + err2);

                console.log("Web elements found: " + elements.length + ".");

                elements.forEach(function(element) {
                    console.log(" - <" + element.HtmlElementTagName + "> id='" + element.HtmlElementId + "' class='" + element.HtmlElementCssClassName +
                        "' rectangles=" + (element.PdfRectangles ? element.PdfRectangles.length : 0));
                });

                // response telemetry
                console.log("Mode: " + client.getMode() + ", Execution: " + client.getExecutionMode() + ".");
                console.log("Credits remaining: " + client.getCreditsRemaining() + " / " + client.getCreditsTotal() + ".");
            });
        }
    );
}
catch (ex) {
    console.log("An error occurred: " + ex);
}
