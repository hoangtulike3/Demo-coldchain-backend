import { Request, Response } from "express";
import { defaultError, response } from "../utils/response";

export const defaultThumbnail = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = {
      place_thumbnail: "https://videoai.coming.io/resources/ccs/place.jpg",
      package_thumbnail: "https://videoai.coming.io/resources/ccs/package.webp",
    };

    response(res, data);
  } catch (e) {
    defaultError(res, e);
  }
};
