export function urlAndPatternNormalize(urlPattern: string[] = [], url?: string) {
    const rawURL = url ?? "/";
    const pathOnly = rawURL.split("?")[0]?.split("#")[0];

    const normalize = (u: string) => u.replace(/(^\/+|\/+$)/g, "");

    const pattern = urlPattern.map(normalize).filter(Boolean).join("/") ;
    const path = normalize(pathOnly ?? "");
    
    const patternParts = pattern === "" ? [] : pattern.split("/");
    const pathParts = path === "" ? [] : path.split("/");

    return {
        patternParts, pathParts
    };
}