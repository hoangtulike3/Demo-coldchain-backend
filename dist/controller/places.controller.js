"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchToggle = exports.getService = exports.getPlaceCategory = exports.getPlaceType = exports.modifyPlace = exports.createPlace = exports.getPlace = exports.getPlaces = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const response_1 = require("../utils/response");
const error_1 = require("../utils/error");
const enum_1 = require("../utils/enum");
const place_repository_1 = require("../repository/place.repository");
const membership_repository_1 = require("../repository/membership.repository");
const s3_1 = require("../utils/s3");
// 플레이스 전체 조회
const getPlaces = async (req, res, next) => {
    try {
        // const userId: string = (req.user as User).id;
        const page = parseInt(req.query.page) || 1;
        let pageSize = parseInt(req.query.pageSize) || 10;
        const searchName = req.query.search_name || "";
        const userLongitude = parseFloat(req.query.longitude);
        const userLatitude = parseFloat(req.query.latitude);
        const isValidLocation = !isNaN(userLongitude) && !isNaN(userLatitude);
        const placeRepo = new place_repository_1.PlaceRepo();
        const { places, totalCount } = await placeRepo.getPlaces(page, pageSize, searchName, isValidLocation ? userLongitude : undefined, isValidLocation ? userLatitude : undefined);
        if ((page - 1) * pageSize + places.length >= totalCount) {
            pageSize = places.length;
        }
        (0, response_1.response)(res, {
            places,
            totalCount,
            page,
            pageSize,
            thumbnail: "https://videoai.coming.io/resources/ccs/place.jpg",
        });
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPlaces = getPlaces;
// 해당 플레이스 조회
const getPlace = async (req, res, next) => {
    try {
        const placeId = req.params.place_id;
        const placeRepo = new place_repository_1.PlaceRepo();
        const place = await placeRepo.getPlace(placeId);
        (0, response_1.response)(res, [place]);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPlace = getPlace;
// 플레이스 생성
const createPlace = async (req, res, next) => {
    try {
        // 관리자만 추가 가능
        if (req.user.role !== enum_1.UserRole.Admin) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
        }
        let placeObj = req.body;
        if (req.body.placeObj) {
            placeObj = JSON.parse(req.body.placeObj);
        }
        else {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND));
        }
        let place;
        const placeRepo = new place_repository_1.PlaceRepo();
        const placeName = await placeRepo.getPlaceName();
        const isDuplicate = placeName.some((place) => place.name === placeObj.name);
        if (isDuplicate) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.PLACE_NAME_DUPLICATED));
        }
        else {
            place = await placeRepo.addPlace(placeObj);
        }
        const files = req.files;
        if (files.photo) {
            const imageFile = files.photo[0];
            const fileUrl = await (0, s3_1.uploadPlaceFileToS3)(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
            await placeRepo.addPlacePhoto(fileUrl, place.id);
        }
        console.log(files);
        if (files.photos && files.photos.length > 0) {
            const imageFiles = files.photos;
            await Promise.all(imageFiles.map(async (file) => {
                const fileUrl = await (0, s3_1.uploadPlaceFileToS3)(file.buffer, file.originalname, file.mimetype);
                await placeRepo.addPlacePhoto(fileUrl, place.id);
            }));
        }
        // membership 추가
        const types = ["supporter", "member", "guest"];
        types.forEach(async (type) => {
            const userIds = req.body[type];
            if (userIds && Array.isArray(userIds)) {
                await Promise.all(userIds.map(async (userId) => {
                    await membership_repository_1.MembershipRepo.addMembership(userId, place.id, type, "place");
                }));
            }
        });
        (0, response_1.response)(res, place);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.createPlace = createPlace;
// 플레이스 수정
const modifyPlace = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const placeId = req.params.place_id;
        // membership 확인
        const membershipRepo = new membership_repository_1.MembershipRepo();
        const isMembership = await membershipRepo.isParticipantPlace(placeId, userId, "member");
        // admin과 member만 수정 가능
        if (req.user.role !== enum_1.UserRole.Admin && !isMembership) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
        }
        const placeRepo = new place_repository_1.PlaceRepo();
        let placeUpdated = false;
        if (req.body.placeObj) {
            const placeObj = JSON.parse(req.body.placeObj);
            const placeName = await placeRepo.getPlaceName();
            const isDuplicate = placeName.some((place) => place.name === placeObj.name);
            if (isDuplicate) {
                throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.PLACE_NAME_DUPLICATED));
            }
            else {
                await placeRepo.modifyPlace(placeObj, placeId);
                placeUpdated = true;
            }
        }
        const files = req.files;
        if (files.photo) {
            const imageFile = files.photo[0];
            const fileUrl = await (0, s3_1.uploadPlaceFileToS3)(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
            await placeRepo.addPlacePhoto(fileUrl, placeId);
        }
        if (files.photos && files.photos.length > 0) {
            const imageFiles = files.photos;
            await Promise.all(imageFiles.map(async (file) => {
                const fileUrl = await (0, s3_1.uploadPlaceFileToS3)(file.buffer, file.originalname, file.mimetype);
                await placeRepo.addPlacePhoto(fileUrl, placeId);
            }));
        }
        if (placeUpdated) {
            const place = await placeRepo.getPlace(placeId);
            (0, response_1.response)(res, place);
        }
        else {
            (0, response_1.response)(res, { message: "Files uploaded successfully, no place information updated." });
        }
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.modifyPlace = modifyPlace;
// 플레이스 type 조회
const getPlaceType = async (req, res, next) => {
    try {
        const placeRepo = new place_repository_1.PlaceRepo();
        const { serviceTypesResult, stationTypesResult, warehouseTypesResult } = await placeRepo.getPlaceType();
        const placeTypes = {
            place_service_type: serviceTypesResult.map((type) => ({ id: type.id, name: type.name })),
            place_station_type: stationTypesResult.map((type) => ({ id: type.id, name: type.name })),
            place_warehouse_type: warehouseTypesResult.map((type) => ({ id: type.id, name: type.name })),
        };
        (0, response_1.response)(res, placeTypes);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPlaceType = getPlaceType;
// 플레이스 카테고리 조회
const getPlaceCategory = async (req, res, next) => {
    try {
        const placeRepo = new place_repository_1.PlaceRepo();
        const place = await placeRepo.getPlaceCategory();
        (0, response_1.response)(res, place);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPlaceCategory = getPlaceCategory;
// 서비스 조회
const getService = async (req, res, next) => {
    try {
        const placeRepo = new place_repository_1.PlaceRepo();
        const place = await placeRepo.getService();
        (0, response_1.response)(res, place);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getService = getService;
// 알람 토글
const patchToggle = async (req, res, next) => {
    try {
        const placeId = req.params.place_id;
        const placeRepo = new place_repository_1.PlaceRepo();
        const place = await placeRepo.toggleNotification(placeId);
        (0, response_1.response)(res, place);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.patchToggle = patchToggle;
//# sourceMappingURL=places.controller.js.map