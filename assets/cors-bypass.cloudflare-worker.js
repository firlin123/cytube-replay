addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    let url = getUrl(request.url);
    if (url != null) {
        try {
            let reqHeaders = Object.fromEntries(Array.from(request.headers.entries()));
            let response = await fetch(url, { headers: reqHeaders });
            if (response.ok) {
                let contentType = response.headers.get('content-type');
                if (contentType.startsWith('application/json') || contentType.startsWith('application/zip')) {
                    let headers = Object.fromEntries(Array.from(response.headers.entries()));
                    headers['access-control-allow-origin'] = '*';
                    return new Response(response.body, { headers });
                }
                else return createResponse("Error response was not application/json or application/zip", 400, "Bad Request");
            }
            else return createResponse("Error response was not ok", 400, "Bad Request");
        }
        catch (e) { return createResponse("Unknown error occured", 400, "Bad Request"); }
    }
    else return createResponse("Error invalid url", 400, "Bad Request");
}

function getUrl(reqUrl) {
    try {
        let reqUrlObj = new URL(reqUrl);
        if (reqUrlObj.pathname === '/') {
            if (reqUrlObj.searchParams.has('url')) {
                let urlObj = new URL(reqUrlObj.searchParams.get('url'));
                if (urlObj.protocol === 'https:' || urlObj.protocol === 'http:') {
                    return urlObj.toString();
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
            'access-control-allow-origin': '*'
        }
    });
}
