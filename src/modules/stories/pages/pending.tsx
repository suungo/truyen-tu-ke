import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Popconfirm,
  Tag,
  Typography,
  message,
  Image,
  Modal,
  Card,
  Dropdown,
  Form,
  Input,
  Select,
  Tabs,
} from "antd";
import {
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { type Story } from "@/apis/stories.api";
import {
  useAdminPendingStories,
  useApproveStory,
  useDeleteStory,
  useUpdateStory,
  useAdminGenres,
} from "../hooks/useStories";

const { Title, Paragraph, Text } = Typography;

const fallback =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=80&q=60";

export default function PendingStoriesListPage() {
  const navigate = useNavigate();
  const { data: pendingStories = [], isLoading } = useAdminPendingStories();
  const [activeTab, setActiveTab] = useState<string>("admin");

  const adminScripts = useMemo(() => {
    return pendingStories.filter((s) => !s.isReaderStory);
  }, [pendingStories]);

  const readerScripts = useMemo(() => {
    return pendingStories.filter((s) => s.isReaderStory);
  }, [pendingStories]);

  const currentDataSource =
    activeTab === "admin" ? adminScripts : readerScripts;
  const { data: genres = [] } = useAdminGenres();
  const approveMutation = useApproveStory();
  const deleteMutation = useDeleteStory();
  const updateMutation = useUpdateStory();

  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingStory) {
      form.setFieldsValue({
        title: editingStory.title,
        author: editingStory.author,
        description: editingStory.description,
        characters: editingStory.characters,
        setting: editingStory.setting,
        content: editingStory.content,
        genreId: editingStory.genre?.id,
        coverImage: editingStory.coverImage,
        isShortStory: editingStory.isShortStory || false,
      });
    } else {
      form.resetFields();
    }
  }, [editingStory, form]);

  const handleEditSubmit = async (values: any) => {
    if (!editingStory) return;
    try {
      await updateMutation.mutateAsync({
        id: editingStory.id,
        payload: values,
      });
      message.success("Cập nhật truyện thành công");
      setEditingStory(null);
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success("Duyệt truyện thành công");
    } catch {
      message.error("Duyệt truyện thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Xóa kịch bản thành công");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Ảnh bìa",
        dataIndex: "coverImage",
        key: "coverImage",
        width: 120,
        render: (src: string) => (
          <Image
            src={src || fallback}
            fallback={fallback}
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 8 }}
            preview={!!src}
          />
        ),
      },
      {
        title: "Tiêu đề",
        dataIndex: "title",
        key: "title",
        fontWeight: "bold",
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: "Tác giả",
        dataIndex: "author",
        key: "author",
      },
      {
        title: "Thể loại",
        dataIndex: "genre",
        key: "genre",
        render: (genre?: { name: string }) => (
          <Tag color="orange">{genre?.name || "Chưa phân loại"}</Tag>
        ),
      },
      {
        title: "Tóm tắt",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (text: string) =>
          text || (
            <Text type="secondary" italic>
              Không có tóm tắt
            </Text>
          ),
      },
      {
        title: "Ngày đăng ký",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      },
      {
        title: "Thao tác",
        key: "action",
        width: 120,
        render: (_: unknown, record: Story) => {
          const items = [
            {
              key: "preview",
              icon: <EyeOutlined />,
              label: "Xem nội dung",
              onClick: () => setPreviewStory(record),
            },
            {
              key: "edit",
              icon: <EditOutlined className="text-blue-600" />,
              label: (
                <span className="text-blue-600 font-semibold">Chỉnh sửa</span>
              ),
              onClick: () => setEditingStory(record),
            },
            {
              key: "approve",
              icon: <CheckOutlined className="text-green-600" />,
              label: (
                <Popconfirm
                  title="Duyệt xuất bản truyện này?"
                  description="Truyện sẽ hiển thị công khai trên Landing page."
                  onConfirm={() => handleApprove(record.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <span className="text-green-600 font-semibold">
                    Duyệt xuất bản
                  </span>
                </Popconfirm>
              ),
            },
            {
              key: "delete",
              icon: <DeleteOutlined className="text-red-600" />,
              label: (
                <Popconfirm
                  title="Xóa kịch bản này?"
                  description="Kịch bản sẽ bị xóa vĩnh viễn khỏi hệ thống."
                  onConfirm={() => handleDelete(record.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <span className="text-red-600 font-semibold">
                    Xóa kịch bản
                  </span>
                </Popconfirm>
              ),
            },
          ];

          return (
            <Dropdown
              menu={{ items }}
              trigger={["hover"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined style={{ fontSize: 18 }} />}
              />
            </Dropdown>
          );
        },
      },
    ],
    [],
  );

  return (
    <Card className="shadow-sm rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="mb-1">
            Quản lý Kịch bản
          </Title>
          <Text type="secondary">
            Danh sách các câu chuyện chưa xuất bản. Thêm mới kịch bản tại đây
            hoặc duyệt đăng ký từ người đọc để hiển thị lên Landing page.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/stories/create")}
          style={{ background: "#1dbfaf", borderColor: "#1dbfaf" }}
          className="rounded-xl font-semibold px-4 shadow-sm"
        >
          Thêm kịch bản
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "admin",
            label: `Danh sách kịch bản (${adminScripts.length})`,
          },
          {
            key: "reader",
            label: `Danh sách kịch bản được đăng ký (${readerScripts.length})`,
          },
        ]}
        className="mb-4"
      />

      <Table
        columns={columns}
        dataSource={currentDataSource}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "Không có kịch bản nào ở mục này" }}
      />

      {/* Content Preview Modal */}
      <Modal
        title={
          <div className="border-b pb-3 pr-6">
            <Title level={4} className="mb-1">
              {previewStory?.title}
            </Title>
            <Text type="secondary">
              Tác giả: <Text strong>{previewStory?.author}</Text> | Thể loại:{" "}
              <Tag color="orange">
                {previewStory?.genre?.name || "Chưa phân loại"}
              </Tag>
            </Text>
          </div>
        }
        open={!!previewStory}
        onCancel={() => setPreviewStory(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewStory(null)}>
            Đóng lại
          </Button>,
          previewStory && (
            <Popconfirm
              key="approve"
              title="Duyệt xuất bản truyện này?"
              onConfirm={() => {
                handleApprove(previewStory.id);
                setPreviewStory(null);
              }}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                className="bg-green-600 hover:bg-green-500"
              >
                Duyệt xuất bản
              </Button>
            </Popconfirm>
          ),
        ].filter(Boolean)}
        width={750}
      >
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
          {previewStory?.description && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg">
              <Text strong className="text-orange-800">
                Tóm tắt:
              </Text>
              <Paragraph className="mb-0 italic text-gray-700 mt-1">
                {previewStory.description}
              </Paragraph>
            </div>
          )}

          {(previewStory?.characters || previewStory?.setting) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              {previewStory?.characters && (
                <div>
                  <Text strong className="text-gray-700 block mb-1">
                    🎭 Nhân vật:
                  </Text>
                  <Paragraph className="mb-0 text-gray-600 whitespace-pre-wrap">
                    {previewStory.characters}
                  </Paragraph>
                </div>
              )}
              {previewStory?.setting && (
                <div>
                  <Text strong className="text-gray-700 block mb-1">
                    🌍 Bối cảnh:
                  </Text>
                  <Paragraph className="mb-0 text-gray-600 whitespace-pre-wrap">
                    {previewStory.setting}
                  </Paragraph>
                </div>
              )}
            </div>
          )}

          <div className="font-serif text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
            {previewStory?.content}
          </div>
        </div>
      </Modal>

      {/* Edit Story Modal */}
      <Modal
        title="Chỉnh sửa truyện đăng ký"
        open={!!editingStory}
        onCancel={() => setEditingStory(null)}
        footer={[
          <Button key="cancel" onClick={() => setEditingStory(null)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateMutation.isPending}
            onClick={() => form.submit()}
          >
            Lưu thay đổi
          </Button>,
        ]}
        width={750}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          requiredMark={false}
          className="mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={
                <span className="font-semibold text-gray-700">
                  Tiêu đề truyện
                </span>
              }
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề..." className="rounded-lg" />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">Tác giả</span>
              }
              name="author"
              rules={[{ required: true, message: "Vui lòng nhập tên tác giả" }]}
            >
              <Input placeholder="Tên tác giả..." className="rounded-lg" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label={
                <span className="font-semibold text-gray-700">Thể loại</span>
              }
              name="genreId"
            >
              <Select
                placeholder="Chọn thể loại..."
                allowClear
                options={genres.map((g) => ({ label: g.name, value: g.id }))}
                className="w-full rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">Loại truyện</span>
              }
              name="isShortStory"
              rules={[{ required: true, message: "Vui lòng chọn loại truyện" }]}
            >
              <Select
                placeholder="Chọn loại truyện..."
                options={[
                  { label: "Truyện dài tập", value: false },
                  { label: "Truyện ngắn", value: true },
                ]}
                className="w-full rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">
                  Đường dẫn ảnh bìa (URL)
                </span>
              }
              name="coverImage"
            >
              <Input
                placeholder="https://example.com/image.jpg"
                className="rounded-lg"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={
                <span className="font-semibold text-gray-700">
                  Thành phần nhân vật
                </span>
              }
              name="characters"
            >
              <Input.TextArea
                placeholder="Ví dụ: Tấm (hiền lành), Cám (độc ác)..."
                rows={3}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">Bối cảnh</span>
              }
              name="setting"
            >
              <Input.TextArea
                placeholder="Ví dụ: Hoàng cung, Giếng nước..."
                rows={3}
                className="rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item
            label={
              <span className="font-semibold text-gray-700">Tóm tắt mô tả</span>
            }
            name="description"
          >
            <Input.TextArea
              placeholder="Tóm tắt ngắn gọn truyện..."
              rows={3}
              maxLength={500}
              showCount
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Nội dung truyện
              </span>
            }
            name="content"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung truyện" },
            ]}
          >
            <Input.TextArea
              placeholder="Nội dung chi tiết..."
              rows={10}
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 15,
                lineHeight: 1.6,
              }}
              className="rounded-lg p-3"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
