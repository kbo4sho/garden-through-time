const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || request.method !== "GET") {
      return response;
    }

    const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
    if (!acceptsHtml) {
      return response;
    }

    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
  },
};

export default worker;
