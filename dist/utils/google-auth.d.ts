import { OAuth2Client } from "google-auth-library";
declare const GoogleOAuth2: OAuth2Client;
export declare const verifyIDToken: (idToken: string) => Promise<import("google-auth-library").TokenPayload | null | undefined>;
export default GoogleOAuth2;
