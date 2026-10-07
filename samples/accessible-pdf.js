var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var url = 'https://selectpdf.com';
    var localFile = 'Accessible.pdf';

    // Works with the keyless demo endpoint too - leave the key out (null) or pass 'demo'.
    // Note the demo stamps its output after conversion, so a demo PDF demonstrates the feature
    // rather than being a conformant artifact; use a real key for output you intend to ship.
    var apiKey = 'Your API key here';

    var client = new selectpdf.HtmlToPdfClient(apiKey);

    // set parameters - see full list at https://selectpdf.com/html-to-pdf-api-parameters/
    client
        // Produce a tagged PDF: a logical structure tree covering headings,
        // paragraphs, lists, tables, figures with alternate text, links and
        // reading order - what a screen reader needs to read the document.
        .setTagged(true)

        // A tagged document needs a title. Without this the converter falls
        // back to the HTML <title>.
        .setDocTitle('SelectPdf - accessible sample')

        // Shown by viewers that honour it; accessible PDF expects it on, and
        // the API turns it on for you whenever tagged output is requested.
        .setViewerDisplayDocTitle(true)

        // The document language, written as the PDF /Lang entry and onto the
        // tagged structure elements.
        .setDocumentLanguage('en-US')

        // Conformance target. PdfA3A is the ACCESSIBLE level of PDF/A-3: it
        // implies a tagged document on its own, and it is the level required
        // to carry a ZUGFeRD / Factur-X invoice (see electronic-invoice.js).
        //   Full   - the complete PDF feature set (default)
        //   PdfA / PdfA2B / PdfA3B / PdfA3U - long term archiving
        //   PdfA3A - archiving + accessibility
        //   PdfX   - graphics exchange
        //   PdfSiqQ_A / PdfSiqQ_B - digital signatures
        .setPdfStandard(selectpdf.PdfStandard.PdfA3A)
    ;

    // Tagged output requires the Blink or Chromium engine - the WebKit
    // engines cannot build a structure tree. You can name one explicitly:
    //
    //     client.setRenderingEngine(selectpdf.RenderingEngine.Chromium);
    //
    // If you don't, the API promotes the conversion to Chromium for you and
    // reports the engine it used in the X-SelectPdf-Engine response header.
    // Asking for tagged output together with an explicit WebKit engine is
    // rejected with HTTP 400 rather than silently producing an untagged PDF.

    console.log("Starting conversion ...");

    // convert url to local file
    client.convertUrlToFile(url, localFile,
        function(err, fileName) {
            if (err) return console.log("An error occurred: " + err);

            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());

            // response telemetry
            console.log("Mode: " + client.getMode() + ", Execution: " + client.getExecutionMode() + ".");
            console.log("Credits remaining: " + client.getCreditsRemaining() + " / " + client.getCreditsTotal() + ".");
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
}
catch (ex) {
    console.log("An error occurred: " + ex);
}
