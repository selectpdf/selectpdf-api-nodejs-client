var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var url = 'https://selectpdf.com';
    var localFile = 'Test.pdf'

    // Leave the API key out (null), or pass an empty string or 'demo', to use the keyless demo endpoint
    // (output is watermarked, capped at 5 pages, Chromium engine only).
    // Use a real key for full production output.
    var apiKey = 'Your API key here';

    var client = new selectpdf.HtmlToPdfClient(apiKey);

    // set parameters - see full list at https://selectpdf.com/html-to-pdf-api/
    client
        // main properties

        .setPageSize('A4') // PDF page size
        .setPageOrientation('Portrait') // PDF page orientation
        .setMargins(0) // PDF page margins
        .setRenderingEngine('WebKit') // rendering engine (demo mode forces Chromium)
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
        // .setUserPassword('password') // secure the PDF with a password (paid keys only)

        // generate automatic bookmarks

        // .setPdfBookmarksSelectors('H1, H2') // create outlines (bookmarks) for the specified elements
        // .setViewerPageMode(1) // display outlines (bookmarks) in viewer
    ;

    console.log("Starting conversion ...");

    // convert url to file
    client.convertUrlToFile(url, localFile,
        function(err, fileName) {
            if (err instanceof selectpdf.DemoRateLimitException) {
                // reason is one of: per_ip, daily_cap, concurrency
                return console.log("Demo rate limit (" + err.reason + "). Retry after " + err.retryAfter + "s. Upgrade: " + err.upgradeUrl);
            }
            if (err instanceof selectpdf.DemoSafetyException) {
                // demo only converts public URLs - internal/private hosts are rejected
                return console.log("Demo safety guard rejected '" + err.field + "' (reason=" + err.reason + ").");
            }
            if (err instanceof selectpdf.DemoUnsupportedException) {
                // feature not available on the demo endpoint (e.g. setUserPassword)
                return console.log("Feature '" + err.field + "' not available in demo mode. Upgrade: " + err.upgradeUrl);
            }
            if (err) return console.log("An error occurred: " + err);

            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());

            // response telemetry
            console.log("Mode: " + client.getMode() + ", Execution: " + client.getExecutionMode() + ".");

            if (client.isDemoMode()) {
                if (client.wasClamped())
                    console.log("Demo clamped: " + client.getClampedFields().join(', ') + ".");
                if (client.wasAnyFieldDropped())
                    console.log("Demo dropped: " + client.getDroppedFields().join(', ') + ".");
            }
            else {
                console.log("Credits remaining: " + client.getCreditsRemaining() + " / " + client.getCreditsTotal() + ".");

                // get API usage (paid keys only - the demo endpoint has no usage account)
                var usageClient = new selectpdf.UsageClient(apiKey);
                usageClient.getUsage(false, function(err2, data) {
                    if (err2) return console.error("An error occurred getting the usage info: " + err2);
                    console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
                });
            }
        }
    );

    // convert url to memory
    /*
    client.convertUrl(url,
        function(err, pdf) {
            if (err) return console.error("An error occurred: " + err);

            console.log("Finished! Result is in variable 'pdf'. Number of pages: " + client.getNumberOfPages());
        }
    );
    */

    // convert html string to file
    /*
    client.convertHtmlStringToFile('This is some <b>html</b>.', localFile,
        function(err, fileName) {
            if (err) return console.log("An error occurred: " + err);
            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
        }
    );
    */

    // convert html string to memory
    /*
    client.convertHtmlString('This is some <b>html</b>.',
        function(err, pdf) {
            if (err) return console.error("An error occurred: " + err);

            console.log("Finished! Result is in variable 'pdf'. Number of pages: " + client.getNumberOfPages());
        }
    );
    */
}
catch (ex) {
    console.log("An error occurred: " + ex);
}
