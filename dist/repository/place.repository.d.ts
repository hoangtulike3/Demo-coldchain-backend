export declare class PlaceRepo {
    getPlaces(page: number, pageSize: number, searchName?: string, userLongitude?: number, userLatitude?: number): Promise<{
        places: any[];
        totalCount: any;
    }>;
    getPlace(placeId: string): Promise<any>;
    addPlace(placeObj: {
        name: string;
        description?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
        address2?: string;
        zip_code?: string;
        service_type_id: number;
        station_type_id: number;
        warehouse_type_id: number;
        category_id: number;
    }): Promise<any>;
    modifyPlace(place: object, placeId: string): Promise<any>;
    getPlaceType(): Promise<{
        serviceTypesResult: any[];
        stationTypesResult: any[];
        warehouseTypesResult: any[];
    }>;
    getPlaceName(): Promise<any[]>;
    getPlaceCategory(): Promise<any[]>;
    getService(): Promise<any[]>;
    toggleNotification(placeId: string): Promise<any[]>;
    addPlacePhoto(photo_url: string, place_id: string): Promise<any>;
}
