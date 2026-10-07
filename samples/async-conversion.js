var selectpdf = require('selectpdf');

console.log("This is SelectPdf-%s.", selectpdf.CLIENT_VERSION);

try {
    var url = 'https://selectpdf.com';
    var localFile = 'Test.pdf';

    // Async conversions are not supported on the demo endpoint -
    // this sample requires a paid API key.
    var apiKey = 'Your API key here';

    var client = new selectpdf.HtmlToPdfClient(apiKey);

    // Tune polling for the async job (optional).
    // The client polls /api2/asyncjob/ every AsyncCallsPingInterval
    // seconds, up to AsyncCallsMaxPings times, then gives up.
    client.AsyncCallsPingInterval = 3; // seconds between polls
    client.AsyncCallsMaxPings = 1000;  // max polls before timeout

    client
        .setPageSize('A4')
        .setPageOrientation('Portrait')
        .setMargins(0)
        .setPageBreaksEnhancedAlgorithm(true)
    ;

    console.log("Starting async conversion ...");

    // url to file (async)
    client.convertUrlToFileAsync(url, localFile,
        function(err, fileName) {
            if (err) return console.log("An error occurred: " + err);

            console.log("Finished! Result is in file '" + fileName + "'. Number of pages: " + client.getNumberOfPages());

            // response telemetry
            console.log("Mode: " + client.getMode() + ", Execution: " + client.getExecutionMode() + ".");
            console.log("Credits remaining: " + client.getCreditsRemaining() + " / " + client.getCreditsTotal() + ".");
        }
    );

    // url to memory (async)
    // client.convertUrlAsync(url, function(err, pdf) { ... });

    // html string to file (async)
    // client.convertHtmlStringToFileAsync('This is some <b>html</b>.', localFile, function(err, fileName) { ... });

    // html string to memory (async)
    // client.convertHtmlStringAsync('This is some <b>html</b>.', function(err, pdf) { ... });
}
catch (ex) {
    console.log("An error occurred: " + ex);
}
