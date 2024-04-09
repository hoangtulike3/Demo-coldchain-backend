"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPackageFileToS3 = exports.uploadPlaceFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = __importDefault(require("../config"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const s3Client = new client_s3_1.S3Client({
    region: config_1.default.s3.region,
    credentials: {
        accessKeyId: config_1.default.s3.accessKey,
        secretAccessKey: config_1.default.s3.secretKey,
    },
});
async function uploadPlaceFileToS3(fileBuffer, fileName, mimeType) {
    const uploadParams = {
        Bucket: config_1.default.s3.bucket,
        Key: `place/images/${(0, moment_timezone_1.default)().format("YYYYMMDD_HH:mm:ss")}-${fileName}`,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "public-read",
    };
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
        return `https://${config_1.default.s3.bucket}.s3.${config_1.default.s3.region}.amazonaws.com/${uploadParams.Key}`;
    }
    catch (err) {
        console.error("Error uploading file: ", err);
        throw new Error("Error uploading file");
    }
}
exports.uploadPlaceFileToS3 = uploadPlaceFileToS3;
async function uploadPackageFileToS3(fileBuffer, fileName, mimeType) {
    const nameArray = fileName.split(".");
    const tail = nameArray[nameArray.length - 1];
    const uploadParams = {
        Bucket: config_1.default.s3.bucket,
        Key: `package/images/${(0, moment_timezone_1.default)().format("YYYYMMDD_HH_mm_ss") + Math.ceil(Math.random() * 1000)}.${tail}`,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "public-read",
    };
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
        return `https://${config_1.default.s3.bucket}.s3.${config_1.default.s3.region}.amazonaws.com/${uploadParams.Key}`;
    }
    catch (err) {
        console.error("Error uploading file: ", err);
        throw new Error("Error uploading file");
    }
}
exports.uploadPackageFileToS3 = uploadPackageFileToS3;
//# sourceMappingURL=s3.js.map