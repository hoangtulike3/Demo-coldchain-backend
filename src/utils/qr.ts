import * as qrcode from "qrcode";

export const generateQR = async (text: any) => {
  try {
    const options: any = {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
      margin: 1,
    };
    return await qrcode.toDataURL(text, options);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to generate QR code");
  }
};
