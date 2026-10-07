/**
 * SelectPdf cloud REST API is a platform independent PDF manipulation API. 
 * As a true REST API, it can be used with any language: .NET, Java, PHP, Python, Go, Ruby and many more. 
 * We are presenting here the dedicated Node.js client library for SelectPdf API.
 * 
 * Using the SelectPdf Online REST API Node.js client library you can easily take advance of the API features offered by SelectPdf:
 * 
 * {@link https://selectpdf.com/html-to-pdf-api/|HTML to PDF REST API} - SelectPdf HTML To PDF Online REST API is a professional solution that lets you create PDF from web pages and raw HTML code in your applications.
 * 
 * {@link https://selectpdf.com/pdf-to-text-api/|PDF To Text REST API} - SelectPdf Pdf To Text REST API is an online solution that lets you extract text from your PDF documents or search your PDF document for certain words.
 * 
 * {@link https://selectpdf.com/pdf-merge-api/|Pdf Merge REST API} - SelectPdf Pdf Merge REST API is an online solution that lets you merge local or remote PDFs into a final PDF document.
 * 
 * Electronic invoices - InvoiceClient creates ZUGFeRD / Factur-X hybrid electronic invoices: one PDF/A-3 document carrying both the visible invoice and the invoice XML.
 * 
 * Keyless demo - construct HtmlToPdfClient without an API key to try the HTML to PDF API with no signup (watermarked output, capped at 5 pages).
 * 
 * @example <caption>Html to Pdf in NodeJS with SelectPdf online REST API:</caption>
 * 
 * var selectpdf = require('selectpdf');
 * 
 * console.log("This is SelectPdf-%s.\n", selectpdf.CLIENT_VERSION);
 * 
 * try {
 *     var url = 'https://selectpdf.com';
 *     var localFile = 'Test.pdf'
 *     var apiKey = 'Your API key here';
 * 
 *     var client = new selectpdf.HtmlToPdfClient(apiKey);
 * 
 *     client
 *         .setPageSize('A4')
 *         .setMargins(0)  
 *         .setShowPageNumbers(false)
 *         .setPageBreaksEnhancedAlgorithm(true)
 *     ;
 * 
 *     client.convertUrlToFile(url, localFile, 
 *         function(err, fileName) {
 *             if (err) return console.log("An error occurred: " + err);
 *             console.log("Finished successfully. Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
 *         }
 *     );
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 * 
 * @example <caption>Pdf To Text in NodeJS with SelectPdf online REST API:</caption>
 * var selectpdf = require('selectpdf');
 * 
 * console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);
 * 
 * try {
 *     var testPdf = 'Input.pdf';
 *     var localFile = 'Result.txt';
 *     var apiKey = 'Your API key here';
 * 
 *     var client = new selectpdf.PdfToTextClient(apiKey);
 * 
 *     // set parameters - see full list at https://selectpdf.com/pdf-to-text-api/
 *     client
 *         .setStartPage(1) // start page (processing starts from here)
 *         .setEndPage(0) // end page (set 0 to process file til the end)
 *         .setOutputFormat(0) // set output format (0-Text or 1-HTML)
 *     ;
 * 
 *     console.log('Starting pdf to text ...');
 * 
 *     // convert local pdf to local text file
 *     client.getTextFromFileToFile(testPdf, localFile, 
 *         function(err, fileName) {
 *             if (err) return console.error("An error occurred: " + err);
 *             console.log("Finished! Result is in file '" + fileName + "'. Number of pages processed: " + client.getNumberOfPages());
 *         }
 *     );
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 * 
 * @example <caption>Pdf Merge in NodeJS with SelectPdf online REST API:</caption>
 * var selectpdf = require('selectpdf');
 * 
 * console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);
 * 
 * try {
 *     var testUrl = 'https://selectpdf.com/demo/files/selectpdf.pdf';
 *     var testPdf = 'Input.pdf';
 *     var localFile = 'Result.pdf';
 *     var apiKey = 'Your API key here';
 * 
 *     var client = new selectpdf.PdfMergeClient(apiKey);
 * 
 *     // set parameters - see full list at https://selectpdf.com/pdf-merge-api/
 *     client
 *         // specify the pdf files that will be merged (order will be preserved in the final pdf)
 *         
 *         .addFile(testPdf) // add PDF from local file
 *         .addUrlFile(testUrl) // add PDF From public url
 *         //.addFile(testPdf, "pdf_password") // add PDF (that requires a password) from local file
 *         //.addUrlFile(testUrl, "pdf_password") // add PDF (that requires a password) from public url
 *     ;
 * 
 *     console.log('Starting pdf merge ...');
 * 
 *     // merge pdfs to local file
 *     client.saveToFile(localFile, 
 *         function(err, fileName) {
 *             if (err) return console.error("An error occurred: " + err);
 *             console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
 *         }
 *     );
 * 
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 */


"use strict";

var querystring = require('querystring');
var fs = require('fs');

/**
 * Version of SelectPdf Online API client library for Node.js.
 */
var CLIENT_VERSION = '1.6.0';

/**
 * Upgrade url reported by the demo exceptions when the server does not send one.
 * @private
 */
var DEMO_UPGRADE_URL = 'https://selectpdf.com/pricing/';

/**
 * Client library main exception.
 *
 * @param message Exception message.
 * @param code  Exception code.
 */
function ApiException(message, code = null) {
    this.message = message;
    this.code = code;
};

/**
 * Get complete error message.
 *
 * @returns Error message.
 */
ApiException.prototype.toString = function() {
    if (this.code === null)
        return this.message;
    else
        return '(' + this.code + ') ' + this.message;
};

/**
 * Exception raised when the keyless demo endpoint rate-limits the request (HTTP 429, or HTTP 503 when the demo is at capacity).
 * It is passed to the callback as the err parameter. Catch it with `err instanceof selectpdf.DemoRateLimitException`.
 *
 * @param statusCode HTTP status code of the response (429 or 503).
 * @param reason Rate limit reason reported by the server: per_ip, daily_cap or concurrency.
 * @param retryAfter Number of seconds to wait before retrying, from the Retry-After response header. 0 when the header is absent.
 * @param upgradeUrl Url where a paid API key can be obtained.
 * @param responseBody Raw JSON body of the error response.
 */
function DemoRateLimitException(statusCode, reason, retryAfter, upgradeUrl, responseBody) {
    var upgrade = upgradeUrl ? upgradeUrl : DEMO_UPGRADE_URL;
    var ra = retryAfter > 0 ? ' Retry after ' + retryAfter + 's.' : '';

    ApiException.call(this, 'Demo rate limit reached (reason=' + (reason ? reason : '?') + ').' + ra + ' Upgrade at ' + upgrade + '.', statusCode);

    /**
     * HTTP status code of the response (429 or 503).
     */
    this.statusCode = statusCode;

    /**
     * Rate limit reason reported by the server: per_ip, daily_cap or concurrency.
     */
    this.reason = reason ? reason : '';

    /**
     * Number of seconds to wait before retrying. 0 when the server did not send a Retry-After header.
     */
    this.retryAfter = retryAfter ? retryAfter : 0;

    /**
     * Url where a paid API key can be obtained.
     */
    this.upgradeUrl = upgrade;

    /**
     * Raw JSON body of the error response.
     */
    this.responseBody = responseBody;
};

DemoRateLimitException.prototype = Object.create(ApiException.prototype);
Object.defineProperty(DemoRateLimitException.prototype, 'constructor', {
    value: DemoRateLimitException,
    enumerable: false,
    writable: true
});

/**
 * Exception raised when the demo endpoint safety guard rejects a url (HTTP 400).
 * Demo conversions can only fetch public hosts - internal and private addresses are rejected.
 * It is passed to the callback as the err parameter. Catch it with `err instanceof selectpdf.DemoSafetyException`.
 *
 * @param statusCode HTTP status code of the response (400).
 * @param field Name of the parameter that was rejected (for example url, header_url, footer_url).
 * @param reason Reason reported by the server (for example private_ip).
 * @param responseBody Raw JSON body of the error response.
 */
function DemoSafetyException(statusCode, field, reason, responseBody) {
    ApiException.call(this, 'Demo safety guard rejected ' + (field ? field : '?') + ' (reason=' + (reason ? reason : '?') + '). Demo conversions cannot fetch internal/private hosts.', statusCode);

    /**
     * HTTP status code of the response (400).
     */
    this.statusCode = statusCode;

    /**
     * Name of the parameter that was rejected.
     */
    this.field = field ? field : '';

    /**
     * Reason reported by the server.
     */
    this.reason = reason ? reason : '';

    /**
     * Raw JSON body of the error response.
     */
    this.responseBody = responseBody;
};

DemoSafetyException.prototype = Object.create(ApiException.prototype);
Object.defineProperty(DemoSafetyException.prototype, 'constructor', {
    value: DemoSafetyException,
    enumerable: false,
    writable: true
});

/**
 * Exception raised when a feature is not available in demo mode.
 * It is raised by the server (HTTP 400) or directly by the client library, before any request is made,
 * when setUserPassword, setOwnerPassword or an asynchronous conversion is used on a client constructed without an API key.
 * The client library raises it from setters with throw and from conversion methods through the callback err parameter.
 * Catch it with `err instanceof selectpdf.DemoUnsupportedException`.
 *
 * @param statusCode HTTP status code of the response (400). When the exception is raised by the client library, call it with a single parameter: the name of the unsupported field.
 * @param field Name of the unsupported parameter (for example user_password, owner_password, async).
 * @param upgradeUrl Url where a paid API key can be obtained.
 * @param responseBody Raw JSON body of the error response.
 */
function DemoUnsupportedException(statusCode, field, upgradeUrl, responseBody) {
    if (typeof statusCode === 'string' && typeof field === 'undefined') {
        // raised by the client library: new DemoUnsupportedException(field)
        field = statusCode;

        ApiException.call(this, "Feature '" + (field ? field : '?') + "' is not available in demo mode. Construct HtmlToPdfClient with a paid API key, or upgrade at " + DEMO_UPGRADE_URL + ".");

        this.statusCode = 0;
        this.field = field ? field : '';
        this.upgradeUrl = DEMO_UPGRADE_URL;
        this.responseBody = null;
        return;
    }

    var upgrade = upgradeUrl ? upgradeUrl : DEMO_UPGRADE_URL;

    ApiException.call(this, "Feature '" + (field ? field : '?') + "' is not available in demo mode. Upgrade at " + upgrade + ".", statusCode);

    /**
     * HTTP status code of the response (400). 0 when the exception was raised by the client library, before any request was made.
     */
    this.statusCode = statusCode;

    /**
     * Name of the unsupported parameter.
     */
    this.field = field ? field : '';

    /**
     * Url where a paid API key can be obtained.
     */
    this.upgradeUrl = upgrade;

    /**
     * Raw JSON body of the error response. Null when the exception was raised by the client library.
     */
    this.responseBody = responseBody;
};

DemoUnsupportedException.prototype = Object.create(ApiException.prototype);
Object.defineProperty(DemoUnsupportedException.prototype, 'constructor', {
    value: DemoUnsupportedException,
    enumerable: false,
    writable: true
});

/**
 * Build a typed demo exception from the JSON error body returned by the demo endpoint.
 * Returns null if the body is not a recognized demo error.
 *
 * @param statusCode HTTP status code.
 * @param body Response body.
 * @param retryAfter Value of the Retry-After header in seconds (0 if absent).
 * @returns Exception or null.
 * @private
 */
function tryBuildDemoException(statusCode, body, retryAfter) {
    if (!body) return null;

    var json;
    try {
        json = JSON.parse(body);
    }
    catch (ex) {
        return null;
    }
    if (!json || typeof json !== 'object') return null;

    var jsonString = function(name) {
        var value = json[name];
        if (value === null || typeof value === 'undefined') return null;
        return String(value);
    };

    var error = jsonString('error');
    if (!error) return null;

    var reason = jsonString('reason');
    var field = jsonString('field');
    var upgrade = jsonString('upgrade');

    switch (error) {
        case 'rate_limited':
            return new DemoRateLimitException(statusCode, reason, retryAfter, upgrade, body);
        case 'unsafe_url':
            return new DemoSafetyException(statusCode, field, reason, body);
        case 'unsupported_in_demo':
            return new DemoUnsupportedException(statusCode, field, upgrade, body);
        case 'body_too_large':
            return new ApiException('Demo request body exceeds the demo cap. Upgrade at ' + (upgrade ? upgrade : DEMO_UPGRADE_URL) + '.', statusCode);
        default:
            return null;
    }
}

//
// Enumerations with the values accepted by the client library setters.
// Each setter also accepts the plain value (for example setPageSize('A4') is the same as setPageSize(selectpdf.PageSize.A4)).
//

/**
 * PDF page size.
 * 
 * Values: Custom, A0, A1, A2, A3, A4, A5, A6, A7, A8, Letter, HalfLetter, Ledger, Legal.
 */
var PageSize = Object.freeze({
    Custom: 'Custom', A0: 'A0', A1: 'A1', A2: 'A2', A3: 'A3', A4: 'A4', A5: 'A5', A6: 'A6', A7: 'A7', A8: 'A8',
    Letter: 'Letter', HalfLetter: 'HalfLetter', Ledger: 'Ledger', Legal: 'Legal'
});

/**
 * PDF page orientation.
 * 
 * Values: Portrait, Landscape.
 */
var PageOrientation = Object.freeze({ Portrait: 'Portrait', Landscape: 'Landscape' });

/**
 * Rendering engine used for the HTML to PDF conversion.
 * 
 * Values: WebKit, Restricted, Blink, Chromium.
 */
var RenderingEngine = Object.freeze({ WebKit: 'WebKit', Restricted: 'Restricted', Blink: 'Blink', Chromium: 'Chromium' });

/**
 * Protocol used for secure (HTTPS) connections.
 * 
 * Values: Tls11OrNewer (0), Tls10 (1), Ssl3 (2).
 */
var SecureProtocol = Object.freeze({ Tls11OrNewer: 0, Tls10: 1, Ssl3: 2 });

/**
 * The page layout to be used when the pdf document is opened in a viewer.
 * 
 * Values: SinglePage (0), OneColumn (1), TwoColumnLeft (2), TwoColumnRight (3).
 */
var PageLayout = Object.freeze({ SinglePage: 0, OneColumn: 1, TwoColumnLeft: 2, TwoColumnRight: 3 });

/**
 * The PDF document's page mode when it is opened in a viewer.
 * 
 * Values: UseNone (0), UseOutlines (1), UseThumbs (2), FullScreen (3), UseOC (4), UseAttachments (5).
 */
var PageMode = Object.freeze({ UseNone: 0, UseOutlines: 1, UseThumbs: 2, FullScreen: 3, UseOC: 4, UseAttachments: 5 });

/**
 * Alignment of the page numbers text.
 * 
 * Values: Left (1), Center (2), Right (3).
 */
var PageNumbersAlignment = Object.freeze({ Left: 1, Center: 2, Right: 3 });

/**
 * Converter startup mode.
 * 
 * Values: Automatic, Manual.
 */
var StartupMode = Object.freeze({ Automatic: 'Automatic', Manual: 'Manual' });

/**
 * The text layout of the text extracted from a PDF.
 * 
 * Values: Original (0), Reading (1).
 */
var TextLayout = Object.freeze({ Original: 0, Reading: 1 });

/**
 * The output format of the text extracted from a PDF.
 * 
 * Values: Text (0), Html (1).
 */
var OutputFormat = Object.freeze({ Text: 0, Html: 1 });

/**
 * PDF conformance target for the generated document.
 * Tagged standards (PdfA3A) require the Blink or Chromium rendering engine.
 * When no engine is specified the API promotes the request to Chromium and reports the engine used in the X-SelectPdf-Engine response header.
 * 
 * Values: Full, PdfA, PdfA2B, PdfA3A, PdfA3B, PdfA3U, PdfX, PdfSiqQ_A, PdfSiqQ_B.
 */
var PdfStandard = Object.freeze({
    Full: 'Full', PdfA: 'PdfA', PdfA2B: 'PdfA2B', PdfA3A: 'PdfA3A', PdfA3B: 'PdfA3B', PdfA3U: 'PdfA3U',
    PdfX: 'PdfX', PdfSiqQ_A: 'PdfSiqQ_A', PdfSiqQ_B: 'PdfSiqQ_B'
});

/**
 * The data profile of a ZUGFeRD / Factur-X hybrid electronic invoice.
 * The profile determines how much of the EN 16931 semantic model the embedded XML carries.
 * 
 * Values: Minimum, Basic_WL, Basic, En16931, Extended, XRechnung.
 */
var ZugferdProfile = Object.freeze({
    Minimum: 'Minimum', Basic_WL: 'Basic_WL', Basic: 'Basic', En16931: 'En16931', Extended: 'Extended', XRechnung: 'XRechnung'
});

/**
 * How the embedded invoice XML relates to the visible invoice page.
 * When not set, the API derives this from the profile: Alternative for Minimum and Basic_WL, Data for the rest.
 * 
 * Values: Data, Alternative, Source, Supplement.
 */
var ZugferdRelationship = Object.freeze({ Data: 'Data', Alternative: 'Alternative', Source: 'Source', Supplement: 'Supplement' });

/**
 * The metadata schema used to identify a hybrid invoice inside the PDF.
 * 
 * Values: FacturX10, Zugferd20.
 */
var ZugferdSchema = Object.freeze({ FacturX10: 'FacturX10', Zugferd20: 'Zugferd20' });

/**
 * Find the canonical enumeration value matching the specified value (case insensitive).
 *
 * @param enumeration Enumeration object.
 * @param value Value to look up.
 * @returns Canonical value or null if not found.
 * @private
 */
function canonicalEnumValue(enumeration, value) {
    if (value === null || typeof value === 'undefined') return null;
    var search = String(value).trim().toLowerCase();
    for (var name in enumeration) {
        if (String(enumeration[name]).toLowerCase() === search) return enumeration[name];
    }
    return null;
}

/**
 * List the values of an enumeration, for error messages.
 *
 * @param enumeration Enumeration object.
 * @returns Comma separated list of values.
 * @private
 */
function enumValuesList(enumeration) {
    var values = [];
    for (var name in enumeration) {
        values.push(enumeration[name]);
    }
    return values.join(', ');
}

/**
 * Base constructor for API clients. Do not use this directly. Use instead {@link #htmltopdfclient|HtmlToPdfClient}, {@link #pdfmergeclient|PdfMergeClient}, {@link #pdftotextclient|PdfToTextClient}, etc.
 */
function ApiClient() {
    /**
     * API endpoint
     */
    this.apiEndpoint = "https://selectpdf.com/api2/convert/";

    /**
     * API async jobs endpoint
     */
    this.apiAsyncEndpoint = "https://selectpdf.com/api2/asyncjob/";

    /**
     * API web elements endpoint
     */
    this.apiWebElementsEndpoint = "https://selectpdf.com/api2/webelements/";

    /**
     * Parameters that will be sent to the API.
     */
    this.parameters = {};

    /**
     * HTTP Headers that will be sent to the API.
     */
    this.headers = {};

    /**
     * Files that will be sent to the API.
     */
    this.files = {};

    /**
     * Binary data that will be sent to the API.
     */
    this.binaryData = {};

    /**
     * Number of pages of the pdf document resulted from the conversion.
     */
    this.numberOfPages = 0;

    /**
     * Job ID for asynchronous calls or for calls that require a second request.
     */
    this.jobId = "";

    /**
     * Last HTTP Code
     */
    this.lastHTTPCode = 0;

    /**
     * Subscription monthly conversion limit, parsed from the X-SelectPdf-Credits-Total response header.
     * -1 means unlimited. Null when the most recent response did not include it (demo endpoint, error responses).
     */
    this.creditsTotal = null;

    /**
     * Conversions remaining in the current month, parsed from the X-SelectPdf-Credits-Remaining response header.
     * -1 means unlimited. Null when the most recent response did not include it.
     */
    this.creditsRemaining = null;

    /**
     * Endpoint mode of the most recent response, parsed from the X-SelectPdf-Mode response header: "production" or "demo".
     * Empty string when the header is absent.
     */
    this.mode = "";

    /**
     * Server-side execution path of the most recent response, parsed from the X-SelectPdf-Execution response header: "in-process" or "worker".
     * Empty string when the header is absent.
     */
    this.executionMode = "";

    /**
     * Ping interval in seconds for asynchronous calls. Default value is 3 seconds.
     */
    this.AsyncCallsPingInterval = 3;

    /**
     * Maximum number of pings for asynchronous calls. Default value is 1,000 pings.
     */
    this.AsyncCallsMaxPings = 1000;

    this.MULTIPART_FORM_DATA_BOUNDARY = '------------SelectPdf_Api_Boundry_$';
    this.NEW_LINE = '\r\n';
};

/**
 * Set a custom SelectPdf API endpoint. Do not use this method unless advised by SelectPdf.
 *
 * @param apiEndpoint API endpoint.
 */
ApiClient.prototype.setApiEndpoint = function(apiEndpoint) {
    this.apiEndpoint = apiEndpoint;
};

/**
 * Set a custom SelectPdf API endpoint for async jobs. Do not use this method unless advised by SelectPdf.
 *
 * @param apiAsyncEndpoint API async jobs endpoint.
 */
ApiClient.prototype.setApiAsyncEndpoint = function(apiAsyncEndpoint) {
    this.apiAsyncEndpoint = apiAsyncEndpoint;
};

/**
 * Set a custom SelectPdf API endpoint for web elements. Do not use this method unless advised by SelectPdf.
 *
 * @param apiWebElementsEndpoint API web elements endpoint.
 */
ApiClient.prototype.setApiWebElementsEndpoint = function(apiWebElementsEndpoint) {
    this.apiWebElementsEndpoint = apiWebElementsEndpoint;
};

/**
 * Reset the results of the previous API call (number of pages, job id, response telemetry).
 */
ApiClient.prototype.resetResults = function() {
    this.numberOfPages = 0;
    this.jobId = '';
    this.lastHTTPCode = 0;
    this.creditsTotal = null;
    this.creditsRemaining = null;
    this.mode = '';
    this.executionMode = '';
};

/**
 * Read the standard SelectPdf response headers (X-SelectPdf-Pages, X-SelectPdf-Job-Id, X-SelectPdf-Credits-Total,
 * X-SelectPdf-Credits-Remaining, X-SelectPdf-Mode, X-SelectPdf-Execution).
 *
 * @param headers Response headers.
 */
ApiClient.prototype.readStandardResponseHeaders = function(headers) {
    if (!headers) return;

    var header = function(name) {
        var value = headers[name];
        if (Array.isArray(value)) value = value[0];
        if (value === null || typeof value === 'undefined') return '';
        return String(value).trim();
    };
    var integer = function(value) {
        if (!/^-?\d+$/.test(value)) return null;
        return parseInt(value, 10);
    };

    // the server sends both the X-SelectPdf-* form and the legacy lowercase form; prefer the new one
    var pages = integer(header('x-selectpdf-pages') || header('selectpdf-api-pages'));
    if (pages !== null) this.numberOfPages = pages;

    var jobId = header('x-selectpdf-job-id') || header('selectpdf-api-jobid');
    if (jobId) this.jobId = jobId;

    var total = integer(header('x-selectpdf-credits-total'));
    if (total !== null) this.creditsTotal = total;

    var remaining = integer(header('x-selectpdf-credits-remaining'));
    if (remaining !== null) this.creditsRemaining = remaining;

    var mode = header('x-selectpdf-mode');
    if (mode) this.mode = mode;

    var executionMode = header('x-selectpdf-execution');
    if (executionMode) this.executionMode = executionMode;
};

/**
 * Hook called after a successful response (200 OK or 202 Accepted), with the response headers.
 * Subclasses override it to capture endpoint-specific headers. The default implementation does nothing.
 *
 * @param headers Response headers.
 */
ApiClient.prototype.onResponseHeadersReceived = function(headers) {
};

/**
 * Send a POST request with the specified body and handle the response.
 *
 * @param contentType Content type of the request body.
 * @param postData Request body (Buffer).
 * @param callback Callback function(err, data). err will contain the error, if any. If there is no error, data will contain data received.
 */
ApiClient.prototype.performRequest = function(contentType, postData, callback) {
    // reset results
    this.resetResults();

    var http = require('http');

    if (this.apiEndpoint.indexOf("https") === 0) {
        http = require('https');
    }

    const options = {
      method: 'POST',
      // The API can return large response headers (for example the web elements locations when
      // pdf_web_elements_selectors is set) - allow up to 100MB, like the .NET client, instead of the 16KB default.
      // Older Node.js versions (before 12.15 / 13.3) ignore this option.
      maxHeaderSize: 100 * 1024 * 1024,
      headers: {
        'Content-Type': contentType,
        'Content-Length': postData.length,
        'selectpdf-api-client': `nodejs-${process.version}-${CLIENT_VERSION}`
      }
    };

    // add custom headers
    for(var header in this.headers) {
        options.headers[header] = this.headers[header];
    }

    var finished = false;
    var done = function(err, data) {
        if (finished) return;
        finished = true;
        callback(err, data);
    };

    const request = http.request(this.apiEndpoint, options, (response) => {
        this.lastHTTPCode = response.statusCode;

        var content = [];

        response.on('data', (chunk) => {
            content.push(chunk);
        });

        response.on('end', () => {
            var buffer = Buffer.concat(content);

            if (response.statusCode == 200 || response.statusCode == 202) {
                this.readStandardResponseHeaders(response.headers);
                try { this.onResponseHeadersReceived(response.headers); } catch (ex) { }

                if (response.statusCode == 200) {
                    // OK
                    done(null, buffer);
                }
                else {
                    // Accepted - request accepted (for asynchronous jobs)
                    done(null, null);
                }
            }
            else {
                // Error
                var message = buffer.toString();
                var responseContentType = response.headers['content-type'] || '';

                // The demo endpoint returns JSON error bodies for 400 / 413 / 429 / 503.
                // Parse those into typed exceptions so callers can react programmatically.
                if (responseContentType.toLowerCase().indexOf('application/json') >= 0) {
                    var retryAfter = parseInt(response.headers['retry-after'], 10);
                    var demoException = tryBuildDemoException(response.statusCode, message, isNaN(retryAfter) ? 0 : retryAfter);
                    if (demoException) return done(demoException);
                }

                done(new ApiException(message, response.statusCode));
            }
        });

        response.on('error', (e) => {
            done(new ApiException(e.toString()));
        });
    });

    request.setTimeout(6000000, function() { // 6,000,000ms=6,000s=100min
        request.abort();
    });

    request.on('error', (e) => {
        done(new ApiException(e.toString()));
    });

    // Write data to request body
    request.write(postData);
    request.end();
};

/**
 * Create a POST request.
 *
 * @param callback Callback function(err, data). err will contain the error message, if any. If there is no error, data will contain data received.
 */
ApiClient.prototype.performPost = function(callback) {
    const postData = Buffer.from(querystring.stringify(this.parameters), 'utf8');

    this.performRequest('application/x-www-form-urlencoded', postData, callback);
};

/**
 * Create a multipart/form-data POST request (that can handle file uploads).
 *
 * @param callback Callback function(err, data). err will contain the error message, if any. If there is no error, data will contain data received.
 */
ApiClient.prototype.performPostAsMultipartFormData = function(callback) {
    var postData;

    try {
        postData = this.encodeMultipartFormData();
    }
    catch (ex) {
        callback(new ApiException('Could not encode the request data. ' + ex));
        return;
    }

    this.performRequest('multipart/form-data; boundary=' + this.MULTIPART_FORM_DATA_BOUNDARY, postData, callback);
};


 /**
 * Encode data for multipart/form-data POST
 *
 * @returns Encoded data (Buffer).
 */
ApiClient.prototype.encodeMultipartFormData = function() {
    var allData = [];
    var newLine = Buffer.from(this.NEW_LINE, 'utf8');
    var boundary = this.MULTIPART_FORM_DATA_BOUNDARY;
    var text = function(value) {
        return Buffer.from(value, 'utf8');
    };

    // encode regular parameters (empty values are not sent)
    for(var parameter in this.parameters) {
        var value = this.parameters[parameter];
        if (value !== null && typeof value !== 'undefined' && value !== '') {
            allData.push(text('--' + boundary + this.NEW_LINE));
            allData.push(text('Content-Disposition: form-data; name="' + parameter + '"' + this.NEW_LINE));
            allData.push(newLine);
            allData.push(text(String(value)));
            allData.push(newLine);
        }
    }

    // encode files
    for(var file in this.files) {
        if (this.files[file]) {
            allData.push(text('--' + boundary + this.NEW_LINE));
            allData.push(text('Content-Disposition: form-data; name="' + file + '"; filename="' + this.files[file] + '"' + this.NEW_LINE));
            allData.push(text('Content-Type: application/octet-stream' + this.NEW_LINE));
            allData.push(newLine);
            allData.push(fs.readFileSync(this.files[file]));
            allData.push(newLine);
        }
    }

    // encode additional binary data
    for(var data in this.binaryData) {
        if (this.binaryData[data]) {
            allData.push(text('--' + boundary + this.NEW_LINE));
            allData.push(text('Content-Disposition: form-data; name="' + data + '"; filename="' + data + '"' + this.NEW_LINE));
            allData.push(text('Content-Type: application/octet-stream' + this.NEW_LINE));
            allData.push(newLine);
            allData.push(Buffer.isBuffer(this.binaryData[data]) ? this.binaryData[data] : text(String(this.binaryData[data])));
            allData.push(newLine);
        }
    }

    // final boundary
    allData.push(text('--' + boundary + '--' + this.NEW_LINE));

    return Buffer.concat(allData);
}

/**
 * Start an asynchronous job.
 *
 * @param callback Callback function(err, jobId). err will contain the error message, if any. If there is no error, jobId will be set.
 */
ApiClient.prototype.startAsyncJob = function(callback) {
    this.parameters['async'] = 'True';

    var currentObject = this;

    this.performPost(function(err, data) {
        if (err) {
            return callback(err);
        }
        callback(err, currentObject.jobId);
    });
}

/**
 * Start an asynchronous job that requires multipart forma data.
 *
 * @param callback Callback function(err, jobId). err will contain the error message, if any. If there is no error, jobId will be set.
 */
ApiClient.prototype.startAsyncJobMultipartFormData = function(callback) {
    this.parameters['async'] = 'True';

    var currentObject = this;

    this.performPostAsMultipartFormData(function(err, data) {
        if (err) {
            return callback(err);
        }
        callback(err, currentObject.jobId);
    });
}

/**
 * Start an asynchronous job, wait for it to finish and return its result.
 *
 * @param multipartFormData Use a multipart/form-data request to start the job (true) or a regular POST (false).
 * @param callback Callback function(err, data). err will contain the error, if any. If there is no error, data will contain data received.
 */
ApiClient.prototype.runAsyncJob = function(multipartFormData, callback) {
    var currentObject = this;

    var start = multipartFormData ? this.startAsyncJobMultipartFormData : this.startAsyncJob;

    start.call(this, function(err, JobID) {
        if (err) return callback(new ApiException('An error occurred launching the asynchronous call. ' + err));
        if (!JobID) return callback(new ApiException('An error occurred launching the asynchronous call.'));

        var asyncJobClient = new AsyncJobClient(currentObject.parameters['key'], JobID);
        asyncJobClient.apiEndpoint = currentObject.apiAsyncEndpoint;
        asyncJobClient.AsyncCallsMaxPings = currentObject.AsyncCallsMaxPings;
        asyncJobClient.AsyncCallsPingInterval = currentObject.AsyncCallsPingInterval;

        asyncJobClient.getResult(function(errAsyncJob, data, numberOfPages) {
            currentObject.numberOfPages = numberOfPages || 0;

            // response telemetry of the final response
            if (asyncJobClient.creditsTotal !== null) currentObject.creditsTotal = asyncJobClient.creditsTotal;
            if (asyncJobClient.creditsRemaining !== null) currentObject.creditsRemaining = asyncJobClient.creditsRemaining;
            if (asyncJobClient.mode) currentObject.mode = asyncJobClient.mode;
            if (asyncJobClient.executionMode) currentObject.executionMode = asyncJobClient.executionMode;

            callback(errAsyncJob, data);
        });
    });
};

/**
 * Get the number of pages of the PDF document resulted from the API call.
 *
 * @returns Number of pages of the PDF document.
 */
ApiClient.prototype.getNumberOfPages = function() {
    return this.numberOfPages;
}

/**
 * Get the subscription monthly conversion limit reported by the server (X-SelectPdf-Credits-Total response header).
 *
 * @returns Monthly conversion limit. -1 means unlimited. Null when the most recent response did not include credit information (demo endpoint, error response).
 */
ApiClient.prototype.getCreditsTotal = function() {
    return this.creditsTotal;
}

/**
 * Get the number of conversions remaining in the current month reported by the server (X-SelectPdf-Credits-Remaining response header).
 *
 * @returns Conversions remaining. -1 means unlimited. Null when the most recent response did not include credit information (demo endpoint, error response).
 */
ApiClient.prototype.getCreditsRemaining = function() {
    return this.creditsRemaining;
}

/**
 * Get the endpoint mode of the most recent response (X-SelectPdf-Mode response header).
 *
 * @returns "production" or "demo". Empty string when the response did not include the header.
 */
ApiClient.prototype.getMode = function() {
    return this.mode;
}

/**
 * Get the server-side execution path of the most recent response (X-SelectPdf-Execution response header).
 *
 * @returns "in-process" or "worker". Empty string for endpoints that do not perform a conversion (for example usage).
 */
ApiClient.prototype.getExecutionMode = function() {
    return this.executionMode;
}

/**
 * Serialize boolean values as "True" or "False" for the API.
 *
 * @returns Serialized value.
 */
ApiClient.prototype.serializeBoolean = function(value) {
    if (typeof value === 'undefined' || value === null) {
        value = false;
    }
    else {
        switch(value.toString().toLowerCase().trim()) {
            case "false": case "no": case "0": case "off": case "": value = false;
        }
    }
    return (value) ? 'True' : 'False'
}

/**
 * Html To Pdf Conversion with SelectPdf Online API.
 *
 * Pass a paid API key for production use. Construct the client without an API key, with an empty string, or with "demo" (case insensitive)
 * to use the keyless demo endpoint - the output is watermarked and capped at 5 pages and it is always rendered with the Chromium engine,
 * but no signup is required. In demo mode setUserPassword, setOwnerPassword and the asynchronous conversions raise DemoUnsupportedException,
 * and the demo endpoint can answer with DemoRateLimitException or DemoSafetyException.
 *
 * @param apiKey API key. Leave it out (or pass null, an empty string or "demo") to use the keyless demo endpoint.
 *
 * @example <caption>Html to Pdf in NodeJS with SelectPdf online REST API:</caption>
 * var selectpdf = require('selectpdf');
 *
 * console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);
 *
 * try {
 *     var url = 'https://selectpdf.com';
 *     var localFile = 'Test.pdf'
 *     var apiKey = 'Your API key here'; // or null to use the keyless demo endpoint
 *
 *     var client = new selectpdf.HtmlToPdfClient(apiKey);
 *
 *     // set parameters - see full list at https://selectpdf.com/html-to-pdf-api/
 *     client
 *         // main properties
 *
 *         .setPageSize('A4') // PDF page size
 *         .setPageOrientation('Portrait') // PDF page orientation
 *         .setMargins(0) // PDF page margins
 *         .setRenderingEngine('WebKit') // rendering engine (demo mode forces Chromium)
 *         .setConversionDelay(1) // conversion delay
 *         .setNavigationTimeout(30) // navigation timeout
 *         .setShowPageNumbers(false) // page numbers
 *         .setPageBreaksEnhancedAlgorithm(true) // enhanced page break algorithm
 *
 *         // additional properties
 *
 *         // .setUseCssPrint('True') // enable CSS media print
 *         // .setDisableJavascript('True') // disable javascript
 *         // .setDisableInternalLinks('True') // disable internal links
 *         // .setDisableExternalLinks('True') // disable external links
 *         // .setKeepImagesTogether('True') // keep images together
 *         // .setScaleImages('True') // scale images to create smaller pdfs
 *         // .setSinglePagePdf('True') // generate a single page PDF
 *         // .setUserPassword('password') // secure the PDF with a password (paid keys only)
 *
 *         // generate automatic bookmarks
 *
 *         // .setPdfBookmarksSelectors('H1, H2') // create outlines (bookmarks) for the specified elements
 *         // .setViewerPageMode(1) // display outlines (bookmarks) in viewer
 *     ;
 *
 *     console.log("Starting conversion ...");
 *
 *     // convert url to file
 *     client.convertUrlToFile(url, localFile,
 *         function(err, fileName) {
 *             if (err instanceof selectpdf.DemoRateLimitException)
 *                 return console.log("Demo rate limit (" + err.reason + "). Retry after " + err.retryAfter + "s. Upgrade: " + err.upgradeUrl);
 *             if (err) return console.log("An error occurred: " + err);
 *
 *             console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
 *             console.log("Mode: " + client.getMode() + ". Credits remaining: " + client.getCreditsRemaining() + " / " + client.getCreditsTotal() + ".");
 *         }
 *     );
 *
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 *
 */
function HtmlToPdfClient(apiKey) {
    ApiClient.call(this);

    var demo = (apiKey === null || typeof apiKey === 'undefined' || String(apiKey).trim() === '' || String(apiKey).trim().toLowerCase() === 'demo');

    /**
     * True if the client was constructed for the keyless demo endpoint (API key missing, empty or "demo").
     */
    this.demoMode = demo;

    /**
     * Names of the parameters the demo endpoint clamped on the most recent conversion (X-SelectPdf-Demo-Clamped response header).
     */
    this.clampedFields = [];

    /**
     * Names of the parameters the demo endpoint dropped on the most recent conversion (X-SelectPdf-Demo-Dropped response header).
     */
    this.droppedFields = [];

    if (demo) {
        // Demo is keyless - no key parameter is sent.
        this.apiEndpoint = "https://selectpdf.com/api2/convert/demo/";
    }
    else {
        this.apiEndpoint = "https://selectpdf.com/api2/convert/";
        this.parameters["key"] = apiKey;
    }
};

HtmlToPdfClient.prototype = Object.create(ApiClient.prototype);
Object.defineProperty(HtmlToPdfClient.prototype, 'constructor', {
    value: HtmlToPdfClient,
    enumerable: false,
    writable: true
});

/**
 * Split a comma separated header value into a list of field names.
 *
 * @param value Header value.
 * @returns List of field names.
 * @private
 */
function splitFieldList(value) {
    if (Array.isArray(value)) value = value.join(',');
    if (value === null || typeof value === 'undefined' || String(value).trim() === '') return [];
    return String(value).split(',').map(function(field) { return field.trim(); }).filter(function(field) { return field !== ''; });
}

/**
 * Reset the results of the previous API call, including the demo clamped and dropped fields.
 */
HtmlToPdfClient.prototype.resetResults = function() {
    ApiClient.prototype.resetResults.call(this);
    this.clampedFields = [];
    this.droppedFields = [];
};

/**
 * Capture the demo endpoint response headers (clamped and dropped fields).
 *
 * @param headers Response headers.
 */
HtmlToPdfClient.prototype.onResponseHeadersReceived = function(headers) {
    this.clampedFields = splitFieldList(headers['x-selectpdf-demo-clamped']);
    this.droppedFields = splitFieldList(headers['x-selectpdf-demo-dropped']);
};

/**
 * Check if the client was constructed for the keyless demo endpoint (API key missing, empty or "demo").
 * Set at construction time - changing the endpoint does not change it.
 *
 * @returns True if the client is in demo mode.
 */
HtmlToPdfClient.prototype.isDemoMode = function() {
    return this.demoMode;
};

/**
 * Check if the most recent response came from the demo endpoint (the X-SelectPdf-Mode response header is "demo").
 *
 * @returns True if the most recent response is a demo response.
 */
HtmlToPdfClient.prototype.isDemoResponse = function() {
    return !!this.mode && this.mode.toLowerCase() === 'demo';
};

/**
 * Get the names of the parameters the demo endpoint clamped on the most recent conversion (for example max_load_time).
 * Clamped means the value was modified (capped or force-set), not discarded. Empty for non-demo responses.
 *
 * @returns List of parameter names.
 */
HtmlToPdfClient.prototype.getClampedFields = function() {
    return this.clampedFields;
};

/**
 * Check if the demo endpoint clamped any parameter on the most recent conversion.
 *
 * @returns True if any parameter was clamped.
 */
HtmlToPdfClient.prototype.wasClamped = function() {
    return this.clampedFields.length > 0;
};

/**
 * Get the names of the parameters the demo endpoint dropped on the most recent conversion (for example auth_username, cookies_string).
 * The demo endpoint does not honor auth credentials, cookies, the pdf name, async and the web elements selectors. Empty for non-demo responses.
 *
 * @returns List of parameter names.
 */
HtmlToPdfClient.prototype.getDroppedFields = function() {
    return this.droppedFields;
};

/**
 * Check if the demo endpoint dropped any parameter on the most recent conversion.
 *
 * @returns True if any parameter was dropped.
 */
HtmlToPdfClient.prototype.wasAnyFieldDropped = function() {
    return this.droppedFields.length > 0;
};

/**
 * Convert the specified url to PDF. SelectPdf online API can convert http:// and https:// publicly available urls.
 * 
 * @param url Address of the web page being converted.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
HtmlToPdfClient.prototype.convertUrl = function(url, callback) {
    if (!url.match(/^https?:\/\/.*$/i)) {
        callback(new ApiException('The supported protocols for the converted webpage are http:// and https://.'));
        return;
    }

    this.parameters['url'] = url;
    this.parameters['html'] = '';
    this.parameters['base_url'] = '';
    this.parameters['async'] = 'False';

    this.performPost(callback);
};

/**
 * Convert the specified url to PDF. SelectPdf online API can convert http:// and https:// publicly available urls.
 * 
 * @param url Address of the web page being converted.
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
HtmlToPdfClient.prototype.convertUrlToFile = function(url, filePath, callback) {
    if (!filePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.convertUrl(url, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(filePath, data, 'binary', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", filePath);
                    callback(null, filePath);
                }
            });
        
        }
    });
};

/**
 * Convert the specified url to PDF using an asynchronous call. SelectPdf online API can convert http:// and https:// publicly available urls.
 * Asynchronous calls are not available in demo mode: the callback receives DemoUnsupportedException.
 * 
 * @param url Address of the web page being converted.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
HtmlToPdfClient.prototype.convertUrlAsync = function(url, callback) {
    if (this.demoMode) {
        // asynchronous conversions are not available on the keyless demo endpoint
        callback(new DemoUnsupportedException('async'));
        return;
    }

    if (!url.match(/^https?:\/\/.*$/i)) {
        callback(new ApiException('The supported protocols for the converted webpage are http:// and https://.'));
        return;
    }

    this.parameters['url'] = url;
    this.parameters['html'] = '';
    this.parameters['base_url'] = '';

    this.runAsyncJob(false, callback);
};

/**
 * Convert the specified url to PDF with an asynchronous call and writes the resulted PDF to a local file. 
 * SelectPdf online API can convert http:// and https:// publicly available urls.
 * 
 * @param url Address of the web page being converted.
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
HtmlToPdfClient.prototype.convertUrlToFileAsync = function(url, filePath, callback) {
    if (!filePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.convertUrlAsync(url, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(filePath, data, 'binary', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", filePath);
                    callback(null, filePath);
                }
            });
        
        }
    });
};

/**
 * Convert the specified HTML string to PDF. Use a base url to resolve relative paths to resources.
 * 
 * @param htmlString HTML string with the content being converted.
 * @param baseUrl Base url used to resolve relative paths to resources (css, images, javascript, etc). Must be a http:// or https:// publicly available url.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
 HtmlToPdfClient.prototype.convertHtmlStringWithBaseUrl = function(htmlString, baseUrl, callback) {
    this.parameters['async'] = 'False';
    this.parameters['url'] = '';
    this.parameters['html'] = htmlString;

    if (baseUrl)
        this.parameters['base_url'] = baseUrl;

    this.performPost(callback);
};

/**
 * Convert the specified HTML string to PDF and writes the resulted PDF to a local file. Use a base url to resolve relative paths to resources.
 * 
 * @param htmlString HTML string with the content being converted.
 * @param baseUrl Base url used to resolve relative paths to resources (css, images, javascript, etc). Must be a http:// or https:// publicly available url.
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
HtmlToPdfClient.prototype.convertHtmlStringWithBaseUrlToFile = function(htmlString, baseUrl, filePath, callback) {
    if (!filePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.convertHtmlStringWithBaseUrl(htmlString, baseUrl, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(filePath, data, 'binary', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", filePath);
                    callback(null, filePath);
                }
            });
        
        }
    });
};

/**
 * Convert the specified HTML string to PDF with an asynchronous call. Use a base url to resolve relative paths to resources.
 * Asynchronous calls are not available in demo mode: the callback receives DemoUnsupportedException.
 * 
 * @param htmlString HTML string with the content being converted.
 * @param baseUrl Base url used to resolve relative paths to resources (css, images, javascript, etc). Must be a http:// or https:// publicly available url.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
HtmlToPdfClient.prototype.convertHtmlStringWithBaseUrlAsync = function(htmlString, baseUrl, callback) {
    if (this.demoMode) {
        // asynchronous conversions are not available on the keyless demo endpoint
        callback(new DemoUnsupportedException('async'));
        return;
    }

    this.parameters['url'] = '';
    this.parameters['html'] = htmlString;

    if (baseUrl)
        this.parameters['base_url'] = baseUrl;

    this.runAsyncJob(false, callback);
};

/**
 * Convert the specified HTML string to PDF with an asynchronous call and writes the resulted PDF to a local file. 
 * Use a base url to resolve relative paths to resources.
 * 
 * @param htmlString HTML string with the content being converted.
 * @param baseUrl Base url used to resolve relative paths to resources (css, images, javascript, etc). Must be a http:// or https:// publicly available url.
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
HtmlToPdfClient.prototype.convertHtmlStringWithBaseUrlToFileAsync = function(htmlString, baseUrl, filePath, callback) {
    if (!filePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.convertHtmlStringWithBaseUrlAsync(htmlString, baseUrl, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(filePath, data, 'binary', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", filePath);
                    callback(null, filePath);
                }
            });
        
        }
    });
};

/**
 * Convert the specified HTML string to PDF.
 * 
 * @param htmlString HTML string with the content being converted.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
 HtmlToPdfClient.prototype.convertHtmlString = function(htmlString, callback) {
    this.convertHtmlStringWithBaseUrl(htmlString, '', callback);
};

/**
 * Convert the specified HTML string to PDF and writes the resulted PDF to a local file.
 * 
 * @param htmlString HTML string with the content being converted.
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
HtmlToPdfClient.prototype.convertHtmlStringToFile = function(htmlString, filePath, callback) {
    this.convertHtmlStringWithBaseUrlToFile(htmlString, '', filePath, callback);
};

/**
 * Convert the specified HTML string to PDF with an asynchronous call.
 * 
 * @param htmlString HTML string with the content being converted.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
HtmlToPdfClient.prototype.convertHtmlStringAsync = function(htmlString, callback) {
    this.convertHtmlStringWithBaseUrlAsync(htmlString, '', callback);
};

/**
 * Convert the specified HTML string to PDF with an asynchronous call and writes the resulted PDF to a local file. 
 * 
 * @param htmlString HTML string with the content being converted.
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
HtmlToPdfClient.prototype.convertHtmlStringToFileAsync = function(htmlString, filePath, callback) {
    this.convertHtmlStringWithBaseUrlToFileAsync(htmlString, '', filePath, callback);
};

/**
* Set PDF page size. Default value is A4.
* If page size is set to Custom, use setPageWidth and setPageHeight methods to set the custom width/height of the PDF pages.
*
* @param pageSize PDF page size. Allowed values for Page Size: Custom, A0, A1, A2, A3, A4, A5, A6, A7, A8, Letter, HalfLetter, Ledger, Legal.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageSize = function(pageSize) {
    if (!pageSize.match(/^(Custom|A0|A1|A2|A3|A4|A5|A6|A7|A8|Letter|HalfLetter|Ledger|Legal)$/i)) {
        throw new ApiException('Allowed values for Page Size: Custom, A0, A1, A2, A3, A4, A5, A6, A7, A8, Letter, HalfLetter, Ledger, Legal.');
    }
    
    this.parameters['page_size'] = pageSize;
    return this;
};

/**
* Set PDF page width in points. Default value is 595pt (A4 page width in points). 1pt = 1/72 inch.
* This is taken into account only if page size is set to Custom using setPageSize method.
*
* @param pageWidth Page width in points.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageWidth = function(pageWidth) {
    if (!Number.isInteger(pageWidth)) {
        throw new ApiException('Page width must be an integer number.');        
    } 
    
    this.parameters['page_width'] = pageWidth;
    return this;
};

/**
* Set PDF page height in points. Default value is 842pt (A4 page height in points). 1pt = 1/72 inch.
* This is taken into account only if page size is set to Custom using setPageSize method.
*
* @param pageHeight Page height in points.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageHeight = function(pageHeight) {
    if (!Number.isInteger(pageHeight)) {
        throw new ApiException('Page height must be an integer number.');        
    } 
    
    this.parameters['page_height'] = pageHeight;
    return this;
};

/**
* Set PDF page orientation. Default value is Portrait.
*
* @param pageOrientation PDF page orientation. Allowed values for Page Orientation: Portrait, Landscape.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageOrientation = function(pageOrientation) {
    if (!pageOrientation.match(/^(Portrait|Landscape)$/i)) {
        throw new ApiException('Allowed values for Page Orientation: Portrait, Landscape.');
    }
    
    this.parameters['page_orientation'] = pageOrientation;
    return this;
};

/**
* Set top margin of the PDF pages. Default value is 5pt.
*
* @param marginTop Margin value in points. 1pt = 1/72 inch.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setMarginTop = function(marginTop) {
    if (!Number.isInteger(marginTop)) {
        throw new ApiException('Margin value must be an integer number.');        
    } 
    
    this.parameters['margin_top'] = marginTop;
    return this;
};

/**
* Set right margin of the PDF pages. Default value is 5pt.
*
* @param marginRight Margin value in points. 1pt = 1/72 inch.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setMarginRight = function(marginRight) {
    if (!Number.isInteger(marginRight)) {
        throw new ApiException('Margin value must be an integer number.');        
    } 
    
    this.parameters['margin_right'] = marginRight;
    return this;
};

/**
* Set bottom margin of the PDF pages. Default value is 5pt.
*
* @param marginBottom Margin value in points. 1pt = 1/72 inch.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setMarginBottom = function(marginBottom) {
    if (!Number.isInteger(marginBottom)) {
        throw new ApiException('Margin value must be an integer number.');        
    } 
    
    this.parameters['margin_bottom'] = marginBottom;
    return this;
};

/**
* Set left margin of the PDF pages. Default value is 5pt.
*
* @param marginLeft Margin value in points. 1pt = 1/72 inch.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setMarginLeft = function(marginLeft) {
    if (!Number.isInteger(marginLeft)) {
        throw new ApiException('Margin value must be an integer number.');        
    } 
    
    this.parameters['margin_left'] = marginLeft;
    return this;
};

/**
* Set all margins of the PDF pages to the same value. Default value is 5pt.
*
* @param margin Margin value in points. 1pt = 1/72 inch.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setMargins = function(margin) {
    return this.setMarginTop(margin).setMarginRight(margin).setMarginBottom(margin).setMarginLeft(margin);
};

/**
* Specify the name of the pdf document that will be created. The default value is Document.pdf.
*
* @param pdfName Name of the generated PDF document.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPdfName = function(pdfName) {
    this.parameters['pdf_name'] = pdfName;
    return this;
};

/**
* Set the rendering engine used for the HTML to PDF conversion. Default value is WebKit.
* The keyless demo endpoint always uses Chromium.
*
* @param renderingEngine HTML rendering engine. Allowed values for Rendering Engine: WebKit, Restricted, Blink, Chromium (see RenderingEngine).
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setRenderingEngine = function(renderingEngine) {
    if (!String(renderingEngine).match(/^(WebKit|Restricted|Blink|Chromium)$/i)) {
        throw new ApiException('Allowed values for Rendering Engine: WebKit, Restricted, Blink, Chromium.');
    }

    this.parameters['engine'] = renderingEngine;
    return this;
};

/**
* Produce a tagged, accessible PDF: a logical structure tree covering headings, paragraphs, lists, tables,
* figures with alternate text, links and reading order. Default is False.
*
* Requires the Blink or Chromium rendering engine - the WebKit engines cannot produce a structure tree.
* If no engine is set, the API promotes the request to Chromium and reports it in the X-SelectPdf-Engine response header.
* Setting an explicit WebKit engine together with tagged output is rejected by the API.
* A tagged document also needs a title, so set setDocTitle - the converter falls back to the HTML document title when it is not set.
*
* @param tagged Produce a tagged, accessible PDF.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setTagged = function(tagged) {
    this.parameters['tagged'] = this.serializeBoolean(tagged);
    return this;
};

/**
* Set the PDF conformance target - PDF/A for archiving, PDF/X for graphics exchange, PDF/SiqQ for digital signatures. Default is Full.
* PdfA3A is the accessible level of PDF/A-3: it implies a tagged document, so it carries the same rendering engine requirement as setTagged.
*
* @param pdfStandard PDF conformance target. Allowed values for PDF Standard: Full, PdfA, PdfA2B, PdfA3A, PdfA3B, PdfA3U, PdfX, PdfSiqQ_A, PdfSiqQ_B (see PdfStandard).
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPdfStandard = function(pdfStandard) {
    var value = canonicalEnumValue(PdfStandard, pdfStandard);
    if (value === null) {
        throw new ApiException('Allowed values for PDF Standard: ' + enumValuesList(PdfStandard) + '.');
    }

    this.parameters['pdf_standard'] = value;
    return this;
};

/**
* Set the natural language of the document, for example "en-US" or "de-DE".
* Written as the PDF /Lang entry and onto tagged structure elements. Default is "en-US".
*
* @param documentLanguage Language tag, for example "en-US".
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDocumentLanguage = function(documentLanguage) {
    this.parameters['doc_language'] = documentLanguage;
    return this;
};

/**
* Set PDF user password. Not available in demo mode: throws DemoUnsupportedException if the client was constructed without an API key.
*
* @param userPassword PDF user password.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setUserPassword = function(userPassword) {
    if (this.demoMode && userPassword) {
        throw new DemoUnsupportedException('user_password');
    }

    this.parameters['user_password'] = userPassword;
    return this;
};

/**
* Set PDF owner password. Not available in demo mode: throws DemoUnsupportedException if the client was constructed without an API key.
*
* @param ownerPassword PDF owner password.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setOwnerPassword = function(ownerPassword) {
    if (this.demoMode && ownerPassword) {
        throw new DemoUnsupportedException('owner_password');
    }

    this.parameters['owner_password'] = ownerPassword;
    return this;
};

/**
* Set the width used by the converter's internal browser window in pixels. The default value is 1024px.
*
* @param webPageWidth Browser window width in pixels.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setWebPageWidth = function(webPageWidth) {
    if (!Number.isInteger(webPageWidth)) {
        throw new ApiException('Web page width must be an integer number.');        
    } 
    
    this.parameters['web_page_width'] = webPageWidth;
    return this;
};

/**
* Set the height used by the converter's internal browser window in pixels. 
* The default value is 0px and it means that the page height is automatically calculated by the converter.
*
* @param webPageHeight Browser window height in pixels. Set it to 0px to automatically calculate page height.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setWebPageHeight = function(webPageHeight) {
    if (!Number.isInteger(webPageHeight)) {
        throw new ApiException('Web page height must be an integer number.');        
    } 
    
    this.parameters['web_page_height'] = webPageHeight;
    return this;
};

/**
* Leave out the content below the web page height (set with setWebPageHeight) instead of letting the page flow onto further pages.
*
* When not set, each rendering engine keeps its own behavior: WebKit and WebKit Restricted leave the content out whenever a web page height is set,
* Blink and Chromium convert the whole page. Set it to True or False to choose explicitly. It needs a non-zero web page height; with 0 there is no
* height to fix the page at and the setting is ignored. With WebKit, a fixed size also cuts off content wider than the web page width.
*
* @param webPageFixedSize True to cut the page at the web page height, False to convert the whole page.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setWebPageFixedSize = function(webPageFixedSize) {
    this.parameters['web_page_fixed_size'] = this.serializeBoolean(webPageFixedSize);
    return this;
};

/**
* Introduce a delay (in seconds) before the actual conversion to allow the web page to fully load.
* This method is an alias for setConversionDelay. The default value is 1 second. 
* Use a larger value if the web page has content that takes time to render when it is displayed in the browser.
*
* @param minLoadTime Delay in seconds.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setMinLoadTime = function(minLoadTime) {
    if (!Number.isInteger(minLoadTime)) {
        throw new ApiException('Time must be an integer number.');        
    } 
    
    this.parameters['min_load_time'] = minLoadTime;
    return this;
};

/**
* Introduce a delay (in seconds) before the actual conversion to allow the web page to fully load.
* This method is an alias for setMinLoadTime. The default value is 1 second. 
* Use a larger value if the web page has content that takes time to render when it is displayed in the browser.
*
* @param delay Delay in seconds.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setConversionDelay = function(delay) {
    return this.setMinLoadTime(delay);
};

/**
* Set the maximum amount of time (in seconds) that the converter will wait for the page to load.
* This method is an alias for setNavigationTimeout. A timeout error is displayed when this time elapses. 
* The default value is 30 seconds. Use a larger value (up to 120 seconds allowed) for pages that take a long time to load.
*
* @param maxLoadTime Timeout in seconds.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setMaxLoadTime = function(maxLoadTime) {
    if (!Number.isInteger(maxLoadTime)) {
        throw new ApiException('Time must be an integer number.');        
    } 
    
    this.parameters['max_load_time'] = maxLoadTime;
    return this;
};

/**
* Set the maximum amount of time (in seconds) that the converter will wait for the page to load.
* This method is an alias for setMaxLoadTime. A timeout error is displayed when this time elapses. 
* The default value is 30 seconds. Use a larger value (up to 120 seconds allowed) for pages that take a long time to load.
*
* @param timeout Timeout in seconds.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setNavigationTimeout = function(timeout) {
    return this.setMaxLoadTime(timeout);
};

/**
* Set the protocol used for secure (HTTPS) connections.
* Set this only if you have an older server that only works with older SSL connections.
*
* @param secureProtocol Secure protocol. Allowed values for Secure Protocol: 0 (TLS 1.1 or newer), 1 (TLS 1.0 only), 2 (SSL v3 only).
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setSecureProtocol = function(secureProtocol) {
    if (!Number.isInteger(secureProtocol)) {
        throw new ApiException('Secure Protocol must be an integer number.');        
    }
    if (secureProtocol !=0 && secureProtocol !=1 && secureProtocol !=2) {
        throw new ApiException('Allowed values for Secure Protocol: 0 (TLS 1.1 or newer), 1 (TLS 1.0 only), 2 (SSL v3 only).');
    }
    
    this.parameters['protocol'] = secureProtocol;
    return this;
};

/**
* Specify if the CSS Print media type is used instead of the Screen media type. The default value is False.
*
* @param useCssPrint Use CSS Print media or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setUseCssPrint = function(useCssPrint) {
    this.parameters['use_css_print'] = this.serializeBoolean(useCssPrint);
    return this;
};

/**
* Specify the background color of the PDF page in RGB html format. The default is #FFFFFF.
*
* @param backgroundColor Background color in #RRGGBB format.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setBackgroundColor = function(backgroundColor) {
    if (!backgroundColor.match(/^#?[0-9a-fA-F]{6}$/)) {
        throw new ApiException('Color value must be in #RRGGBB format.');
    }
    
    this.parameters['background_color'] = backgroundColor;
    return this;
};

/**
* Set a flag indicating if the web page background is rendered in PDF. The default value is True.
*
* @param drawHtmlBackground Draw the HTML background or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDrawHtmlBackground = function(drawHtmlBackground) {
    this.parameters['draw_html_background'] = this.serializeBoolean(drawHtmlBackground);
    return this;
};

/**
* Do not run JavaScript in web pages. The default value is False and javascript is executed.
*
* @param disableJavascript Disable javascript or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDisableJavascript = function(disableJavascript) {
    this.parameters['disable_javascript'] = this.serializeBoolean(disableJavascript);
    return this;
};

/**
* Do not create internal links in the PDF. The default value is False and internal links are created.
*
* @param disableInternalLinks Disable internal links or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDisableInternalLinks = function(disableInternalLinks) {
    this.parameters['disable_internal_links'] = this.serializeBoolean(disableInternalLinks);
    return this;
};

/**
* Do not create external links in the PDF. The default value is False and external links are created.
*
* @param disableExternalLinks Disable external links or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDisableExternalLinks = function(disableExternalLinks) {
    this.parameters['disable_external_links'] = this.serializeBoolean(disableExternalLinks);
    return this;
};

/**
* Try to render the PDF even in case of the web page loading timeout. The default value is False and an exception is raised in case of web page navigation timeout.
*
* @param renderOnTimeout Render in case of timeout or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setRenderOnTimeout = function(renderOnTimeout) {
    this.parameters['render_on_timeout'] = this.serializeBoolean(renderOnTimeout);
    return this;
};

/**
* Avoid breaking images between PDF pages. The default value is False and images are split between pages if larger.
*
* @param keepImagesTogether Try to keep images on same page or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setKeepImagesTogether = function(keepImagesTogether) {
    this.parameters['keep_images_together'] = this.serializeBoolean(keepImagesTogether);
    return this;
};

/**
* Set the PDF document title.
*
* @param docTitle Document title.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDocTitle = function(docTitle) {
    this.parameters['doc_title'] = docTitle;
    return this;
};

/**
* Set the PDF document subject.
*
* @param docSubject Document subject.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDocSubject = function(docSubject) {
    this.parameters['doc_subject'] = docSubject;
    return this;
};

/**
* Set the PDF document keywords.
*
* @param docKeywords Document keywords.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDocKeywords = function(docKeywords) {
    this.parameters['doc_keywords'] = docKeywords;
    return this;
};

/**
* Set the PDF document author.
*
* @param docAuthor Document author.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDocAuthor = function(docAuthor) {
    this.parameters['doc_author'] = docAuthor;
    return this;
};

/**
* Add the date and time when the PDF document was created to the PDF document information. The default value is False.
*
* @param docAddCreationDate Add creation date to the document metadata or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setDocAddCreationDate = function(docAddCreationDate) {
    this.parameters['doc_add_creation_date'] = this.serializeBoolean(docAddCreationDate);
    return this;
};

/**
* Set the page layout to be used when the document is opened in a PDF viewer. The default value is 1 - OneColumn.
*
* @param pageLayout Page layout. Possible values: 0 (Single Page), 1 (One Column), 2 (Two Column Left), 3 (Two Column Right).
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerPageLayout = function(pageLayout) {
    if (!Number.isInteger(pageLayout)) {
        throw new ApiException('Page Layout must be an integer number.');        
    }
    if (pageLayout !=0 && pageLayout != 1 && pageLayout !=2 && pageLayout !=3) {
        throw new ApiException('Allowed values for Page Layout: 0 (Single Page), 1 (One Column), 2 (Two Column Left), 3 (Two Column Right).');
    }
    
    this.parameters['viewer_page_layout'] = pageLayout;
    return this;
};

/**
* Set the document page mode when the pdf document is opened in a PDF viewer. The default value is 0 - UseNone.
*
* @param pageMode Page mode. Possible values: 0 (Use None), 1 (Use Outlines), 2 (Use Thumbs), 3 (Full Screen), 4 (Use OC), 5 (Use Attachments).
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerPageMode = function(pageMode) {
    if (!Number.isInteger(pageMode)) {
        throw new ApiException('Page Layout must be an integer number.');        
    }
    if (pageMode !=0 && pageMode != 1 && pageMode !=2 && pageMode !=3 && pageMode !=4 && pageMode !=5) {
        throw new ApiException('Allowed values for Page Mode: 0 (Use None), 1 (Use Outlines), 2 (Use Thumbs), 3 (Full Screen), 4 (Use OC), 5 (Use Attachments).');
    }
    
    this.parameters['viewer_page_mode'] = pageMode;
    return this;
};

/**
* Set a flag specifying whether to position the document's window in the center of the screen. The default value is False.
*
* @param viewerCenterWindow Center window or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerCenterWindow = function(viewerCenterWindow) {
    this.parameters['viewer_center_window'] = this.serializeBoolean(viewerCenterWindow);
    return this;
};

/**
* Set a flag specifying whether the window's title bar should display the document title taken from document information. The default value is False.
*
* @param viewerDisplayDocTitle Display title or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerDisplayDocTitle = function(viewerDisplayDocTitle) {
    this.parameters['viewer_display_doc_title'] = this.serializeBoolean(viewerDisplayDocTitle);
    return this;
};

/**
* Set a flag specifying whether to resize the document's window to fit the size of the first displayed page. The default value is False.
*
* @param viewerFitWindow Fit window or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerFitWindow = function(viewerFitWindow) {
    this.parameters['viewer_fit_window'] = this.serializeBoolean(viewerFitWindow);
    return this;
};

/**
* Set a flag specifying whether to hide the pdf viewer application's menu bar when the document is active. The default value is False.
*
* @param viewerHideMenuBar Hide menu bar or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerHideMenuBar = function(viewerHideMenuBar) {
    this.parameters['viewer_hide_menu_bar'] = this.serializeBoolean(viewerHideMenuBar);
    return this;
};

/**
* Set a flag specifying whether to hide the pdf viewer application's tool bars when the document is active. The default value is False.
*
* @param viewerHideToolbar Hide tool bars or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerHideToolbar = function(viewerHideToolbar) {
    this.parameters['viewer_hide_toolbar'] = this.serializeBoolean(viewerHideToolbar);
    return this;
};

/**
* Set a flag specifying whether to hide user interface elements in the document's window (such as scroll bars and navigation controls), 
* leaving only the document's contents displayed. The default value is False.
*
* @param viewerHideWindowUI Hide window UI or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setViewerHideWindowUI = function(viewerHideWindowUI) {
    this.parameters['viewer_hide_window_ui'] = this.serializeBoolean(viewerHideWindowUI);
    return this;
};

/**
* Control if a custom header is displayed in the generated PDF document. The default value is False.
*
* @param showHeader Show header or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setShowHeader = function(showHeader) {
    this.parameters['show_header'] = this.serializeBoolean(showHeader);
    return this;
};

/**
* The height of the pdf document header. This height is specified in points. 1 point is 1/72 inch. The default value is 50.
*
* @param height Header height in points.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderHeight = function(height) {
    if (!Number.isInteger(height)) {
        throw new ApiException('Header height must be an integer number.');        
    } 
    
    this.parameters['header_height'] = height;
    return this;
};

/**
* Set the url of the web page that is converted and rendered in the PDF document header.
*
* @param url The url of the web page that is converted and rendered in the pdf document header.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderUrl = function(url) {
    if (!url.match(/^https?:\/\/.*$/i)) {
        throw new ApiException('The supported protocols for the url are http:// and https://.');
    }
    
    this.parameters['header_url'] = url;
    return this;
};

/**
* Set the raw html that is converted and rendered in the pdf document header.
*
* @param html The raw html that is converted and rendered in the pdf document header.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderHtml = function(html) {
    this.parameters['header_html'] = html;
    return this;
};

/**
* Set the url of the web page that is converted and rendered in the PDF document header.
*
* @param baseUrl The url of the web page that is converted and rendered in the pdf document header.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderBaseUrl = function(baseUrl) {
    if (!baseUrl.match(/^https?:\/\/.*$/i)) {
        throw new ApiException('The supported protocols for the base url are http:// and https://.');
    }
    
    this.parameters['header_base_url'] = baseUrl;
    return this;
};

/**
* Control the visibility of the header on the first page of the generated pdf document. The default value is True.
*
* @param displayOnFirstPage Display header on the first page or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderDisplayOnFirstPage = function(displayOnFirstPage) {
    this.parameters['header_display_on_first_page'] = this.serializeBoolean(displayOnFirstPage);
    return this;
};

/**
* Control the visibility of the header on the odd numbered pages of the generated pdf document. The default value is True.
*
* @param displayOnOddPages Display header on odd pages or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderDisplayOnOddPages = function(displayOnOddPages) {
    this.parameters['header_display_on_odd_pages'] = this.serializeBoolean(displayOnOddPages);
    return this;
};

/**
* Control the visibility of the header on the even numbered pages of the generated pdf document. The default value is True.
*
* @param displayOnEvenPages Display header on even pages or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderDisplayOnEvenPages = function(displayOnEvenPages) {
    this.parameters['header_display_on_even_pages'] = this.serializeBoolean(displayOnEvenPages);
    return this;
};

/**
* Set the width in pixels used by the converter's internal browser window during the conversion of the header content. The default value is 1024px.
*
* @param headerWebPageWidth Browser window width in pixels.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderWebPageWidth = function(headerWebPageWidth) {
    if (!Number.isInteger(headerWebPageWidth)) {
        throw new ApiException('Header web page width must be an integer number.');        
    } 
    
    this.parameters['header_web_page_width'] = headerWebPageWidth;
    return this;
};

/**
* Set the height in pixels used by the converter's internal browser window during the conversion of the header content. 
* The default value is 0px and it means that the page height is automatically calculated by the converter.
*
* @param headerWebPageHeight Browser window height in pixels. Set it to 0px to automatically calculate page height.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setHeaderWebPageHeight = function(headerWebPageHeight) {
    if (!Number.isInteger(headerWebPageHeight)) {
        throw new ApiException('Header web page height must be an integer number.');        
    } 
    
    this.parameters['header_web_page_height'] = headerWebPageHeight;
    return this;
};

/**
* Control if a custom footer is displayed in the generated PDF document. The default value is False.
*
* @param showFooter Show footer or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setShowFooter = function(showFooter) {
    this.parameters['show_footer'] = this.serializeBoolean(showFooter);
    return this;
};

/**
* The height of the pdf document footer. This height is specified in points. 1 point is 1/72 inch. The default value is 50.
*
* @param height Footer height in points.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterHeight = function(height) {
    if (!Number.isInteger(height)) {
        throw new ApiException('Footer height must be an integer number.');        
    } 
    
    this.parameters['footer_height'] = height;
    return this;
};

/**
* Set the url of the web page that is converted and rendered in the PDF document footer.
*
* @param url The url of the web page that is converted and rendered in the pdf document footer.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterUrl = function(url) {
    if (!url.match(/^https?:\/\/.*$/i)) {
        throw new ApiException('The supported protocols for the url are http:// and https://.');
    }
    
    this.parameters['footer_url'] = url;
    return this;
};

/**
* Set the raw html that is converted and rendered in the pdf document footer.
*
* @param html The raw html that is converted and rendered in the pdf document footer.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterHtml = function(html) {
    this.parameters['footer_html'] = html;
    return this;
};

/**
* Set the url of the web page that is converted and rendered in the PDF document footer.
*
* @param baseUrl The url of the web page that is converted and rendered in the pdf document footer.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterBaseUrl = function(baseUrl) {
    if (!baseUrl.match(/^https?:\/\/.*$/i)) {
        throw new ApiException('The supported protocols for the base url are http:// and https://.');
    }
    
    this.parameters['footer_base_url'] = baseUrl;
    return this;
};

/**
* Control the visibility of the footer on the first page of the generated pdf document. The default value is True.
*
* @param displayOnFirstPage Display footer on the first page or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterDisplayOnFirstPage = function(displayOnFirstPage) {
    this.parameters['footer_display_on_first_page'] = this.serializeBoolean(displayOnFirstPage);
    return this;
};

/**
* Control the visibility of the footer on the odd numbered pages of the generated pdf document. The default value is True.
*
* @param displayOnOddPages Display footer on odd pages or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterDisplayOnOddPages = function(displayOnOddPages) {
    this.parameters['footer_display_on_odd_pages'] = this.serializeBoolean(displayOnOddPages);
    return this;
};

/**
* Control the visibility of the footer on the even numbered pages of the generated pdf document. The default value is True.
*
* @param displayOnEvenPages Display footer on even pages or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterDisplayOnEvenPages = function(displayOnEvenPages) {
    this.parameters['footer_display_on_even_pages'] = this.serializeBoolean(displayOnEvenPages);
    return this;
};

/**
* Add a special footer on the last page of the generated pdf document only. The default value is False.
* Use setFooterUrl or setFooterHtml and setFooterBaseUrl to specify the content of the last page footer.
* Use setFooterHeight to specify the height of the special last page footer.
*
* @param displayOnLastPage Display special footer on the last page or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterDisplayOnLastPage = function(displayOnLastPage) {
    this.parameters['footer_display_on_last_page'] = this.serializeBoolean(displayOnLastPage);
    return this;
};

/**
* Set the width in pixels used by the converter's internal browser window during the conversion of the footer content. The default value is 1024px.
*
* @param footerWebPageWidth Browser window width in pixels.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterWebPageWidth = function(footerWebPageWidth) {
    if (!Number.isInteger(footerWebPageWidth)) {
        throw new ApiException('Footer web page width must be an integer number.');        
    } 
    
    this.parameters['footer_web_page_width'] = footerWebPageWidth;
    return this;
};

/**
* Set the height in pixels used by the converter's internal browser window during the conversion of the footer content. 
* The default value is 0px and it means that the page height is automatically calculated by the converter.
*
* @param footerWebPageHeight Browser window height in pixels. Set it to 0px to automatically calculate page height.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setFooterWebPageHeight = function(footerWebPageHeight) {
    if (!Number.isInteger(footerWebPageHeight)) {
        throw new ApiException('Footer web page height must be an integer number.');        
    } 
    
    this.parameters['footer_web_page_height'] = footerWebPageHeight;
    return this;
};

/**
* Show page numbers. Default value is True. Page numbers will be displayed in the footer of the PDF document.
*
* @param showPageNumbers Show page numbers or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setShowPageNumbers = function(showPageNumbers) {
    this.parameters['page_numbers'] = this.serializeBoolean(showPageNumbers);
    return this;
};

/**
* Control the page number for the first page being rendered. The default value is 1.
*
* @param firstPageNumber First page number.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersFirst = function(firstPageNumber) {
    if (!Number.isInteger(firstPageNumber)) {
        throw new ApiException('First page number must be an integer number.');        
    } 
    
    this.parameters['page_numbers_first'] = firstPageNumber;
    return this;
};

/**
* Control the total number of pages offset in the generated pdf document. The default value is 0.
*
* @param totalPagesOffset Offset for the total number of pages in the generated pdf document.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersOffset = function(totalPagesOffset) {
    if (!Number.isInteger(totalPagesOffset)) {
        throw new ApiException('Page numbers offset must be an integer number.');        
    } 
    
    this.parameters['page_numbers_offset'] = totalPagesOffset;
    return this;
};

/**
* Set the text that is used to display the page numbers. 
* It can contain the placeholder {page_number} for the current page number and {total_pages} for the total number of pages. 
* The default value is "Page: {page_number} of {total_pages}".
*
* @param template Page numbers template.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersTemplate = function(template) {
    this.parameters['page_numbers_template'] = template;
    return this;
};

/**
* Set the font used to display the page numbers text. The default value is "Helvetica".
*
* @param fontName The font used to display the page numbers text.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersFontName = function(fontName) {
    this.parameters['page_numbers_font_name'] = fontName;
    return this;
};

/**
* Set the size of the font used to display the page numbers. The default value is 10 points.
*
* @param fontSize The size in points of the font used to display the page numbers.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersFontSize = function(fontSize) {
    if (!Number.isInteger(fontSize)) {
        throw new ApiException('Font size must be an integer number.');        
    } 
    
    this.parameters['page_numbers_font_size'] = fontSize;
    return this;
};

/**
* Set the alignment of the page numbers text. The default value is 3 (Right).
*
* @param alignment The alignment of the page numbers text. Allowed values for Page Numbers Alignment: 1 (Left), 2 (Center), 3 (Right).
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersAlignment = function(alignment) {
    if (!Number.isInteger(alignment)) {
        throw new ApiException('Page numbers alignment must be an integer number.');        
    }
    if (alignment !=1 && alignment != 2 && alignment !=3) {
        throw new ApiException('Allowed values for Page Numbers Alignment: 1 (Left), 2 (Center), 3 (Right).');
    }
    
    this.parameters['page_numbers_alignment'] = alignment;
    return this;
};

/**
* Specify the color of the page numbers text in #RRGGBB html format. The default value is #333333.
*
* @param color Page numbers color in #RRGGBB format.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersColor = function(color) {
    if (!color.match(/^#?[0-9a-fA-F]{6}$/)) {
        throw new ApiException('Color value must be in #RRGGBB format.');
    }
    
    this.parameters['page_numbers_color'] = color;
    return this;
};

/**
* Specify the position in points on the vertical where the page numbers text is displayed in the footer. The default value is 10 points.
*
* @param position Page numbers Y position in points.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageNumbersVerticalPosition = function(position) {
    if (!Number.isInteger(position)) {
        throw new ApiException('Page numbers vertical position must be an integer number.');        
    } 
    
    this.parameters['page_numbers_pos_y'] = position;
    return this;
};

/**
* Generate automatic bookmarks in pdf. The elements that will be bookmarked are defined using CSS selectors. 
* For example, the selector for all the H1 elements is "H1", the selector for all the elements with the CSS class name 'myclass' is "*.myclass" and 
* the selector for the elements with the id 'myid' is "*#myid". Read more about CSS selectors <a href="http://www.w3schools.com/cssref/css_selectors.asp" target="_blank">here</a>.
*
* @param selectors CSS selectors used to identify HTML elements, comma separated.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPdfBookmarksSelectors = function(selectors) {
    this.parameters['pdf_bookmarks_selectors'] = selectors;
    return this;
};

/**
* Exclude page elements from the conversion. The elements that will be excluded are defined using CSS selectors. 
* For example, the selector for all the H1 elements is "H1", the selector for all the elements with the CSS class name 'myclass' is "*.myclass" and 
* the selector for the elements with the id 'myid' is "*#myid". Read more about CSS selectors <a href="http://www.w3schools.com/cssref/css_selectors.asp" target="_blank">here</a>.
*
* @param selectors CSS selectors used to identify HTML elements, comma separated.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPdfHideElements = function(selectors) {
    this.parameters['pdf_hide_elements'] = selectors;
    return this;
};

/**
* Convert only a specific section of the web page to pdf. 
* The section that will be converted to pdf is specified by the html element ID. 
* The element can be anything (image, table, table row, div, text, etc).
*
* @param elementID HTML element ID.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPdfShowOnlyElementID = function(elementID) {
    this.parameters['pdf_show_only_element_id'] = elementID;
    return this;
};

/**
* Get the locations of page elements from the conversion. The elements that will have their locations retrieved are defined using CSS selectors. 
* For example, the selector for all the H1 elements is "H1", the selector for all the elements with the CSS class name 'myclass' is "*.myclass" and 
* the selector for the elements with the id 'myid' is "*#myid". Read more about CSS selectors <a href="http://www.w3schools.com/cssref/css_selectors.asp" target="_blank">here</a>.
*
* @param selectors CSS selectors used to identify HTML elements, comma separated.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPdfWebElementsSelectors = function(selectors) {
    this.parameters['pdf_web_elements_selectors'] = selectors;
    return this;
};

/**
* Set converter startup mode. 
* By default this is set to 'Automatic' and the conversion is started as soon as the page loads (and conversion delay set with setConversionDelay elapses). 
* If set to 'Manual', the conversion is started only by a javascript call to SelectPdf.startConversion() from within the web page.
*
* @param startupMode Converter startup mode. Allowed values for Startup Mode: Automatic, Manual.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setStartupMode = function(startupMode) {
    if (!startupMode.match(/^(Automatic|Manual)$/i)) {
        throw new ApiException('Allowed values for Startup Mode: Automatic, Manual.');
    }
    
    this.parameters['startup_mode'] = startupMode;
    return this;
};

/**
* Internal use only.
*
* @param skipDecoding The default value is True.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setSkipDecoding = function(skipDecoding) {
    this.parameters['skip_decoding'] = this.serializeBoolean(skipDecoding);
    return this;
};

/**
* Set a flag indicating if the images from the page are scaled during the conversion process. The default value is False and images are not scaled.
*
* @param scaleImages Scale images or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setScaleImages = function(scaleImages) {
    this.parameters['scale_images'] = this.serializeBoolean(scaleImages);
    return this;
};

/**
* Generate a single page PDF. The converter will automatically resize the PDF page to fit all the content in a single page.
* The default value of this property is False and the PDF will contain several pages if the content is large.
*
* @param generateSinglePagePdf Generate a single page PDF or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setSinglePagePdf = function(generateSinglePagePdf) {
    this.parameters['single_page_pdf'] = this.serializeBoolean(generateSinglePagePdf);
    return this;
};

/**
* Get or set a flag indicating if an enhanced custom page breaks algorithm is used. 
* The enhanced algorithm is a little bit slower but it will prevent the appearance of hidden text in the PDF when custom page breaks are used.
* The default value for this property is False.
*
* @param enableEnhancedPageBreaksAlgorithm Enable enhanced page breaks algorithm or not.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setPageBreaksEnhancedAlgorithm = function(enableEnhancedPageBreaksAlgorithm) {
    this.parameters['page_breaks_enhanced_algorithm'] = this.serializeBoolean(enableEnhancedPageBreaksAlgorithm);
    return this;
};

/**
* Set HTTP cookies for the web page being converted. The demo endpoint does not send cookies; it reports the value in getDroppedFields.
*
* @param cookies HTTP cookies that will be sent to the page being converted, as an object of name/value pairs (for example { session: 'abc', lang: 'en' }).
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setCookies = function(cookies) {
    this.parameters['cookies_string'] = querystring.stringify(cookies);
    return this;
};

/**
* Set the user name for HTTP Basic authentication on the web page being converted.
* Use it together with setAuthPassword. The demo endpoint does not send credentials; it reports the value in getDroppedFields.
*
* @param authUsername User name for HTTP Basic authentication.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setAuthUsername = function(authUsername) {
    this.parameters['auth_username'] = authUsername;
    return this;
};

/**
* Set the password for HTTP Basic authentication on the web page being converted.
* Use it together with setAuthUsername. The demo endpoint does not send credentials; it reports the value in getDroppedFields.
*
* @param authPassword Password for HTTP Basic authentication.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setAuthPassword = function(authPassword) {
    this.parameters['auth_password'] = authPassword;
    return this;
};

/**
* Set a custom parameter. Do not use this method unless advised by SelectPdf.
*
* @param parameterName Parameter name.
* @param parameterValue Parameter value.
* @returns Reference to the current object.
*/
HtmlToPdfClient.prototype.setCustomParameter = function(parameterName, parameterValue) {
    this.parameters[parameterName] = parameterValue;
    return this;
};

/**
* Get the locations of certain web elements. This is retrieved if pdf_web_elements_selectors parameter is set and elements were found to match the selectors.
*
* @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain web elements positions in json format.
*/
HtmlToPdfClient.prototype.getWebElements = function(callback) {
    var webElementsClient = new WebElementsClient(this.parameters['key'], this.jobId);
    webElementsClient.apiEndpoint = this.apiWebElementsEndpoint;

    webElementsClient.getWebElements(function(err, data) {
        callback(err, data);
    });
};

/**
 * Create ZUGFeRD / Factur-X hybrid electronic invoices with SelectPdf Online API.
 *
 * A hybrid electronic invoice is one PDF/A-3 file carrying both halves of the invoice: the page a human reads,
 * and the XML a recipient's accounting system reads. This client converts a url or an HTML string into the visible invoice
 * and embeds the XML into it as an associated file, with the metadata invoice software looks for.
 *
 * It derives from HtmlToPdfClient, so every conversion setting - page size, margins, headers, footers, rendering engine - applies here too.
 * Use the createFrom* methods rather than the inherited convert* methods: the invoice endpoint takes a multipart request,
 * because the XML is uploaded as a file part.
 *
 * The carrier document must be PDF/A-3. The default is PdfA3A, the accessible level, which the standards recommend because
 * it makes the visible invoice readable by assistive technology as well as archivable. Because PdfA3A is a tagged standard,
 * a request that does not set a rendering engine is promoted to Chromium by the API, which reports the engine used in the
 * X-SelectPdf-Engine response header.
 *
 * Unlike HtmlToPdfClient, this client has no demo mode - the keyless demo endpoint does not produce electronic invoices - so an API key is required.
 *
 * @param apiKey API key. Required - the constructor throws ApiException when it is missing, empty or "demo".
 *
 * @example <caption>Create a hybrid electronic invoice in NodeJS with SelectPdf online REST API:</caption>
 * var selectpdf = require('selectpdf');
 *
 * console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);
 *
 * try {
 *     var apiKey = 'Your API key here';
 *     var invoiceHtml = '<html><body><h1>Invoice INV-2026-001</h1></body></html>';
 *     var invoiceXml = 'factur-x.xml';
 *     var localFile = 'Invoice.pdf';
 *
 *     var client = new selectpdf.InvoiceClient(apiKey);
 *
 *     client
 *         .setInvoiceXmlFile(invoiceXml)
 *         .setZugferdProfile(selectpdf.ZugferdProfile.En16931)
 *         .setDocTitle('Invoice INV-2026-001')
 *     ;
 *
 *     client.createFromHtmlStringToFile(invoiceHtml, localFile,
 *         function(err, fileName) {
 *             if (err) return console.log("An error occurred: " + err);
 *             console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
 *         }
 *     );
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 *
 */
function InvoiceClient(apiKey) {
    if (apiKey === null || typeof apiKey === 'undefined' || String(apiKey).trim() === '' || String(apiKey).trim().toLowerCase() === 'demo') {
        throw new ApiException('An API key is required to create electronic invoices. The keyless demo endpoint does not support them.');
    }

    HtmlToPdfClient.call(this, apiKey);

    this.apiEndpoint = "https://selectpdf.com/api2/invoice/";

    // The carrier has to be PDF/A-3; default to the accessible level, which
    // the standards recommend. Overridable with setPdfStandard.
    this.parameters['pdf_standard'] = PdfStandard.PdfA3A;
};

InvoiceClient.prototype = Object.create(HtmlToPdfClient.prototype);
Object.defineProperty(InvoiceClient.prototype, 'constructor', {
    value: InvoiceClient,
    enumerable: false,
    writable: true
});

/**
 * Set the invoice XML from a local file.
 * Only the content of the file is used - the name recorded inside the PDF is the one the standard prescribes
 * ("factur-x.xml", or "xrechnung.xml" for the XRECHNUNG profile), because recipients look it up by name.
 *
 * @param invoiceXmlFile Path to the local invoice XML file.
 * @returns Reference to the current object.
 */
InvoiceClient.prototype.setInvoiceXmlFile = function(invoiceXmlFile) {
    delete this.binaryData['zugferd_xml'];
    this.files['zugferd_xml'] = invoiceXmlFile;
    return this;
};

/**
 * Set the invoice XML from memory.
 *
 * @param invoiceXml The invoice XML, as a Buffer or as a string (a string is sent UTF-8 encoded).
 * @returns Reference to the current object.
 */
InvoiceClient.prototype.setInvoiceXml = function(invoiceXml) {
    var data;

    if (Buffer.isBuffer(invoiceXml)) {
        data = invoiceXml;
    }
    else if (invoiceXml instanceof Uint8Array) {
        data = Buffer.from(invoiceXml);
    }
    else if (typeof invoiceXml === 'string') {
        data = Buffer.from(invoiceXml, 'utf8');
    }
    else {
        throw new ApiException('The invoice XML must be a Buffer or a string.');
    }

    delete this.files['zugferd_xml'];
    this.binaryData['zugferd_xml'] = data;
    return this;
};

/**
 * Set the data profile of the invoice XML. Required.
 *
 * @param profile The invoice data profile. Allowed values for ZUGFeRD Profile: Minimum, Basic_WL, Basic, En16931, Extended, XRechnung (see ZugferdProfile).
 * @returns Reference to the current object.
 */
InvoiceClient.prototype.setZugferdProfile = function(profile) {
    var value = canonicalEnumValue(ZugferdProfile, profile);
    if (value === null) {
        throw new ApiException('Allowed values for ZUGFeRD Profile: ' + enumValuesList(ZugferdProfile) + '.');
    }

    this.parameters['zugferd_profile'] = value;
    return this;
};

/**
 * Set how the embedded XML relates to the visible invoice page.
 * Optional. When not set, the API derives it from the profile: Alternative for Minimum and Basic_WL, which do not carry a complete invoice,
 * and Data for the rest. Those two profiles combined with Data are rejected by the API.
 *
 * @param relationship The relationship between XML and page. Allowed values for ZUGFeRD Relationship: Data, Alternative, Source, Supplement (see ZugferdRelationship).
 * @returns Reference to the current object.
 */
InvoiceClient.prototype.setZugferdRelationship = function(relationship) {
    var value = canonicalEnumValue(ZugferdRelationship, relationship);
    if (value === null) {
        throw new ApiException('Allowed values for ZUGFeRD Relationship: ' + enumValuesList(ZugferdRelationship) + '.');
    }

    this.parameters['zugferd_relationship'] = value;
    return this;
};

/**
 * Set the metadata schema identifying the invoice. Defaults to FacturX10.
 *
 * @param schema The invoice metadata schema. Allowed values for ZUGFeRD Schema: FacturX10, Zugferd20 (see ZugferdSchema).
 * @returns Reference to the current object.
 */
InvoiceClient.prototype.setZugferdSchema = function(schema) {
    var value = canonicalEnumValue(ZugferdSchema, schema);
    if (value === null) {
        throw new ApiException('Allowed values for ZUGFeRD Schema: ' + enumValuesList(ZugferdSchema) + '.');
    }

    this.parameters['zugferd_schema'] = value;
    return this;
};

/**
 * Check that the invoice XML and profile are set. Fails before spending a round trip on a request the API would reject.
 *
 * @returns Error or null.
 * @private
 */
InvoiceClient.prototype.validateInvoice = function() {
    if (!this.files['zugferd_xml'] && !this.binaryData['zugferd_xml']) {
        return new ApiException('The invoice XML was not specified. Call setInvoiceXmlFile or setInvoiceXml before creating the invoice.');
    }
    if (!this.parameters['zugferd_profile']) {
        return new ApiException('The invoice profile was not specified. Call setZugferdProfile before creating the invoice.');
    }
    return null;
};

/**
 * Prepare the parameters for an invoice created from a url.
 *
 * @param url Url of the invoice page.
 * @returns Error or null.
 * @private
 */
InvoiceClient.prototype.prepareUrl = function(url) {
    if (!url || !String(url).match(/^https?:\/\/.*$/i)) {
        return new ApiException('The supported protocols for the converted webpage are http:// and https://.');
    }

    var err = this.validateInvoice();
    if (err) return err;

    this.parameters['url'] = url;
    this.parameters['html'] = '';
    this.parameters['base_url'] = '';
    return null;
};

/**
 * Prepare the parameters for an invoice created from an HTML string.
 *
 * @param htmlString The invoice HTML.
 * @param baseUrl Base url used to resolve relative paths in the HTML.
 * @returns Error or null.
 * @private
 */
InvoiceClient.prototype.prepareHtml = function(htmlString, baseUrl) {
    var err = this.validateInvoice();
    if (err) return err;

    this.parameters['url'] = '';
    this.parameters['html'] = htmlString;
    this.parameters['base_url'] = baseUrl ? baseUrl : '';
    return null;
};

/**
 * Write the result of an invoice call to a local file.
 *
 * @param filePath Path of the output file.
 * @param create Function(callback) that creates the invoice.
 * @param callback Callback function(err, filePath).
 * @private
 */
function createInvoiceToFile(filePath, create, callback) {
    if (!filePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }

    create(function(err, data) {
        if (err) return callback(err);

        fs.writeFile(filePath, data, 'binary', function(fileError) {
            if (fileError) return callback(fileError);
            callback(null, filePath);
        });
    });
}

/**
 * Create a hybrid electronic invoice from the invoice page at the specified url.
 *
 * @param url Url of the invoice page.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain the hybrid invoice PDF.
 */
InvoiceClient.prototype.createFromUrl = function(url, callback) {
    var err = this.prepareUrl(url);
    if (err) return callback(err);

    this.parameters['async'] = 'False';
    this.performPostAsMultipartFormData(callback);
};

/**
 * Create a hybrid electronic invoice from the invoice page at the specified url and write it to a local file.
 *
 * @param url Url of the invoice page.
 * @param filePath Path of the output file.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
InvoiceClient.prototype.createFromUrlToFile = function(url, filePath, callback) {
    var currentObject = this;
    createInvoiceToFile(filePath, function(cb) { currentObject.createFromUrl(url, cb); }, callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string. Use a base url to resolve relative paths to resources.
 *
 * @param htmlString The invoice HTML.
 * @param baseUrl Base url used to resolve relative paths in the HTML (css, images, etc). Must be a http:// or https:// publicly available url.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain the hybrid invoice PDF.
 */
InvoiceClient.prototype.createFromHtmlStringWithBaseUrl = function(htmlString, baseUrl, callback) {
    var err = this.prepareHtml(htmlString, baseUrl);
    if (err) return callback(err);

    this.parameters['async'] = 'False';
    this.performPostAsMultipartFormData(callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string and write it to a local file. Use a base url to resolve relative paths to resources.
 *
 * @param htmlString The invoice HTML.
 * @param baseUrl Base url used to resolve relative paths in the HTML (css, images, etc). Must be a http:// or https:// publicly available url.
 * @param filePath Path of the output file.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
InvoiceClient.prototype.createFromHtmlStringWithBaseUrlToFile = function(htmlString, baseUrl, filePath, callback) {
    var currentObject = this;
    createInvoiceToFile(filePath, function(cb) { currentObject.createFromHtmlStringWithBaseUrl(htmlString, baseUrl, cb); }, callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string.
 *
 * @param htmlString The invoice HTML.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain the hybrid invoice PDF.
 */
InvoiceClient.prototype.createFromHtmlString = function(htmlString, callback) {
    this.createFromHtmlStringWithBaseUrl(htmlString, '', callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string and write it to a local file.
 *
 * @param htmlString The invoice HTML.
 * @param filePath Path of the output file.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
InvoiceClient.prototype.createFromHtmlStringToFile = function(htmlString, filePath, callback) {
    this.createFromHtmlStringWithBaseUrlToFile(htmlString, '', filePath, callback);
};

/**
 * Create a hybrid electronic invoice from the invoice page at the specified url, with an asynchronous call.
 * Recommended for long invoice pages or callers that cannot hold an HTTP connection open for the whole conversion.
 *
 * @param url Url of the invoice page.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain the hybrid invoice PDF.
 */
InvoiceClient.prototype.createFromUrlAsync = function(url, callback) {
    var err = this.prepareUrl(url);
    if (err) return callback(err);

    this.runAsyncJob(true, callback);
};

/**
 * Create a hybrid electronic invoice from the invoice page at the specified url, with an asynchronous call, and write it to a local file.
 *
 * @param url Url of the invoice page.
 * @param filePath Path of the output file.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
InvoiceClient.prototype.createFromUrlToFileAsync = function(url, filePath, callback) {
    var currentObject = this;
    createInvoiceToFile(filePath, function(cb) { currentObject.createFromUrlAsync(url, cb); }, callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string, with an asynchronous call. Use a base url to resolve relative paths to resources.
 *
 * @param htmlString The invoice HTML.
 * @param baseUrl Base url used to resolve relative paths in the HTML (css, images, etc). Must be a http:// or https:// publicly available url.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain the hybrid invoice PDF.
 */
InvoiceClient.prototype.createFromHtmlStringWithBaseUrlAsync = function(htmlString, baseUrl, callback) {
    var err = this.prepareHtml(htmlString, baseUrl);
    if (err) return callback(err);

    this.runAsyncJob(true, callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string, with an asynchronous call, and write it to a local file. Use a base url to resolve relative paths to resources.
 *
 * @param htmlString The invoice HTML.
 * @param baseUrl Base url used to resolve relative paths in the HTML (css, images, etc). Must be a http:// or https:// publicly available url.
 * @param filePath Path of the output file.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
InvoiceClient.prototype.createFromHtmlStringWithBaseUrlToFileAsync = function(htmlString, baseUrl, filePath, callback) {
    var currentObject = this;
    createInvoiceToFile(filePath, function(cb) { currentObject.createFromHtmlStringWithBaseUrlAsync(htmlString, baseUrl, cb); }, callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string, with an asynchronous call.
 *
 * @param htmlString The invoice HTML.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain the hybrid invoice PDF.
 */
InvoiceClient.prototype.createFromHtmlStringAsync = function(htmlString, callback) {
    this.createFromHtmlStringWithBaseUrlAsync(htmlString, '', callback);
};

/**
 * Create a hybrid electronic invoice from a raw HTML string, with an asynchronous call, and write it to a local file.
 *
 * @param htmlString The invoice HTML.
 * @param filePath Path of the output file.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
InvoiceClient.prototype.createFromHtmlStringToFileAsync = function(htmlString, filePath, callback) {
    this.createFromHtmlStringWithBaseUrlToFileAsync(htmlString, '', filePath, callback);
};

/**
 * Get usage details for SelectPdf Online API.
 * 
 * @param apiKey API key.
 */
function UsageClient(apiKey) {
    ApiClient.call(this);

    this.apiEndpoint = "https://selectpdf.com/api2/usage/";
    this.parameters["key"] = apiKey;
};

UsageClient.prototype = Object.create(ApiClient.prototype);
Object.defineProperty(UsageClient.prototype, 'constructor', { 
    value: UsageClient, 
    enumerable: false, 
    writable: true 
});

/**
 * Get API usage information with history if specified.
 * 
 * @param getHistory Get history or not.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received in json format.
 */
UsageClient.prototype.getUsage = function(getHistory, callback) {
    this.headers["Accept"] = "application/json";
    if (getHistory)
    {
        this.parameters["get_history"] = "True";
    }
    
    this.performPost(function(err, data) {
        if (err) return callback(err);
        
        data = data.toString();
        if (!data)
            data = "[]";

        callback(err, JSON.parse(data));
    });
};

/**
 * Get the locations of certain web elements. 
 * This is retrieved if pdf_web_elements_selectors parameter was set during the initial conversion call and elements were found to match the selectors.
 * 
 * @param apiKey API key.
 * @param jobId Job ID.
 */
function WebElementsClient(apiKey, jobId) {
    ApiClient.call(this);

    this.apiEndpoint = "https://selectpdf.com/api2/webelements/";
    this.parameters["key"] = apiKey;
    this.parameters["job_id"] = jobId;
};

WebElementsClient.prototype = Object.create(ApiClient.prototype);
Object.defineProperty(WebElementsClient.prototype, 'constructor', { 
    value: WebElementsClient, 
    enumerable: false, 
    writable: true 
});

/**
 * Get API usage information with history if specified.
 * 
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain web elements positions in json format.
 */
 WebElementsClient.prototype.getWebElements = function(callback) {
    this.headers["Accept"] = "application/json";
    
    this.performPost(function(err, data) {
        if (err) return callback(err);
        
        data = data.toString();
        if (!data)
            data = "[]";

        callback(err, JSON.parse(data));
    });
};

/**
 * Get the result of an asynchronous call.
 * 
 * @param apiKey API key.
 * @param jobId Job ID.
 */
function AsyncJobClient(apiKey, jobId) {
    ApiClient.call(this);

    this.apiEndpoint = "https://selectpdf.com/api2/asyncjob/";
    this.parameters["key"] = apiKey;
    this.parameters["job_id"] = jobId;

    this.noPings = 0;
};

AsyncJobClient.prototype = Object.create(ApiClient.prototype);
Object.defineProperty(AsyncJobClient.prototype, 'constructor', { 
    value: AsyncJobClient, 
    enumerable: false, 
    writable: true 
});

/**
 * Get result of the asynchronous job.
 * 
 * @param callback Callback function(err, data, numberOfPages). Object err will contain the error, if any. 
 * If there is no error and no job finished, data parameter will contain data received and numberOfPages will contain the number of pages processed. 
 */
AsyncJobClient.prototype.getResult = function(callback) {
    var currentObject = this;

    this.performPost(function(err, data) {
        if (err)
            return callback(err);

        if (!currentObject.finished()) {
            // job is still running
            currentObject.noPings++;
            //console.log("Ping: " + currentObject.noPings);

            if (currentObject.noPings < currentObject.AsyncCallsMaxPings) {
                setTimeout(function() {
                    currentObject.getResult(callback);
                }, currentObject.AsyncCallsPingInterval * 1000);
            }
            else {
                callback(new ApiException("Asynchronous call did not finish in expected timeframe."));
            }
        }
        else {
            // job is finished
            callback(null, data, currentObject.numberOfPages);
        }
    });
};

/**
 * Check if asynchronous job is finished.
 * 
 * @returns True if job finished.
 */
 AsyncJobClient.prototype.finished = function() {
    // 200 OK - the job is finished (successfully).
    // 202 Accepted - the job is still running.
    // 499 (or some other error code) - error - the job is finished (with error).
    if (this.lastHTTPCode != 202) {
        return 1;
    }
    else {
        return 0;
    }
}

/**
 * Pdf Merge with SelectPdf Online API.
 * 
 * @param apiKey API key.
 * 
 * @example <caption>Pdf Merge in NodeJS with SelectPdf online REST API:</caption>
 * var selectpdf = require('selectpdf');
 * 
 * console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);
 * 
 * try {
 *     var testUrl = 'https://selectpdf.com/demo/files/selectpdf.pdf';
 *     var testPdf = 'Input.pdf';
 *     var localFile = 'Result.pdf';
 *     var apiKey = 'Your API key here';
 * 
 *     var client = new selectpdf.PdfMergeClient(apiKey);
 * 
 *     // set parameters - see full list at https://selectpdf.com/pdf-merge-api/
 *     client
 *         // specify the pdf files that will be merged (order will be preserved in the final pdf)
 *         
 *         .addFile(testPdf) // add PDF from local file
 *         .addUrlFile(testUrl) // add PDF From public url
 *         //.addFile(testPdf, "pdf_password") // add PDF (that requires a password) from local file
 *         //.addUrlFile(testUrl, "pdf_password") // add PDF (that requires a password) from public url
 *     ;
 * 
 *     console.log('Starting pdf merge ...');
 * 
 *     // merge pdfs to local file
 *     client.saveToFile(localFile, 
 *         function(err, fileName) {
 *             if (err) return console.error("An error occurred: " + err);
 *             console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());
 * 
 *             var usageClient = new selectpdf.UsageClient(apiKey);
 *             usageClient.getUsage(false, function(err2, data) {
 *                 if (err2) return console.error("An error occurred getting the usage info: " + err2);
 *                 console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
 *             });
 *         }
 *     );
 * 
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 * 
 */
function PdfMergeClient(apiKey) {
    ApiClient.call(this);

    this.apiEndpoint = "https://selectpdf.com/api2/pdfmerge/";
    this.parameters["key"] = apiKey;

    this.fileIdx = 0;
};

PdfMergeClient.prototype = Object.create(ApiClient.prototype);
Object.defineProperty(PdfMergeClient.prototype, 'constructor', { 
    value: PdfMergeClient, 
    enumerable: false, 
    writable: true 
});

/**
 * Add local PDF document to the list of input files.
 * 
 * @param inputPdf Path to a local PDF file.
 * @param userPassword User password for the PDF document (optional).
 * @returns Reference to the current object.
 */
PdfMergeClient.prototype.addFile = function(inputPdf, userPassword) {
    this.fileIdx++;

    this.files['file_' + this.fileIdx] = inputPdf;
    this.parameters['url_' + this.fileIdx] = '';

    if (userPassword) {
        this.parameters['password_' + this.fileIdx] = userPassword;
    }
    else {
        this.parameters['password_' + this.fileIdx] = '';
    }

    return this;
}

/**
 * Add remote PDF document to the list of input files.
 * 
 * @param inputUrl Url of a remote PDF file. 
 * @param userPassword User password for the PDF document (optional).
 * @returns Reference to the current object.
 */
PdfMergeClient.prototype.addUrlFile = function(inputUrl, userPassword) {
    this.fileIdx++;

    this.parameters['url_' + this.fileIdx] = inputUrl;

    if (userPassword) {
        this.parameters['password_' + this.fileIdx] = userPassword;
    }
    else {
        this.parameters['password_' + this.fileIdx] = '';
    }

    return this;
}

/**
 * Merge all specified input pdfs and return the resulted PDF.
 * 
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
PdfMergeClient.prototype.save = function(callback) {
    this.parameters['async'] = 'False';
    this.parameters['files_no'] = this.fileIdx;

    var currentObject = this;

    this.performPostAsMultipartFormData(function(err, data) {
        currentObject.fileIdx = 0;
        currentObject.files = {};

        callback(err, data);
    });
};

/**
 * Merge all specified input pdfs and writes the resulted PDF to a local file.
 * 
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
PdfMergeClient.prototype.saveToFile = function(filePath, callback) {
    if (!filePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.save(function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(filePath, data, 'binary', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", filePath);
                    callback(null, filePath);
                }
            });
        
        }
    });
};

/**
 * Merge all specified input pdfs and return the resulted PDF. An asynchronous call is used.
 * 
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain data received.
 */
PdfMergeClient.prototype.saveAsync = function(callback) {
    this.parameters['files_no'] = this.fileIdx;

    var currentObject = this;

    this.runAsyncJob(true, function(errAsyncJob, data) {
        currentObject.fileIdx = 0;
        currentObject.files = {};

        callback(errAsyncJob, data);
    });

};

/**
 * Merge all specified input pdfs and writes the resulted PDF to a local file. An asynchronous call is used.
 * 
 * @param filePath Local file including path if necessary.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
 PdfMergeClient.prototype.saveToFileAsync = function(filePath, callback) {
    if (!filePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.saveAsync(function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(filePath, data, 'binary', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", filePath);
                    callback(null, filePath);
                }
            });
        
        }
    });
};

/**
* Set the PDF document title.
*
* @param docTitle Document title.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setDocTitle = function(docTitle) {
    this.parameters['doc_title'] = docTitle;
    return this;
};

/**
* Set the PDF document subject.
*
* @param docSubject Document subject.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setDocSubject = function(docSubject) {
    this.parameters['doc_subject'] = docSubject;
    return this;
};

/**
* Set the PDF document keywords.
*
* @param docKeywords Document keywords.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setDocKeywords = function(docKeywords) {
    this.parameters['doc_keywords'] = docKeywords;
    return this;
};

/**
* Set the PDF document author.
*
* @param docAuthor Document author.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setDocAuthor = function(docAuthor) {
    this.parameters['doc_author'] = docAuthor;
    return this;
};

/**
* Add the date and time when the PDF document was created to the PDF document information. The default value is False.
*
* @param docAddCreationDate Add creation date to the document metadata or not.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setDocAddCreationDate = function(docAddCreationDate) {
    this.parameters['doc_add_creation_date'] = this.serializeBoolean(docAddCreationDate);
    return this;
};

/**
* Set the page layout to be used when the document is opened in a PDF viewer. The default value is 1 - OneColumn.
*
* @param pageLayout Page layout. Possible values: 0 (Single Page), 1 (One Column), 2 (Two Column Left), 3 (Two Column Right).
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerPageLayout = function(pageLayout) {
    if (!Number.isInteger(pageLayout)) {
        throw new ApiException('Page Layout must be an integer number.');        
    }
    if (pageLayout !=0 && pageLayout != 1 && pageLayout !=2 && pageLayout !=3) {
        throw new ApiException('Allowed values for Page Layout: 0 (Single Page), 1 (One Column), 2 (Two Column Left), 3 (Two Column Right).');
    }
    
    this.parameters['viewer_page_layout'] = pageLayout;
    return this;
};

/**
* Set the document page mode when the pdf document is opened in a PDF viewer. The default value is 0 - UseNone.
*
* @param pageMode Page mode. Possible values: 0 (Use None), 1 (Use Outlines), 2 (Use Thumbs), 3 (Full Screen), 4 (Use OC), 5 (Use Attachments).
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerPageMode = function(pageMode) {
    if (!Number.isInteger(pageMode)) {
        throw new ApiException('Page Layout must be an integer number.');        
    }
    if (pageMode !=0 && pageMode != 1 && pageMode !=2 && pageMode !=3 && pageMode !=4 && pageMode !=5) {
        throw new ApiException('Allowed values for Page Mode: 0 (Use None), 1 (Use Outlines), 2 (Use Thumbs), 3 (Full Screen), 4 (Use OC), 5 (Use Attachments).');
    }
    
    this.parameters['viewer_page_mode'] = pageMode;
    return this;
};

/**
* Set a flag specifying whether to position the document's window in the center of the screen. The default value is False.
*
* @param viewerCenterWindow Center window or not.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerCenterWindow = function(viewerCenterWindow) {
    this.parameters['viewer_center_window'] = this.serializeBoolean(viewerCenterWindow);
    return this;
};

/**
* Set a flag specifying whether the window's title bar should display the document title taken from document information. The default value is False.
*
* @param viewerDisplayDocTitle Display title or not.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerDisplayDocTitle = function(viewerDisplayDocTitle) {
    this.parameters['viewer_display_doc_title'] = this.serializeBoolean(viewerDisplayDocTitle);
    return this;
};

/**
* Set a flag specifying whether to resize the document's window to fit the size of the first displayed page. The default value is False.
*
* @param viewerFitWindow Fit window or not.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerFitWindow = function(viewerFitWindow) {
    this.parameters['viewer_fit_window'] = this.serializeBoolean(viewerFitWindow);
    return this;
};

/**
* Set a flag specifying whether to hide the pdf viewer application's menu bar when the document is active. The default value is False.
*
* @param viewerHideMenuBar Hide menu bar or not.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerHideMenuBar = function(viewerHideMenuBar) {
    this.parameters['viewer_hide_menu_bar'] = this.serializeBoolean(viewerHideMenuBar);
    return this;
};

/**
* Set a flag specifying whether to hide the pdf viewer application's tool bars when the document is active. The default value is False.
*
* @param viewerHideToolbar Hide tool bars or not.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerHideToolbar = function(viewerHideToolbar) {
    this.parameters['viewer_hide_toolbar'] = this.serializeBoolean(viewerHideToolbar);
    return this;
};

/**
* Set a flag specifying whether to hide user interface elements in the document's window (such as scroll bars and navigation controls), 
* leaving only the document's contents displayed. The default value is False.
*
* @param viewerHideWindowUI Hide window UI or not.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setViewerHideWindowUI = function(viewerHideWindowUI) {
    this.parameters['viewer_hide_window_ui'] = this.serializeBoolean(viewerHideWindowUI);
    return this;
};

/**
* Set PDF user password.
*
* @param userPassword PDF user password.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setUserPassword = function(userPassword) {
    this.parameters['user_password'] = userPassword;
    return this;
};

/**
* Set PDF owner password.
*
* @param ownerPassword PDF owner password.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setOwnerPassword = function(ownerPassword) {
    this.parameters['owner_password'] = ownerPassword;
    return this;
};

/**
* Set the maximum amount of time (in seconds) for this job. 
* The default value is 30 seconds. Use a larger value (up to 120 seconds allowed) for large documents.
*
* @param timeout Timeout in seconds.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setTimeout = function(timeout) {
    if (!Number.isInteger(timeout)) {
        throw new ApiException('Timeout value must be an integer number.');        
    } 
    
    this.parameters['timeout'] = timeout;
    return this;
};

/**
* Set a custom parameter. Do not use this method unless advised by SelectPdf.
*
* @param parameterName Parameter name.
* @param parameterValue Parameter value.
* @returns Reference to the current object.
*/
PdfMergeClient.prototype.setCustomParameter = function(parameterName, parameterValue) {
    this.parameters[parameterName] = parameterValue;
    return this;
};


/**
 * Pdf To Text Conversion with SelectPdf Online API.
 * 
 * @param apiKey API key.
 * 
 * @example <caption>Pdf To Text in NodeJS with SelectPdf online REST API:</caption>
 * var selectpdf = require('selectpdf');
 * 
 * console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);
 * 
 * try {
 *     var testPdf = 'Input.pdf';
 *     var localFile = 'Result.txt';
 *     var apiKey = 'Your API key here';
 * 
 *     var client = new selectpdf.PdfToTextClient(apiKey);
 * 
 *     // set parameters - see full list at https://selectpdf.com/pdf-to-text-api/
 *     client
 *         .setStartPage(1) // start page (processing starts from here)
 *         .setEndPage(0) // end page (set 0 to process file til the end)
 *         .setOutputFormat(0) // set output format (0-Text or 1-HTML)
 *     ;
 * 
 *     console.log('Starting pdf to text ...');
 * 
 *     // convert local pdf to local text file
 *     client.getTextFromFileToFile(testPdf, localFile, 
 *         function(err, fileName) {
 *             if (err) return console.error("An error occurred: " + err);
 *             console.log("Finished! Result is in file '" + fileName + "'. Number of pages processed: " + client.getNumberOfPages());
 * 
 *             var usageClient = new selectpdf.UsageClient(apiKey);
 *             usageClient.getUsage(false, function(err2, data) {
 *                 if (err2) return console.error("An error occurred getting the usage info: " + err2);
 *                 console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
 *             });
 *         }
 *     );
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 * 
 * @example <caption>Search PDF in NodeJS with SelectPdf online REST API:</caption>
 * var selectpdf = require('selectpdf');
 * 
 * console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);
 * 
 * try {
 *     var testPdf = 'Input.pdf';
 *     var apiKey = 'Your API key here';
 * 
 *     var client = new selectpdf.PdfToTextClient(apiKey);
 * 
 *     // set parameters - see full list at https://selectpdf.com/pdf-to-text-api/
 *     client
 *         .setStartPage(1) // start page (processing starts from here)
 *         .setEndPage(0) // end page (set 0 to process file til the end)
 *     ;
 * 
 *     console.log('Starting search pdf ...');
 * 
 *     // search local pdf
 *     client.searchFile(testPdf, 'pdf', false, false,
 *         function(err, results) {
 *             if (err) return console.error("An error occurred: " + err);
 * 
 *             console.log("Search results: " + JSON.stringify(results) +".\nSearch results count: " + results.length + ".");
 *             console.log("Finished! Number of pages processed: " + client.getNumberOfPages());
 * 
 *             var usageClient = new selectpdf.UsageClient(apiKey);
 *             usageClient.getUsage(false, function(err2, data) {
 *                 if (err2) return console.error("An error occurred getting the usage info: " + err2);
 *                 console.log("Conversions remained this month: " +  data["available"] + ". Usage: " + JSON.stringify(data));
 *             });
 *         }
 *     );
 * }
 * catch (ex) {
 *     console.log("An error occurred: " + ex);
 * }
 * 
 */
function PdfToTextClient(apiKey) {
    ApiClient.call(this);

    this.apiEndpoint = "https://selectpdf.com/api2/pdftotext/";
    this.parameters["key"] = apiKey;
};

PdfToTextClient.prototype = Object.create(ApiClient.prototype);
Object.defineProperty(PdfToTextClient.prototype, 'constructor', { 
    value: PdfToTextClient, 
    enumerable: false, 
    writable: true 
});

/**
 * Get the text from the specified pdf.
 * 
 * @param inputPdf Path to a local PDF file.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain text received.
 */
PdfToTextClient.prototype.getTextFromFile = function(inputPdf, callback) {
    this.parameters['async'] = 'False';
    this.parameters['action'] = 'Convert';
    this.parameters['url'] = '';

    this.files = {};
    this.files['inputPdf'] = inputPdf;

    this.performPostAsMultipartFormData(function(err, data) {
        if (!err && typeof data !== 'undefined') { 
            data = new Buffer.from(data).toString();
        }
        callback(err, data);
    });
};

/**
 * Get the text from the specified pdf and write it to the specified text file.
 * 
 * @param inputPdf Path to a local PDF file.
 * @param outputFilePath The output file where the resulted text will be written.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
 PdfToTextClient.prototype.getTextFromFileToFile = function(inputPdf, outputFilePath, callback) {
    if (!outputFilePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.getTextFromFile(inputPdf, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(outputFilePath, data, 'utf8', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", outputFilePath);
                    callback(null, outputFilePath);
                }
            });
        
        }
    });
};

/**
 * Get the text from the specified pdf with an asynchronous call.
 * 
 * @param inputPdf Path to a local PDF file.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain text received.
 */
 PdfToTextClient.prototype.getTextFromFileAsync = function(inputPdf, callback) {
    this.parameters['action'] = 'Convert';
    this.parameters['url'] = '';

    this.files = {};
    this.files['inputPdf'] = inputPdf;

    this.runAsyncJob(true, function(errAsyncJob, data) {
        if (!errAsyncJob && typeof data !== 'undefined') { 
            data = new Buffer.from(data).toString();
        }

        callback(errAsyncJob, data);
    });
};

/**
 * Get the text from the specified pdf with an asynchronous call and write it to the specified text file.
 * 
 * @param inputPdf Path to a local PDF file.
 * @param outputFilePath The output file where the resulted text will be written.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
 PdfToTextClient.prototype.getTextFromFileToFileAsync = function(inputPdf, outputFilePath, callback) {
    if (!outputFilePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.getTextFromFileAsync(inputPdf, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(outputFilePath, data, 'utf8', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", outputFilePath);
                    callback(null, outputFilePath);
                }
            });
        
        }
    });
};

/**
 * Get the text from the specified pdf.
 * 
 * @param url Address of the PDF file.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain text received.
 */
 PdfToTextClient.prototype.getTextFromUrl = function(url, callback) {
    if (!url.match(/^https?:\/\/.*$/i)) {
        callback(new ApiException('The supported protocols for the PDFs available online are http:// and https://.'));
        return;
    }

    this.parameters['async'] = 'False';
    this.parameters['action'] = 'Convert';

    this.files = {};
    this.parameters['url'] = url;

    this.performPostAsMultipartFormData(function(err, data) {
        if (!err && typeof data !== 'undefined') { 
            data = new Buffer.from(data).toString();
        }
        callback(err, data);
    });
};

/**
 * Get the text from the specified pdf and write it to the specified text file.
 * 
 * @param url Address of the PDF file.
 * @param outputFilePath The output file where the resulted text will be written.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
 PdfToTextClient.prototype.getTextFromUrlToFile = function(url, outputFilePath, callback) {
    if (!outputFilePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.getTextFromUrl(url, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(outputFilePath, data, 'utf8', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", outputFilePath);
                    callback(null, outputFilePath);
                }
            });
        
        }
    });
};

/**
 * Get the text from the specified pdf with an asynchronous call.
 * 
 * @param url Address of the PDF file.
 * @param callback Callback function(err, data). Object err will contain the error, if any. If there is no error, data parameter will contain text received.
 */
 PdfToTextClient.prototype.getTextFromUrlAsync = function(url, callback) {
    if (!url.match(/^https?:\/\/.*$/i)) {
        callback(new ApiException('The supported protocols for the PDFs available online are http:// and https://.'));
        return;
    }

    this.parameters['action'] = 'Convert';

    this.files = {};
    this.parameters['url'] = url;

    this.runAsyncJob(true, function(errAsyncJob, data) {
        if (!errAsyncJob && typeof data !== 'undefined') { 
            data = new Buffer.from(data).toString();
        }

        callback(errAsyncJob, data);
    });
};

/**
 * Get the text from the specified pdf with an asynchronous call and write it to the specified text file.
 * 
 * @param url Address of the PDF file.
 * @param outputFilePath The output file where the resulted text will be written.
 * @param callback Callback function(err, filePath). Object err will contain the error, if any. If there is no error, filePath will contain the name of the output file.
 */
 PdfToTextClient.prototype.getTextFromUrlToFileAsync = function(url, outputFilePath, callback) {
    if (!outputFilePath) {
        callback(new ApiException('Output file not provided.'));
        return;
    }
    
    this.getTextFromUrlAsync(url, function(err, data) {
        if (err) {
            //console.log("An error occurred.");
            callback(err);
        }
        else {
            // all ok - save to file
            fs.writeFile(outputFilePath, data, 'utf8', function(fileError) {
                if (fileError) {
                    //console.log("Error while saving the file: " + fileError);
                    callback(fileError);
                } else {
                    //console.log("The file %s was saved!", outputFilePath);
                    callback(null, outputFilePath);
                }
            });
        
        }
    });
};

/**
 * Search for a specific text in a PDF document.
 * 
 * @param inputPdf Path to a local PDF file.
 * @param textToSearch Text to search.
 * @param caseSensitive If the search is case sensitive or not.
 * @param wholeWordsOnly If the search works on whole words or not.
 * @param callback Callback function(err, data). Object err will contain the error, if any. 
 * If there is no error, data parameter will contain text positions in the current PDF document in JSON format.
 */
 PdfToTextClient.prototype.searchFile = function(inputPdf, textToSearch, caseSensitive, wholeWordsOnly, callback) {
    if (!textToSearch) {
        callback(new ApiException('Search text cannot be empty.'));
        return;
    }

    this.parameters['async'] = 'False';
    this.parameters['action'] = 'Search';
    this.parameters['url'] = '';
    this.parameters['search_text'] = textToSearch;
    this.parameters['case_sensitive'] = this.serializeBoolean(caseSensitive);
    this.parameters['whole_words_only'] = this.serializeBoolean(wholeWordsOnly);

    this.files = {};
    this.files['inputPdf'] = inputPdf;

    this.headers["Accept"] = "application/json";

    this.performPostAsMultipartFormData(function(err, data) {
        if (err) return callback(err);

        data = data.toString();
        if (!data)
            data = "[]";

        callback(err, JSON.parse(data));
    });
};

/**
 * Search for a specific text in a PDF document with an asynchronous call.
 * 
 * @param inputPdf Path to a local PDF file.
 * @param textToSearch Text to search.
 * @param caseSensitive If the search is case sensitive or not.
 * @param wholeWordsOnly If the search works on whole words or not.
 * @param callback Callback function(err, data). Object err will contain the error, if any. 
 * If there is no error, data parameter will contain text positions in the current PDF document in JSON format.
 */
 PdfToTextClient.prototype.searchFileAsync = function(inputPdf, textToSearch, caseSensitive, wholeWordsOnly, callback) {
    if (!textToSearch) {
        callback(new ApiException('Search text cannot be empty.'));
        return;
    }

    this.parameters['action'] = 'Search';
    this.parameters['url'] = '';
    this.parameters['search_text'] = textToSearch;
    this.parameters['case_sensitive'] = this.serializeBoolean(caseSensitive);
    this.parameters['whole_words_only'] = this.serializeBoolean(wholeWordsOnly);

    this.files = {};
    this.files['inputPdf'] = inputPdf;

    this.headers["Accept"] = "application/json";

    this.runAsyncJob(true, function(errAsyncJob, data) {
        if (errAsyncJob) return callback(errAsyncJob);

        data = data.toString();
        if (!data)
            data = "[]";

        callback(errAsyncJob, JSON.parse(data));
    });
};

/**
 * Search for a specific text in a PDF document.
 * 
 * @param url Address of the PDF file.
 * @param textToSearch Text to search.
 * @param caseSensitive If the search is case sensitive or not.
 * @param wholeWordsOnly If the search works on whole words or not.
 * @param callback Callback function(err, data). Object err will contain the error, if any. 
 * If there is no error, data parameter will contain text positions in the current PDF document in JSON format.
 */
 PdfToTextClient.prototype.searchUrl = function(url, textToSearch, caseSensitive, wholeWordsOnly, callback) {
    if (!url.match(/^https?:\/\/.*$/i)) {
        callback(new ApiException('The supported protocols for the PDFs available online are http:// and https://.'));
        return;
    }

    if (!textToSearch) {
        callback(new ApiException('Search text cannot be empty.'));
        return;
    }

    this.parameters['async'] = 'False';
    this.parameters['action'] = 'Search';
    this.parameters['search_text'] = textToSearch;
    this.parameters['case_sensitive'] = this.serializeBoolean(caseSensitive);
    this.parameters['whole_words_only'] = this.serializeBoolean(wholeWordsOnly);

    this.files = {};
    this.parameters['url'] = url;

    this.headers["Accept"] = "application/json";

    this.performPostAsMultipartFormData(function(err, data) {
        if (err) return callback(err);

        data = data.toString();
        if (!data)
            data = "[]";

        callback(err, JSON.parse(data));
    });
};

/**
 * Search for a specific text in a PDF document with an asynchronous call.
 * 
 * @param url Address of the PDF file.
 * @param textToSearch Text to search.
 * @param caseSensitive If the search is case sensitive or not.
 * @param wholeWordsOnly If the search works on whole words or not.
 * @param callback Callback function(err, data). Object err will contain the error, if any. 
 * If there is no error, data parameter will contain text positions in the current PDF document in JSON format.
 */
 PdfToTextClient.prototype.searchUrlAsync = function(url, textToSearch, caseSensitive, wholeWordsOnly, callback) {
    if (!url.match(/^https?:\/\/.*$/i)) {
        callback(new ApiException('The supported protocols for the PDFs available online are http:// and https://.'));
        return;
    }

    if (!textToSearch) {
        callback(new ApiException('Search text cannot be empty.'));
        return;
    }

    this.parameters['action'] = 'Search';
    this.parameters['search_text'] = textToSearch;
    this.parameters['case_sensitive'] = this.serializeBoolean(caseSensitive);
    this.parameters['whole_words_only'] = this.serializeBoolean(wholeWordsOnly);

    this.files = {};
    this.parameters['url'] = url;

    this.headers["Accept"] = "application/json";

    this.runAsyncJob(true, function(errAsyncJob, data) {
        if (errAsyncJob) return callback(errAsyncJob);

        data = data.toString();
        if (!data)
            data = "[]";

        callback(errAsyncJob, JSON.parse(data));
    });
};

/**
* Set Start Page number. Default value is 1 (first page of the document).
*
* @param startPage Start page number (1-based).
* @returns Reference to the current object.
*/
PdfToTextClient.prototype.setStartPage = function(startPage) {
    if (!Number.isInteger(startPage)) {
        throw new ApiException('Start page number must be an integer number.');        
    } 
    
    this.parameters['start_page'] = startPage;
    return this;
};

/**
* Set End Page number. Default value is 0 (process till the last page of the document).
*
* @param endPage End page number (1-based).
* @returns Reference to the current object.
*/
PdfToTextClient.prototype.setEndPage = function(endPage) {
    if (!Number.isInteger(endPage)) {
        throw new ApiException('End page number must be an integer number.');        
    } 
    
    this.parameters['end_page'] = endPage;
    return this;
};

/**
* Set PDF user password.
*
* @param userPassword PDF user password.
* @returns Reference to the current object.
*/
PdfToTextClient.prototype.setUserPassword = function(userPassword) {
    this.parameters['user_password'] = userPassword;
    return this;
};

/**
* Set the text layout. The default value is 0 (Original).
*
* @param textLayout The text layout. Allowed values for Text Layout: 0 (Original), 1 (Reading).
* @returns Reference to the current object.
*/
PdfToTextClient.prototype.setTextLayout = function(textLayout) {
    if (!Number.isInteger(textLayout)) {
        throw new ApiException('Text layout must be an integer number.');        
    }
    if (textLayout !=0 && textLayout !=1) {
        throw new ApiException('Allowed values for Text Layout: 0 (Original), 1 (Reading).');
    }
    
    this.parameters['text_layout'] = textLayout;
    return this;
};

/**
* Set the output format. The default value is 0 (Text).
*
* @param outputFormat The output format. Allowed values for Output Format: 0 (Text), 1 (Html).
* @returns Reference to the current object.
*/
PdfToTextClient.prototype.setOutputFormat = function(outputFormat) {
    if (!Number.isInteger(outputFormat)) {
        throw new ApiException('Output format must be an integer number.');        
    }
    if (outputFormat !=0 && outputFormat !=1) {
        throw new ApiException('Allowed values for Output Format: 0 (Text), 1 (Html).');
    }
    
    this.parameters['output_format'] = outputFormat;
    return this;
};

/**
* Set the maximum amount of time (in seconds) for this job. 
* The default value is 30 seconds. Use a larger value (up to 120 seconds allowed) for large documents.
*
* @param timeout Timeout in seconds.
* @returns Reference to the current object.
*/
PdfToTextClient.prototype.setTimeout = function(timeout) {
    if (!Number.isInteger(timeout)) {
        throw new ApiException('Timeout value must be an integer number.');        
    } 
    
    this.parameters['timeout'] = timeout;
    return this;
};

/**
* Set a custom parameter. Do not use this method unless advised by SelectPdf.
*
* @param parameterName Parameter name.
* @param parameterValue Parameter value.
* @returns Reference to the current object.
*/
PdfToTextClient.prototype.setCustomParameter = function(parameterName, parameterValue) {
    this.parameters[parameterName] = parameterValue;
    return this;
};



//
// Module exports
//
module.exports = {
    CLIENT_VERSION: CLIENT_VERSION,
    ApiException: ApiException,
    DemoRateLimitException: DemoRateLimitException,
    DemoSafetyException: DemoSafetyException,
    DemoUnsupportedException: DemoUnsupportedException,
    HtmlToPdfClient: HtmlToPdfClient,
    InvoiceClient: InvoiceClient,
    UsageClient: UsageClient,
    PdfMergeClient: PdfMergeClient,
    PdfToTextClient: PdfToTextClient,
    AsyncJobClient: AsyncJobClient,
    WebElementsClient: WebElementsClient,
    PageSize: PageSize,
    PageOrientation: PageOrientation,
    RenderingEngine: RenderingEngine,
    SecureProtocol: SecureProtocol,
    PageLayout: PageLayout,
    PageMode: PageMode,
    PageNumbersAlignment: PageNumbersAlignment,
    StartupMode: StartupMode,
    TextLayout: TextLayout,
    OutputFormat: OutputFormat,
    PdfStandard: PdfStandard,
    ZugferdProfile: ZugferdProfile,
    ZugferdRelationship: ZugferdRelationship,
    ZugferdSchema: ZugferdSchema
};