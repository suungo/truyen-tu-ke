type CrudBreadcrumbConfig = {
  root: string;
  list?: string;
  detail?: string;
  create?: string;
  edit?: string;
  position?: string;
};

const createCrudBreadcrumbs = (
  basePath: string,
  labels: CrudBreadcrumbConfig,
) => {
  const record: Record<string, string> = {
    [`/${basePath}`]: labels.root,
  };

  if (labels.list) {
    record[`/${basePath}/list`] = labels.list;
  }

  if (labels.detail) {
    record[`/${basePath}/detail`] = labels.detail;
  }

  if (labels.create) {
    record[`/${basePath}/create`] = labels.create;
  }

  if (labels.edit) {
    record[`/${basePath}/edit`] = labels.edit;
  }

  if (labels.position) {
    record[`/${basePath}/position`] = labels.position;
  }

  return record;
};

export const BREADCRUMB_NAME_MAPS: Record<string, string> = {
  "/dashboard": "Tổng quan",
  ...createCrudBreadcrumbs("parcel-manager", {
    root: "Quản lý bưu cục",
    list: "Danh sách bưu cục",
    detail: "Chi tiết bưu cục",
    create: "Thêm bưu cục",
    edit: "Chỉnh sửa bưu cục",
  }),
  ...createCrudBreadcrumbs("customer-manager", {
    root: "Quản lý khách hàng",
    list: "Danh sách khách hàng",
    detail: "Chi tiết khách hàng",
    edit: "Chỉnh sửa khách hàng",
  }),

  "/shipment-manager/pickup/create": "Thêm điều phối lấy",
  "/shipment-manager/pickup/edit": "Chỉnh sửa điều phối lấy",
  "/shipment-manager/transit/create": "Thêm điều phối trung chuyển",
  "/shipment-manager/transit/edit": "Chỉnh sửa điều phối trung chuyển",
  "/shipment-manager/delivery/create": "Thêm điều phối giao hàng",
  "/shipment-manager/delivery/edit": "Chỉnh sửa điều phối giao",
  ...createCrudBreadcrumbs("shipping-route-manager", {
    root: "Quản lý tuyến hàng",
    list: "Danh sách tuyến hàng",
    detail: "Chi tiết tuyến hàng",
    create: "Thêm tuyến hàng",
    edit: "Chỉnh sửa tuyến hàng",
  }),
  ...createCrudBreadcrumbs("branch-manager", {
    root: "Quản lý bưu cục",
    list: "Danh sách bưu cục",
    detail: "Chi tiết bưu cục",
    create: "Thêm bưu cục",
    edit: "Chỉnh sửa bưu cục",
  }),

  ...createCrudBreadcrumbs("profile-manager", {
    root: "Thông tin cá nhân",
    detail: "Chi tiết thông tin cá nhân",
    edit: "Chỉnh sửa thông tin cá nhân",
  }),
 
  "/notifications": "Thông báo",
  "/setting": "Cài đặt hệ thống",
  "/report-statistic-manager": "Báo cáo & thống kê",
  "/video-generator": "Tạo Video Tự Động",
};
