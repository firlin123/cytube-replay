addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    let response;
    const url = new URL(request.url);
    const requestedUrl = getUrlParam(url);
    if (requestedUrl != null) {
        try {
            const requestHeaders = Object.fromEntries(Array.from(request.headers.entries()));
            const requestedResponse = await fetch(requestedUrl, { headers: requestHeaders });
            if (requestedResponse.ok) {
                const requestedContentType = requestedResponse.headers.get('content-type');
                if (requestedContentType.startsWith('application/json') || requestedContentType.startsWith('application/zip')) {
                    const headers = Object.fromEntries(Array.from(requestedResponse.headers.entries()));
                    headers['access-control-allow-origin'] = '*';
                    response = new Response(requestedResponse.body, { headers });
                }
                else response = createResponse("Error response was not application/json or application/zip", 400, "Bad Request");
            }
            else response = createResponse("Error response was not ok", 400, "Bad Request");
        }
        catch (e) { response = createResponse("Unknown error occured", 400, "Bad Request"); }
    }
    else response = createResponse("Error invalid url", 400, "Bad Request");
    return response;
}

function getUrlParam(requestUrl) {
    try {
        if (requestUrl.pathname === '/') {
            if (requestUrl.searchParams.has('url')) {
                let url = new URL(requestUrl.searchParams.get('url'));
                if (url.protocol === 'https:' || url.protocol === 'http:') {
                    return url.toString();
                }
            }
        }
    }
    catch (e) { }
    return null;
}

function createResponse(text, status, statusText) {
    return new Response(text, {
        status, statusText, headers: {
            'access-control-allow-origin': '*',
            'x-best-pony': 'fluttershy'
        }
    });
}