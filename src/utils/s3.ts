import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "../config";
import moment from "moment-timezone";

const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  },
});

export async function uploadPlaceFileToS3(fileBuffer: any, fileName: any, mimeType: any) {
  const uploadParams: any = {
    Bucket: config.s3.bucket,
    Key: `place/images/${moment().format("YYYYMMDD_HH:mm:ss")}-${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${uploadParams.Key}`;
  } catch (err) {
    console.error("Error uploading file: ", err);
    throw new Error("Error uploading file");
  }
}

export async function uploadPackageFileToS3(fileBuffer: any, fileName: any, mimeType: any) {
  const nameArray = fileName.split(".");
  const tail = nameArray[nameArray.length - 1];
  const uploadParams: any = {
    Bucket: config.s3.bucket,
    Key: `package/images/${moment().format("YYYYMMDD_HH_mm_ss") + Math.ceil(Math.random() * 1000)}.${tail}`,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${uploadParams.Key}`;
  } catch (err) {
    console.error("Error uploading file: ", err);
    throw new Error("Error uploading file");
  }
}
