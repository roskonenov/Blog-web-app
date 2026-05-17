export default function isValidImageURL(url) {
    try {
        const parsedURL = new URL(url);
        const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

        const hasValidProtocol = parsedURL.protocol === "http:"
            || parsedURL.protocol === "https:";

        const hasValidExtension = validExtensions.some(ext =>
            parsedURL.pathname.toLowerCase().endsWith(ext)
        );

        return hasValidProtocol && hasValidExtension;
        
    } catch {
        return false;
    }
}