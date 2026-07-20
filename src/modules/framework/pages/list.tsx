import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Popconfirm,
  message,
  Progress,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAdminFrameworks, useDeleteFramework, useUpdateFramework } from "../hooks/useFramework";
import { useAdminStories } from "@/modules/stories/hooks/useStories";
import type { StoryFramework } from "@/apis/framework.api";

const { Title, Text } = Typography;

export default function FrameworkListPage() {
  const navigate = useNavigate();
  const { data: frameworks = [], isLoading } = useAdminFrameworks();
  const { data: stories = [] } = useAdminStories();
  const deleteFrameworkMutation = useDeleteFramework();
  const updateFrameworkMutation = useUpdateFramework();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFw, setEditingFw] = useState<StoryFramework | null>(null);
  const [editForm] = Form.useForm();

  const handleDelete = async (id: number) => {
    try {
      await deleteFrameworkMutation.mutateAsync(id);
      message.success("Đã xóa khung kịch bản");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleOpenEditModal = (fw: StoryFramework) => {
    setEditingFw(fw);
    editForm.setFieldsValue({
      totalEpisodes: fw.totalEpisodes,
      overview: fw.overview,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingFw) return;
    try {
      await updateFrameworkMutation.mutateAsync({
        id: editingFw.id,
        payload: {
          totalEpisodes: values.totalEpisodes,
          overview: values.overview,
        },
      });
      message.success("Cập nhật khung kịch bản thành công");
      setEditModalOpen(false);
      setEditingFw(null);
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  // Danh sách truyện chưa có framework (để gợi ý thêm)
  const storiesWithoutFramework = stories.filter(
    (s) => !frameworks.some((fw) => fw.storyId === s.id),
  );

  const getCompletionStats = (fw: StoryFramework) => {
    const allEps = fw.phases?.flatMap((p) => p.episodes || []) || [];
    const completed = allEps.filter((e) => e.isCompleted).length;
    return { total: allEps.length, completed };
  };

  const columns = [
    {
      title: "Truyện",
      key: "story",
      render: (_: unknown, record: StoryFramework) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {record.story?.title?.[0] || "?"}
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm">
              {record.story?.title || `Story #${record.storyId}`}
            </div>
            <div className="text-xs text-gray-500">{record.story?.author}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Thể loại",
      key: "genre",
      render: (_: unknown, record: StoryFramework) =>
        record.story?.genre ? (
          <Tag color="blue">{record.story.genre.name}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Tổng tập",
      dataIndex: "totalEpisodes",
      key: "totalEpisodes",
      render: (v: number) => (
        <Tag color="purple" className="font-bold">
          {v} tập
        </Tag>
      ),
    },
    {
      title: "Giai đoạn",
      key: "phases",
      render: (_: unknown, record: StoryFramework) => (
        <span className="font-semibold text-gray-700">
          {record.phases?.length || 0} giai đoạn
        </span>
      ),
    },
    {
      title: "Tiến độ tập",
      key: "progress",
      width: 180,
      render: (_: unknown, record: StoryFramework) => {
        const { total, completed } = getCompletionStats(record);
        if (total === 0) return <Text type="secondary">Chưa có tập nào</Text>;
        const pct = Math.round((completed / total) * 100);
        return (
          <div>
            <Progress
              percent={pct}
              size="small"
              strokeColor={pct === 100 ? "#52c41a" : "#1dbfaf"}
              format={() => `${completed}/${total}`}
            />
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => new Date(v).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: StoryFramework) => (
        <div className="flex gap-2">
          <Tooltip title="Xem chi tiết, giai đoạn & tập">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="primary"
              style={{ background: "#1dbfaf", borderColor: "#1dbfaf" }}
              onClick={() => navigate(`/frameworks/${record.id}?storyId=${record.storyId}`)}
            >
              Mở
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin khung">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa khung kịch bản?"
            description="Toàn bộ giai đoạn và tập sẽ bị xóa."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              loading={
                deleteFrameworkMutation.isPending &&
                deleteFrameworkMutation.variables === record.id
              }
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              📋 Quản lý Khung Kịch Bản
            </Title>
            <Text type="secondary">
              Lên kế hoạch tổng thể cho mỗi truyện: số tập, giai đoạn, nội dung
              từng tập
            </Text>
          </div>
          {storiesWithoutFramework.length > 0 && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/frameworks/create")}
              style={{ background: "#1dbfaf", borderColor: "#1dbfaf" }}
              className="rounded-xl font-semibold px-5 shadow-sm"
            >
              Tạo khung kịch bản
            </Button>
          )}
        </div>

        <Table
          dataSource={frameworks}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} khung kịch bản` }}
          locale={{
            emptyText: (
              <div className="py-10 text-center">
                <BookOutlined className="text-5xl text-gray-300 mb-3" />
                <div className="text-gray-400">
                  Chưa có khung kịch bản nào. Hãy tạo mới!
                </div>
                <Button
                  className="mt-4"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/frameworks/create")}
                  style={{ background: "#1dbfaf", borderColor: "#1dbfaf" }}
                >
                  Tạo ngay
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Gợi ý truyện chưa có framework */}
      {storiesWithoutFramework.length > 0 && (
        <Card
          title="💡 Truyện chưa có khung kịch bản"
          className="shadow-sm rounded-xl"
          size="small"
        >
          <div className="flex flex-wrap gap-2">
            {storiesWithoutFramework.slice(0, 12).map((s) => (
              <Button
                key={s.id}
                size="small"
                icon={<PlusOutlined />}
                onClick={() => navigate(`/frameworks/create?storyId=${s.id}`)}
                className="rounded-lg"
              >
                {s.title}
              </Button>
            ))}
            {storiesWithoutFramework.length > 12 && (
              <Text type="secondary" className="text-xs self-center">
                +{storiesWithoutFramework.length - 12} truyện khác
              </Text>
            )}
          </div>
        </Card>
      )}

      <Modal
        title={
          <span className="text-gray-800 font-bold text-lg">
            ✏️ Chỉnh sửa Khung Kịch Bản
          </span>
        }
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingFw(null);
        }}
        footer={null}
        destroyOnClose
        centered
        className="rounded-2xl"
      >
        <div className="mb-4 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <span className="font-semibold text-gray-700">Truyện:</span>{" "}
          {editingFw?.story?.title || `Story #${editingFw?.storyId}`}
        </div>
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          requiredMark={false}
        >
          <Form.Item
            label={<span className="font-semibold text-gray-700">Tổng số tập dự kiến</span>}
            name="totalEpisodes"
            rules={[
              { required: true, message: "Vui lòng nhập tổng số tập" },
              { type: "number", min: 1, message: "Số tập phải lớn hơn 0" },
            ]}
          >
            <InputNumber className="w-full! rounded-lg" size="large" min={1} />
          </Form.Item>
          <Form.Item
            label={<span className="font-semibold text-gray-700">Tổng quan kịch bản</span>}
            name="overview"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập tổng quan về kịch bản..."
              className="rounded-lg"
            />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setEditModalOpen(false);
                setEditingFw(null);
              }}
              className="rounded-lg"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateFrameworkMutation.isPending}
              style={{ background: "#1dbfaf", borderColor: "#1dbfaf" }}
              className="rounded-lg font-semibold px-5"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
