declare class PackageRepo {
    getPackages(page: number, pageSize: number, placeId: number[] | null, categoryId?: number[] | null, contentId?: number[] | null, statusId?: number[] | null, wareId?: number[] | null, searchName?: string): Promise<{
        packages: any[];
        totalCount: any;
    }>;
    getPackage(packageId: string): Promise<any>;
    deletePackage(packageId: string): Promise<any>;
    deletePhotoOnPackageDeleted(packageId: string): Promise<any>;
    deletePhoto(packageId: string, values: object): Promise<any>;
    deleteAllPhoto(packageId: string): Promise<any>;
    addPackage(packageObj: {
        name: string;
        title: string;
        description?: string;
        net_weight: number;
        price: number;
        currency?: string;
        participants?: string;
        place_id: number;
        box_id: number;
        category?: string;
        content_id: number;
        status_id: number;
        ware_id: number;
        temp: number;
        min_temp: number;
        max_temp: number;
    }): Promise<any>;
    modifyPackage(packages: object, packageId: string): Promise<any>;
    getPackageName(): Promise<any[]>;
    getPackageFilterList(): Promise<{
        packageCategories: any[];
        packageContents: any[];
        packageWares: any[];
        packageStatus: any[];
    }>;
    addPackagePhoto(photo_url: string, package_id: string): Promise<any>;
    getPackageBox(): Promise<any[]>;
}
export default PackageRepo;
