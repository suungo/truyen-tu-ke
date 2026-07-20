import { Table, Input, Card, Typography, Button } from "antd";
import {
  EyeOutlined,
  SendOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { useAdminReaders } from "../hooks/useReaders";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import SendNotificationModal from "../components/send-notification.modal";
import type { Reader } from "../api/readers.api";
import { useState } from "react";

const { Title } = Typography;

export default function ReadersPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Notification modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);

  const { data, isLoading } = useAdminReaders({
    page: currentPage,
    limit: 10,
    search: searchQuery,
  });

  const readers = data?.readers || [];
  const total = data?.total || 0;

  const columns = [
    {
      title: "Tên độc giả",
      dataIndex: "username",
      key: "username",
      render: (text: string) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số kịch bản đăng ký",
      dataIndex: "totalRegistered",
      key: "totalRegistered",
      render: (count: number) => (
        <span className="font-bold text-blue-600">{count}</span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Reader) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/readers/${record.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1E2D3D] hover:bg-[#2c3d50] transition-colors cursor-pointer"
          >
            <EyeOutlined />
            <span>Xem chi tiết</span>
          </button>
          <button
            onClick={() => {
              setSelectedReader(record);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <SendOutlined />
            <span>Gửi TB</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-[#FFFFFF] rounded-lg shadow-lg min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Độc giả
          </Title>
        </div>
      </div>

      <Card className="shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <Input.Search
            placeholder="Tìm kiếm độc giả..."
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
            onClick={() => {
              setSelectedReader(null);
              setIsModalOpen(true);
            }}
            className="bg-[#1E2D3D]"
          >
            Phát thông báo chung
          </Button>
        </div>

        <Table
          loading={isLoading}
          dataSource={readers}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: total,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total) => `Tổng số ${total} độc giả`,
          }}
          className="overflow-x-auto"
        />
      </Card>

      <SendNotificationModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        reader={selectedReader}
      />
    </div>
  );
}
