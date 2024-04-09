"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePackage = exports.getPackageFilterList = exports.modifyPackage = exports.createPackage = exports.getPackage = exports.getPackages = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const response_1 = require("../utils/response");
const error_1 = require("../utils/error");
const package_repository_1 = __importDefault(require("../repository/package.repository"));
const membership_repository_1 = require("../repository/membership.repository");
const s3_1 = require("../utils/s3");
const users_repository_1 = require("../repository/users.repository");
// 패키지 전체 조회
const getPackages = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let pageSize = parseInt(req.query.pageSize) || 10;
        const placeIds = Array.isArray(req.query.place_id)
            ? req.query.place_id.map(Number)
            : req.query.place_id
                ? [Number(req.query.place_id)]
                : [];
        const categoryIds = Array.isArray(req.query.category_id)
            ? req.query.category_id.map(Number)
            : req.query.category_id
                ? [Number(req.query.category_id)]
                : [];
        const contentIds = Array.isArray(req.query.content_id)
            ? req.query.content_id.map(Number)
            : req.query.content_id
                ? [Number(req.query.content_id)]
                : [];
        const statusIds = Array.isArray(req.query.status_id)
            ? req.query.status_id.map(Number)
            : req.query.status_id
                ? [Number(req.query.status_id)]
                : [];
        const wareIds = Array.isArray(req.query.ware_id)
            ? req.query.ware_id.map((element) => +element)
            : req.query.ware_id
                ? [Number(req.query.ware_id)]
                : [];
        const searchName = req.query.search_name || "";
        const packageRepo = new package_repository_1.default();
        const userRepo = new users_repository_1.UserRepo();
        const { packages, totalCount } = await packageRepo.getPackages(page, pageSize, placeIds, categoryIds, contentIds, statusIds, wareIds, searchName);
        for (const packageObj of packages) {
            if (packageObj.owner && packageObj.owner.length > 0) {
                const ownerNames = [];
                for (const ownerId of packageObj.owner) {
                    const userName = await userRepo.getUsersName(ownerId);
                    ownerNames.push(userName);
                }
                packageObj.owner = ownerNames;
            }
        }
        if ((page - 1) * pageSize + packages.length >= totalCount) {
            pageSize = packages.length;
        }
        (0, response_1.response)(res, {
            packages,
            totalCount,
            page,
            pageSize,
            thumbnail: "https://videoai.coming.io/resources/ccs/package.webp",
        });
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPackages = getPackages;
const getPackage = async (req, res, next) => {
    try {
        const packageId = req.params.package_id;
        const userRepo = new users_repository_1.UserRepo();
        const packageRepo = new package_repository_1.default();
        const packages = await packageRepo.getPackage(packageId);
        if (packages.owner && packages.owner.length > 0) {
            const ownerNames = [];
            for (const ownerId of packages.owner) {
                const userName = await userRepo.getUsersName(ownerId);
                ownerNames.push(userName);
            }
            packages.owner = ownerNames;
        }
        (0, response_1.response)(res, [packages]);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPackage = getPackage;
const createPackage = async (req, res, next) => {
    try {
        const user = req.user;
        let packageObj = req.body;
        // const userId = (req.user as User).id;
        if (req.body.packageObj) {
            packageObj = JSON.parse(req.body.packageObj);
        }
        else {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND));
        }
        if (!packageObj.participants) {
            packageObj.participants = [user?.id];
        }
        if (!packageObj.participants.includes(user?.id)) {
            packageObj.participants = [...packageObj.participants, user?.id];
        }
        const type = "owner";
        const packageRepo = new package_repository_1.default();
        const packages = await packageRepo.addPackage({ min_temp: -10, temp: 0, max_temp: 40, ...packageObj });
        if (packageObj.participants && packageObj.participants.length > 0) {
            for (const participantId of packageObj.participants) {
                await membership_repository_1.MembershipRepo.addMembership(participantId.toString(), packages.id, type, "package");
            }
        }
        const files = req.files;
        if (files.photo) {
            const imageFile = files.photo[0];
            const fileUrl = await (0, s3_1.uploadPackageFileToS3)(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
            await packageRepo.addPackagePhoto(fileUrl, packages.id);
        }
        if (files.photos && files.photos.length > 0) {
            const imageFiles = files.photos;
            await Promise.all(imageFiles.map(async (file) => {
                const fileUrl = await (0, s3_1.uploadPackageFileToS3)(file.buffer, file.originalname, file.mimetype);
                await packageRepo.addPackagePhoto(fileUrl, packages.id);
            }));
        }
        (0, response_1.response)(res, packages);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.createPackage = createPackage;
const modifyPackage = async (req, res, next) => {
    try {
        const packageId = req.params.package_id;
        let packageObj = req.body;
        const packageRepo = new package_repository_1.default();
        const user = req.user;
        if (req.body.packageObj) {
            packageObj = JSON.parse(req.body.packageObj);
        }
        else {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND));
        }
        if (!packageObj.participants) {
            packageObj.participants = [user?.id];
        }
        if (!packageObj.participants.includes(user?.id)) {
            packageObj.participants = [...packageObj.participants, user?.id];
        }
        const oldPackages = await packageRepo.getPackage(packageId);
        if (!oldPackages?.owner.includes(user?.id)) {
            throw (0, http_errors_1.default)(403, (0, error_1.getError)(error_1.Code.FORBIDDEN));
        }
        // IF USER DELETE SOME PHOTO
        if (packageObj.photo_urls && packageObj.photo_urls.length > 0) {
            await packageRepo.deletePhoto(packageId, packageObj.photo_urls);
        }
        else {
            await packageRepo.deleteAllPhoto(packageId);
        }
        //  UPLOAD PHOTO
        const updatePackageObj = { ...packageObj };
        delete updatePackageObj.photo_urls;
        const files = req.files;
        if (files.photo) {
            const imageFile = files.photo[0];
            const fileUrl = await (0, s3_1.uploadPackageFileToS3)(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
            await packageRepo.addPackagePhoto(fileUrl, packageId);
        }
        if (files.photos && files.photos.length > 0) {
            const imageFiles = files.photos;
            await Promise.all(imageFiles.map(async (file) => {
                const fileUrl = await (0, s3_1.uploadPackageFileToS3)(file.buffer, file.originalname, file.mimetype);
                await packageRepo.addPackagePhoto(fileUrl, packageId);
            }));
        }
        // MODIFY PACKAGE
        const packages = await packageRepo.modifyPackage(updatePackageObj, packageId);
        (0, response_1.response)(res, packages);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.modifyPackage = modifyPackage;
const getPackageFilterList = async (req, res, next) => {
    try {
        const packageRepo = new package_repository_1.default();
        const { packageCategories, packageContents, packageWares, packageStatus } = await packageRepo.getPackageFilterList();
        const packageFilterList = {
            categories: packageCategories.map((type) => ({ id: type.id, name: type.name })),
            contents: packageContents.map((type) => ({ id: type.id, name: type.name })),
            wares: packageWares.map((type) => ({ id: type.id, name: type.name })),
            status: packageStatus.map((type) => ({ id: type.id, name: type.name })),
        };
        (0, response_1.response)(res, packageFilterList);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPackageFilterList = getPackageFilterList;
const deletePackage = async (req, res, next) => {
    try {
        const user = req.user;
        const packageId = req.params.package_id;
        const packageRepo = new package_repository_1.default();
        const packages = await packageRepo.getPackage(packageId);
        if (packages?.owner.includes(user?.id)) {
            await packageRepo.deletePhotoOnPackageDeleted(packageId);
            await packageRepo.deletePackage(packageId);
        }
        else {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "params.package_id"));
        }
        (0, response_1.response)(res, { message: "Delete success" });
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.deletePackage = deletePackage;
//# sourceMappingURL=package.controller.js.map