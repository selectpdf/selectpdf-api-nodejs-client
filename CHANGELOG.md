### 1.6.0
* Accessible PDF and PDF standards on HtmlToPdfClient: setTagged, setPdfStandard (PdfStandard: Full, PdfA, PdfA2B, PdfA3A, PdfA3B, PdfA3U, PdfX, PdfSiqQ_A, PdfSiqQ_B) and setDocumentLanguage. Tagged output needs the Blink or Chromium engine; when no engine is set, the API promotes the conversion to Chromium.
* Electronic invoicing: new InvoiceClient creates ZUGFeRD / Factur-X hybrid invoices - one PDF/A-3 document with the invoice XML embedded. setInvoiceXmlFile / setInvoiceXml, setZugferdProfile, setZugferdRelationship, setZugferdSchema (ZugferdProfile, ZugferdRelationship, ZugferdSchema) and the createFromUrl / createFromHtmlString methods (with ToFile and Async variants). Requires an API key.
* Page height and authentication on HtmlToPdfClient: setWebPageFixedSize, setAuthUsername, setAuthPassword.
* Enumerations exported for every setter value: PageSize, PageOrientation, RenderingEngine, SecureProtocol, PageLayout, PageMode, PageNumbersAlignment, StartupMode, TextLayout, OutputFormat, PdfStandard, ZugferdProfile, ZugferdRelationship, ZugferdSchema.
* setApiEndpoint, setApiAsyncEndpoint, setApiWebElementsEndpoint on every client. AsyncJobClient and WebElementsClient are exported.
* Fixes: conversions with pdf_web_elements_selectors that match many elements no longer fail with "Parse Error: Header overflow" (the response header limit is raised to 100MB, like the .NET client); setHeaderUrl, setHeaderBaseUrl, setFooterUrl and setFooterBaseUrl throw ApiException for an invalid url (they failed with a ReferenceError); multipart requests (PDF merge, PDF to text, invoices) send numeric 0 and False values instead of dropping them; uploaded files and binary data are sent as raw bytes; asynchronous calls use the async jobs endpoint set on the client; error messages are strings.

### 1.5.0
There was no separate Node.js 1.5.0 release - these features ship in 1.6.0.
* Keyless demo endpoint: construct HtmlToPdfClient without an API key (or with an empty string or "demo") to convert with no signup. Output is watermarked, capped at 5 pages and rendered with Chromium. isDemoMode and isDemoResponse report the mode; getClampedFields / wasClamped and getDroppedFields / wasAnyFieldDropped report the parameters the demo endpoint adjusted or ignored.
* Typed demo errors: DemoRateLimitException (statusCode, reason, retryAfter, upgradeUrl, responseBody), DemoSafetyException (statusCode, field, reason, responseBody) and DemoUnsupportedException (statusCode, field, upgradeUrl, responseBody). All derive from ApiException. In demo mode setUserPassword and setOwnerPassword throw DemoUnsupportedException, and the asynchronous conversions pass it to the callback.
* Response telemetry on every client: getCreditsTotal, getCreditsRemaining, getMode and getExecutionMode, read from the X-SelectPdf-* response headers.
* Chromium rendering engine: setRenderingEngine('Chromium').

### 1.4.0
* Pdf Merge Client, Pdf To Text Client

### 1.3.0
* Html To Pdf Client
