import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Upload,
  Space,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { type StoryPayload } from "@/apis/stories.api";
import {
  useAdminStories,
  useAdminGenres,
  useCreateStory,
  useUpdateStory,
  useUploadCover,
} from "../hooks/useStories";

const { Title } = Typography;
const { TextArea } = Input;

export default function StoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const { data: stories = [] } = useAdminStories();
  const { data: genres = [] } = useAdminGenres();

  const createStoryMutation = useCreateStory();
  const updateStoryMutation = useUpdateStory();
  const uploadCoverMutation = useUploadCover();

  useEffect(() => {
    if (!isEdit) return;
    const story = stories.find((s) => s.id === Number(id));
    if (story) {
      form.setFieldsValue({
        title: story.title,
        author: story.author,
        description: story.description,
        characters: story.characters,
        setting: story.setting,
        content: story.content,
        coverImage: story.coverImage,
        genreId: story.genre?.id,
        isShortStory: story.isShortStory || false,
      });
      if (story.coverImage) setCoverPreview(story.coverImage);
    }
  }, [id, isEdit, stories, form]);

  const handleFileChange = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    return false; // prevent auto-upload
  };

  const onFinish = async (values: StoryPayload) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateStoryMutation.mutateAsync({
          id: Number(id),
          payload: values,
        });
        if (coverFile)
          await uploadCoverMutation.mutateAsync({
            id: Number(id),
            file: coverFile,
          });
        message.success("Cập nhật truyện thành công");
      } else {
        const created = await createStoryMutation.mutateAsync(values);
        if (coverFile)
          await uploadCoverMutation.mutateAsync({
            id: created.id,
            file: coverFile,
          });
        message.success("Thêm truyện thành công");
      }
      navigate("/stories");
    } catch {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#FFFFFF] rounded-lg shadow-lg ">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div>
            <Title
              level={3}
              style={{ margin: 0 }}
              className="text-gray-800 font-bold"
            >
              {isEdit ? "Chỉnh sửa truyện" : "Thêm truyện mới"}
            </Title>
          </div>
        </div>

        {/* Top actions for quick saving */}
        <Space className="hidden sm:flex">
          <Button
            size="large"
            onClick={() => navigate("/stories")}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            form="story-form"
            loading={loading}
            size="large"
            className="bg-[#00B4DB] hover:bg-[#0092b3] border-[#00B4DB] hover:border-[#0092b3] font-semibold px-6 shadow-sm rounded-xl"
            style={{ background: "#00B4DB", borderColor: "#00B4DB" }}
          >
            {isEdit ? "Cập nhật" : "Xuất bản"}
          </Button>
        </Space>
      </div>

      <Form
        id="story-form"
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Main content column */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <Form.Item
              label={
                <span className="font-semibold text-gray-700">
                  Tiêu đề truyện
                </span>
              }
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input
                placeholder="Nhập tiêu đề hấp dẫn..."
                size="large"
                className="rounded-xl border-gray-200"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">Mô tả ngắn</span>
              }
              name="description"
            >
              <TextArea
                placeholder="Tóm tắt ngắn gọn nội dung để thu hút người đọc..."
                rows={3}
                showCount
                maxLength={500}
                className="rounded-xl border-gray-200"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">
                    Thành phần nhân vật
                  </span>
                }
                name="characters"
              >
                <TextArea
                  placeholder="Ví dụ: Tấm (hiền lành), Cám (độc ác), Mẹ ghẻ..."
                  rows={3}
                  className="rounded-xl border-gray-200"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">Bối cảnh</span>
                }
                name="setting"
              >
                <TextArea
                  placeholder="Ví dụ: Làng quê xưa, Giếng nước, Hoàng cung..."
                  rows={3}
                  className="rounded-xl border-gray-200"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">
                  Nội dung câu chuyện
                </span>
              }
              name="content"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập nội dung câu chuyện",
                },
              ]}
            >
              <TextArea
                placeholder="Bắt đầu viết nội dung tại đây..."
                rows={16}
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 16,
                  lineHeight: 1.8,
                }}
                className="rounded-xl border-gray-200 p-4"
              />
            </Form.Item>
          </div>
        </div>

        {/* Sidebar settings column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h4 className="font-bold text-gray-800 text-base mb-1 border-b border-gray-50 pb-2">
              ⚙️ Thông tin chung
            </h4>

            <Form.Item
              label={
                <span className="font-semibold text-gray-600">Tác giả</span>
              }
              name="author"
              rules={[{ required: true, message: "Vui lòng nhập tên tác giả" }]}
            >
              <Input
                placeholder="Tên tác giả..."
                size="large"
                className="rounded-xl border-gray-200"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-600">Thể loại</span>
              }
              name="genreId"
            >
              <Select
                placeholder="Chọn thể loại truyện..."
                size="large"
                allowClear
                options={genres.map((g) => ({ label: g.name, value: g.id }))}
                className="w-full rounded-xl"
                popupClassName="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-600">Loại truyện</span>
              }
              name="isShortStory"
              initialValue={false}
              rules={[{ required: true, message: "Vui lòng chọn loại truyện" }]}
            >
              <Select
                placeholder="Chọn loại truyện..."
                size="large"
                options={[
                  { label: "Truyện dài tập (nhiều chương)", value: false },
                  { label: "Truyện ngắn (không chương)", value: true },
                ]}
                className="w-full rounded-xl"
                popupClassName="rounded-xl"
              />
            </Form.Item>
          </div>

          {/* Media / Cover Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h4 className="font-bold text-gray-800 text-base mb-1 border-b border-gray-50 pb-2">
              🖼️ Ảnh bìa truyện
            </h4>

            <Form.Item
              label={
                <span className="font-semibold text-gray-600">
                  Đường dẫn ảnh (URL)
                </span>
              }
              name="coverImage"
            >
              <Input
                placeholder="https://example.com/cover.jpg"
                size="large"
                className="rounded-xl border-gray-200"
              />
            </Form.Item>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-semibold text-gray-600 mb-3">
                Tải ảnh bìa lên
              </label>
              <Space direction="vertical" className="w-full">
                <Upload
                  beforeUpload={(file) => {
                    handleFileChange(file as unknown as File);
                    return false;
                  }}
                  accept="image/*"
                  showUploadList={false}
                >
                  <Button
                    icon={<UploadOutlined />}
                    size="large"
                    className="rounded-xl w-full"
                  >
                    Chọn ảnh tải lên
                  </Button>
                </Upload>

                {coverPreview ? (
                  <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-200 group">
                    <img
                      src={coverPreview}
                      alt="preview"
                      className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full">
                        Xem trước
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 w-full h-44 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                    <span className="text-3xl">🖼️</span>
                    <span className="text-xs mt-2">Chưa có ảnh bìa</span>
                  </div>
                )}
              </Space>
            </div>
          </div>

          {/* Bottom actions for mobile screens */}
          <div className="sm:hidden bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-3">
            <Button
              size="large"
              className="flex-1 rounded-xl"
              onClick={() => navigate("/stories")}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="flex-1 bg-[#00B4DB] hover:bg-[#0092b3] border-[#00B4DB] hover:border-[#0092b3] rounded-xl font-semibold shadow-sm"
              style={{ background: "#00B4DB", borderColor: "#00B4DB" }}
            >
              {isEdit ? "Cập nhật" : "Tạo truyện"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
