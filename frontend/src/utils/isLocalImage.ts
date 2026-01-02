import { RNfile } from "../api/image.api";

export function isLocalImage( image?: string | RNfile ): image is RNfile {
    return (
        typeof image === "object" &&
        typeof image.uri === "string" &&
        image.uri.startsWith("file://")
    );
}