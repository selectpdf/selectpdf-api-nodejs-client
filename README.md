# SelectPdf Online REST API - Node.js Client

SelectPdf Online REST API is a professional solution for managing PDF documents online. It now has a dedicated, easy to use, Node.js client library that can be setup in minutes.

## Installation

Install SelectPdf Nodejs Client for Online API via [npm](https://www.npmjs.com/package/selectpdf).

```
npm install selectpdf
```

OR

Download [selectpdf-api-nodejs-client-1.4.0.zip](https://github.com/selectpdf/selectpdf-api-nodejs-client/releases/download/1.4.0/selectpdf-api-nodejs-client-1.4.0.zip), unzip it and run:

```
npm install /path/to/selectpdf-api-nodejs-client-1.4.0
```

OR

Clone [selectpdf-api-nodejs-client](https://github.com/selectpdf/selectpdf-api-nodejs-client) from Github and install the library.

```
git clone https://github.com/selectpdf/selectpdf-api-nodejs-client
npm install /path/to/selectpdf-api-nodejs-client-1.4.0
```

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
* Works in all programming languages.

Sign up for for free to get instant API access to SelectPdf [HTML to PDF API](https://selectpdf.com/html-to-pdf-api/).

### Sample Code

```javascript
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
```

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

```javascript
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
```

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

```javascript
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
```
