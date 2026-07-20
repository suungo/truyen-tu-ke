import { useState } from "react";
import {
  Table,
  Input,
  Card,
  Typography,
  Button,
  Popconfirm,
  notification,
} from "antd";
import { DeleteOutlined, NotificationOutlined } from "@ant-design/icons";
import {
  useAdminNotifications,
  useAdminDeleteNotification,
} from "../hooks/useNotifications";
import dayjs from "dayjs";
import SendNotificationModal from "@/modules/readers/components/send-notification.modal";
import type { AdminNotification } from "../api/notifications.api";

const { Title } = Typography;

export default function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, refetch } = useAdminNotifications({
    page: currentPage,
    limit: 10,
    search: searchQuery,
  });

  const deleteMutation = useAdminDeleteNotification();

  const notifications = data?.notifications || [];
  const total = data?.total || 0;

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({
        message: "Thành công",
        description: "Đã xóa thông báo thành công!",
      });
    } catch (err: any) {
      notification.error({
        message: "Lỗi",
        description:
          err?.response?.data?.message ||
          "Không thể xóa thông báo, vui lòng thử lại.",
      });
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: "Người nhận",
      key: "recipient",
      render: (_: any, record: AdminNotification) => {
        if (record.reader) {
          return (
            <div>
              <span className="font-medium text-gray-800">
                {record.reader.username}
              </span>
              <br />
              <span className="text-xs text-gray-500">
                {record.reader.email}
              </span>
            </div>
          );
        }
        return (
          <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full text-xs">
            Tất cả độc giả (Broadcast)
          </span>
        );
      },
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <span className="text-gray-600 line-clamp-2 max-w-sm">{text}</span>
      ),
    },
    {
      title: "Thời gian gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: AdminNotification) => (
        <Popconfirm
          title="Xóa thông báo"
          description="Bạn có chắc chắn muốn xóa lịch sử thông báo này không?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="flex items-center gap-1 text-xs"
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4 bg-[#FFFFFF] rounded-lg shadow-lg min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Thông báo
          </Title>
        </div>
      </div>

      <Card className="shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <Input.Search
            placeholder="Tìm kiếm thông báo..."
            allowClear
            onSearch={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-72"
          />
          <Button
            type="primary"
            icon={<NotificationOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1E2D3D]"
          >
            Phát thông báo chung 📢
          </Button>
        </div>

        <Table
          loading={isLoading}
          dataSource={notifications}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: total,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total) => `Tổng số ${total} thông báo`,
          }}
          className="overflow-x-auto"
        />
      </Card>

      <SendNotificationModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          refetch();
        }}
        reader={null} // Broadcast mode
      />
    </div>
  );
}
