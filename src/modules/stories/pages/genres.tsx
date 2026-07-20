import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { type Genre } from "@/apis/stories.api";
import {
  useAdminGenres,
  useCreateGenre,
  useUpdateGenre,
  useDeleteGenre,
} from "../hooks/useStories";

const { Title } = Typography;

export default function GenresManagerPage() {
  const { data: genres = [], isLoading } = useAdminGenres();
  const createGenreMutation = useCreateGenre();
  const updateGenreMutation = useUpdateGenre();
  const deleteGenreMutation = useDeleteGenre();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingGenre(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    form.setFieldsValue({ name: genre.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteGenreMutation.mutateAsync(id);
      message.success("Xóa thể loại thành công");
    } catch {
      message.error(
        "Không thể xóa thể loại. Thể loại này có thể đang được sử dụng.",
      );
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingGenre) {
        await updateGenreMutation.mutateAsync({
          id: editingGenre.id,
          name: values.name,
        });
        message.success("Cập nhật thể loại thành công");
      } else {
        await createGenreMutation.mutateAsync(values.name);
        message.success("Thêm thể loại thành công");
      }
      setIsModalOpen(false);
    } catch {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 100,
      },
      {
        title: "Tên thể loại",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Hành động",
        key: "actions",
        width: 200,
        render: (_: any, record: Genre) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa thể loại"
              description="Bạn có chắc chắn muốn xóa thể loại này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={
                  deleteGenreMutation.isPending &&
                  deleteGenreMutation.variables === record.id
                }
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteGenreMutation],
  );

  return (
    <div className="p-4 bg-[#FFFFFF] shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} style={{ margin: 0 }}>
          Danh sách thể loại
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ background: "#1dbfaf", borderColor: "#1dbfaf" }}
        >
          Thêm thể loại
        </Button>
      </div>

      <Table
        dataSource={genres}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          <span className="font-semibold text-gray-800 text-xl">
            {editingGenre ? "Sửa thể loại" : "Thêm thể loại"}
          </span>
        }
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingGenre ? "Lưu" : "Thêm"}
        cancelText="Hủy"
        confirmLoading={
          createGenreMutation.isPending || updateGenreMutation.isPending
        }
      >
        <div className="mb-4!">
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              required={false}
              name="name"
              label={
                <span className="font-semibold text-gray-800">
                  Tên thể loại <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập tên thể loại" },
                { max: 100, message: "Tên thể loại tối đa 100 ký tự" },
              ]}
            >
              <Input placeholder="Ví dụ: Kịch tính, Kỳ ảo..." autoFocus />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
