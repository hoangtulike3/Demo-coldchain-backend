import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { defaultError, response } from "../utils/response";
import { getError, Code } from "../utils/error";
import { User } from "../interface/User";
import { UserRole } from "../utils/enum";
import { PlaceRepo } from "../repository/place.repository";
import { MembershipRepo } from "../repository/membership.repository";
import { uploadPlaceFileToS3 } from "../utils/s3";

// 플레이스 전체 조회
export const getPlaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const userId: string = (req.user as User).id;
    const page: number = parseInt(req.query.page as string) || 1;
    let pageSize: number = parseInt(req.query.pageSize as string) || 10;
    const searchName: string = (req.query.search_name as string) || "";
    const userLongitude: number = parseFloat(req.query.longitude as string);
    const userLatitude: number = parseFloat(req.query.latitude as string);

    const isValidLocation = !isNaN(userLongitude) && !isNaN(userLatitude);

    const placeRepo = new PlaceRepo();
    const { places, totalCount } = await placeRepo.getPlaces(
      page,
      pageSize,
      searchName,
      isValidLocation ? userLongitude : undefined,
      isValidLocation ? userLatitude : undefined
    );

    if ((page - 1) * pageSize + places.length >= totalCount) {
      pageSize = places.length;
    }

    response(res, {
      places,
      totalCount,
      page,
      pageSize,
      thumbnail: "https://videoai.coming.io/resources/ccs/place.jpg",
    });
  } catch (e) {
    console.error(e);
    defaultError(res, e);
  }
};

// 해당 플레이스 조회
export const getPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const placeId = req.params.place_id;

    const placeRepo = new PlaceRepo();
    const place = await placeRepo.getPlace(placeId);

    response(res, [place]);
  } catch (e) {
    defaultError(res, e);
  }
};

// 플레이스 생성
export const createPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 관리자만 추가 가능
    if ((req.user as User).role !== UserRole.Admin) {
      throw createError(401, getError(Code.INVALID_CREDENTIAL));
    }

    let placeObj: any = req.body;
    if (req.body.placeObj) {
      placeObj = JSON.parse(req.body.placeObj);
    } else {
      throw createError(401, getError(Code.PARAMETER_NOT_FOUND));
    }

    let place: any;
    const placeRepo = new PlaceRepo();
    const placeName = await placeRepo.getPlaceName();
    const isDuplicate = placeName.some((place) => place.name === placeObj.name);
    if (isDuplicate) {
      throw createError(401, getError(Code.PLACE_NAME_DUPLICATED));
    } else {
      place = await placeRepo.addPlace(placeObj);
    }

    const files: any = req.files;
    if (files.photo) {
      const imageFile = files.photo[0];
      const fileUrl = await uploadPlaceFileToS3(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
      await placeRepo.addPlacePhoto(fileUrl, place.id);
    }
    if (files.photos && files.photos.length > 0) {
      const imageFiles = files.photos;
      await Promise.all(
        imageFiles.map(async (file: Express.Multer.File) => {
          const fileUrl = await uploadPlaceFileToS3(file.buffer, file.originalname, file.mimetype);
          await placeRepo.addPlacePhoto(fileUrl, place.id);
        })
      );
    }

    // membership 추가
    const types = ["supporter", "member", "guest"];
    types.forEach(async (type) => {
      const userIds = req.body[type];
      if (userIds && Array.isArray(userIds)) {
        await Promise.all(
          userIds.map(async (userId) => {
            await MembershipRepo.addMembership(userId, place.id, type, "place");
          })
        );
      }
    });

    response(res, place);
  } catch (e) {
    defaultError(res, e);
  }
};

// 플레이스 수정
export const modifyPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = (req.user as User).id;
    const placeId = req.params.place_id;

    // membership 확인
    const membershipRepo = new MembershipRepo();
    const isMembership = await membershipRepo.isParticipantPlace(placeId, userId, "member");

    // admin과 member만 수정 가능
    if ((req.user as User).role !== UserRole.Admin && !isMembership) {
      throw createError(401, getError(Code.INVALID_CREDENTIAL));
    }

    const placeRepo = new PlaceRepo();
    let placeUpdated = false;

    if (req.body.placeObj) {
      const placeObj = JSON.parse(req.body.placeObj);

      const placeName = await placeRepo.getPlaceName();
      const isDuplicate = placeName.some((place) => place.name === placeObj.name);

      if (isDuplicate) {
        throw createError(401, getError(Code.PLACE_NAME_DUPLICATED));
      } else {
        await placeRepo.modifyPlace(placeObj, placeId);
        placeUpdated = true;
      }
    }

    const files: any = req.files;
    if (files.photo) {
      const imageFile = files.photo[0];
      const fileUrl = await uploadPlaceFileToS3(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
      await placeRepo.addPlacePhoto(fileUrl, placeId);
    }
    if (files.photos && files.photos.length > 0) {
      const imageFiles = files.photos;
      await Promise.all(
        imageFiles.map(async (file: Express.Multer.File) => {
          const fileUrl = await uploadPlaceFileToS3(file.buffer, file.originalname, file.mimetype);
          await placeRepo.addPlacePhoto(fileUrl, placeId);
        })
      );
    }
    if (placeUpdated) {
      const place = await placeRepo.getPlace(placeId);
      response(res, place);
    } else {
      response(res, { message: "Files uploaded successfully, no place information updated." });
    }
  } catch (e) {
    defaultError(res, e);
  }
};

// 플레이스 type 조회
export const getPlaceType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const placeRepo = new PlaceRepo();
    const { serviceTypesResult, stationTypesResult, warehouseTypesResult } = await placeRepo.getPlaceType();

    const placeTypes = {
      place_service_type: serviceTypesResult.map((type) => ({ id: type.id, name: type.name })),
      place_station_type: stationTypesResult.map((type) => ({ id: type.id, name: type.name })),
      place_warehouse_type: warehouseTypesResult.map((type) => ({ id: type.id, name: type.name })),
    };
    response(res, placeTypes);
  } catch (e) {
    defaultError(res, e);
  }
};

// 플레이스 카테고리 조회
export const getPlaceCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const placeRepo = new PlaceRepo();
    const place = await placeRepo.getPlaceCategory();

    response(res, place);
  } catch (e) {
    defaultError(res, e);
  }
};

// 서비스 조회
export const getService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const placeRepo = new PlaceRepo();
    const place = await placeRepo.getService();

    response(res, place);
  } catch (e) {
    defaultError(res, e);
  }
};

// 알람 토글
export const patchToggle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const placeId = req.params.place_id;
    const placeRepo = new PlaceRepo();
    const place = await placeRepo.toggleNotification(placeId);

    response(res, place);
  } catch (e) {
    defaultError(res, e);
  }
};
