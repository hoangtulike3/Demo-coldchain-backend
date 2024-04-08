import { OAuth2Client } from "google-auth-library";
import config from "../config";

const GoogleOAuth2 = new OAuth2Client(config.google.clientIdWeb, config.google.clientSecret);

export const verifyIDToken = async (idToken: string) => {
  try {
    const ticket = await GoogleOAuth2.verifyIdToken({ idToken, audience: config.google.clientIdWeb });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

export default GoogleOAuth2;
