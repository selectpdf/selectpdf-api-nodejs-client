# SelectPdf Online REST API - Node.js Client

## HTML To PDF API - Node.js Client

SelectPdf HTML To PDF Online REST API is a professional solution that lets you create PDF from web pages and raw HTML code in your applications. The API is easy to use and the integration takes only a few lines of code.

### Features

* Create PDF from any web page or html string.
* Full html5/css3/javascript support.
* Set PDF options such as page size and orientation, margins, security, web page settings.
* Set PDF viewer options and PDF document information.
* Create custom headers and footers for the pdf document.
* Hide web page elements during the conversion.
* Automatically generate bookmarks during the html to pdf conversion.
* Support for partial page conversion.
* Tagged, accessible PDF and PDF standards (PDF/A, PDF/X, PDF/SiqQ).
* ZUGFeRD / Factur-X hybrid electronic invoices.
* Keyless demo mode - try the API without signing up.
* Works in all programming languages.

Sign up for for free to get instant API access to SelectPdf [HTML to PDF API](https://selectpdf.com/html-to-pdf-api/).

### Sample Code

    var selectpdf = require('selectpdf');

    console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

    try {
        var url = 'https://selectpdf.com';
        var localFile = 'Test.pdf'
        var apiKey = 'Your API key here';

        var client = new selectpdf.HtmlToPdfClient(apiKey);

        client
            .setPageSize('A4')
            .setMargins(0)  
            .setShowPageNumbers(false)
            .setPageBreaksEnhancedAlgorithm(true)
        ;

        client.convertUrlToFile(url, localFile, 
            function(err, fileName) {
                if (err) return console.log("An error occurred: " + err);
                console.log("Finished successfully. Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
            }
        );

    }
    catch (ex) {
        console.log("An error occurred: " + ex);
    }

### Keyless Demo

Construct `HtmlToPdfClient` without an API key (or with an empty string or `'demo'`) to use the keyless demo endpoint - no signup required. Demo output is watermarked, capped at 5 pages and always rendered with the Chromium engine.

    var client = new selectpdf.HtmlToPdfClient(); // demo mode

    client.convertUrlToFile('https://selectpdf.com', 'Demo.pdf', function(err, fileName) {
        if (err) return console.log("An error occurred: " + err);

        console.log("Demo mode: " + client.isDemoMode() + ". Demo response: " + client.isDemoResponse() + ".");
        if (client.wasClamped()) console.log("Clamped: " + client.getClampedFields().join(', '));
        if (client.wasAnyFieldDropped()) console.log("Dropped: " + client.getDroppedFields().join(', '));
    });

Demo-mode limits:

* Public urls only - internal and private hosts are rejected with `DemoSafetyException`.
* Per-IP and global rate limits - reported with `DemoRateLimitException` (`reason`, `retryAfter`, `upgradeUrl`).
* `setUserPassword`, `setOwnerPassword` and the asynchronous conversions are not available - `DemoUnsupportedException`.
* Auth credentials, cookies, the pdf name and the web elements selectors are ignored - see `getDroppedFields()`.
* The navigation timeout and the conversion delay are capped - see `getClampedFields()`.

### Accessible PDF and PDF Standards

    client
        .setTagged(true) // tagged, accessible PDF (Blink or Chromium engine)
        .setDocTitle('Accessible document') // a tagged document needs a title
        .setDocumentLanguage('en-US') // written as the PDF /Lang entry
        .setPdfStandard(selectpdf.PdfStandard.PdfA3A) // Full, PdfA, PdfA2B, PdfA3A, PdfA3B, PdfA3U, PdfX, PdfSiqQ_A, PdfSiqQ_B
    ;

Tagged output needs the Blink or Chromium rendering engine. If no engine is set, the API promotes the conversion to Chromium and reports the engine it used in the `X-SelectPdf-Engine` response header. Other 1.6.0 settings: `setWebPageFixedSize` (cut the PDF at the web page height set with `setWebPageHeight`), `setAuthUsername` / `setAuthPassword` (HTTP Basic authentication for the page being converted).

### Error Handling

Errors are passed to the callback as the `err` parameter (setters with invalid values throw). All errors are `selectpdf.ApiException` objects with `message` and `code` (the HTTP status code); the demo endpoint errors have their own types:

    client.convertUrlToFile(url, localFile, function(err, fileName) {
        if (err instanceof selectpdf.DemoRateLimitException) return console.log("Retry after " + err.retryAfter + "s (" + err.reason + ").");
        if (err instanceof selectpdf.DemoSafetyException) return console.log("Rejected " + err.field + " (" + err.reason + ").");
        if (err instanceof selectpdf.DemoUnsupportedException) return console.log("Not available in demo mode: " + err.field + ".");
        if (err) return console.log("An error occurred: " + err);
        // ...
    });

### Response Telemetry

Every client reports, after each call: `getNumberOfPages()`, `getCreditsTotal()` and `getCreditsRemaining()` (monthly conversion limit and conversions left, -1 for unlimited, null when not reported - for example on the demo endpoint), `getMode()` (`production` or `demo`) and `getExecutionMode()`.

## Electronic Invoices API (ZUGFeRD / Factur-X)

`InvoiceClient` creates hybrid electronic invoices: one PDF/A-3 document carrying both the visible invoice and the invoice XML a recipient's accounting system reads. It derives from `HtmlToPdfClient`, so every conversion setting applies here too. An API key is required - the demo endpoint does not produce invoices.

### Features

* Create the visible invoice from a url or an html string.
* Embed the invoice XML from a local file, a Buffer or a string.
* Profiles: Minimum, Basic_WL, Basic, En16931, Extended, XRechnung.
* Carrier PDF/A-3A (default, accessible), PDF/A-3B or PDF/A-3U.
* The attachment relationship is derived from the profile when not set.

### Sample Code

    var selectpdf = require('selectpdf');

    console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

    try {
        var invoiceHtml = '<html><body><h1>Invoice INV-2026-001</h1></body></html>';
        var localFile = 'Invoice.pdf';
        var apiKey = 'Your API key here';

        var client = new selectpdf.InvoiceClient(apiKey);

        client
            .setInvoiceXmlFile('factur-x.xml') // or setInvoiceXml(xmlStringOrBuffer)
            .setZugferdProfile(selectpdf.ZugferdProfile.En16931)
            .setDocTitle('Invoice INV-2026-001')
        ;

        client.createFromHtmlStringToFile(invoiceHtml, localFile, 
            function(err, fileName) {
                if (err) return console.log("An error occurred: " + err);
                console.log("Finished successfully. Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
            }
        );
    }
    catch (ex) {
        console.log("An error occurred: " + ex);
    }

## Pdf Merge API

SelectPdf Pdf Merge REST API is an online solution that lets you merge local or remote PDFs into a final PDF document.

### Features

* Merge local PDF document.
* Merge remote PDF from public url.
* Set PDF viewer options and PDF document information.
* Secure generated PDF with a password.
* Works in all programming languages.

See [PDF Merge API](https://selectpdf.com/pdf-merge-api/) page for full list of parameters.

### Sample Code

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
            }
        );
    }
    catch (ex) {
        console.log("An error occurred: " + ex);
    }

## Pdf To Text API

SelectPdf Pdf To Text REST API is an online solution that lets you extract text from your PDF documents or search your PDF document for certain words.

### Features

* Extract text from PDF.
* Search PDF.
* Specify start and end page for partial file processing.
* Specify output format (plain text or html).
* Use a PDF from an online location (url) or upload a local PDF document.

See [Pdf To Text API](https://selectpdf.com/pdf-to-text-api/) page for full list of parameters.

### Sample Code

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
            }
        );
    }
    catch (ex) {
        console.log("An error occurred: " + ex);
    }
