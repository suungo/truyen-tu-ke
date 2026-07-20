import { Modal, Form, Input, Button, notification } from "antd";
import { useAdminSendNotification } from "../hooks/useReaders";
import type { Reader } from "../api/readers.api";
import { useEffect } from "react";

interface SendNotificationModalProps {
  open: boolean;
  onCancel: () => void;
  reader: Reader | null; // if null, broadcast to everyone
}

export default function SendNotificationModal({
  open,
  onCancel,
  reader,
}: SendNotificationModalProps) {
  const [form] = Form.useForm();
  const sendMutation = useAdminSendNotification();

  // Reset form when opening or changing reader
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, reader, form]);

  const handleSubmit = async (values: { title: string; content: string }) => {
    try {
      await sendMutation.mutateAsync({
        readerId: reader ? reader.id : null,
        title: values.title.trim(),
        content: values.content.trim(),
      });

      notification.success({
        message: "Thành công",
        description: reader
          ? `Đã gửi thông báo tới độc giả "${reader.username}"`
          : "Đã phát thông báo tới tất cả độc giả",
        placement: "topRight",
      });
      onCancel();
    } catch (err: any) {
      notification.error({
        message: "Lỗi",
        description:
          err?.response?.data?.message ||
          "Không thể gửi thông báo, vui lòng thử lại.",
        placement: "topRight",
      });
    }
  };

  return (
    <Modal
      title={
        <span className="font-bold text-lg">
          {reader
            ? `Gửi thông báo tới: ${reader.username}`
            : "Phát thông báo chung"}
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ title: "", content: "" }}
        className="pt-4"
      >
        <Form.Item
          required={false}
          label={
            <span className="text-[16px] font-medium">
              Độc giả nhận <span className="text-red-500">*</span>
            </span>
          }
          name="recipient"
        >
          <Input
            className="h-9!"
            value={
              reader
                ? `${reader.username} (${reader.email})`
                : "Tất cả độc giả (Broadcast)"
            }
            disabled
            placeholder={
              reader
                ? `${reader.username} (${reader.email})`
                : "Tất cả độc giả (Broadcast)"
            }
          />
        </Form.Item>

        <Form.Item
          required={false}
          label={
            <span className="text-[16px] font-medium">
              Tiêu đề thông báo <span className="text-red-500">*</span>
            </span>
          }
          name="title"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề thông báo!" },
            { max: 150, message: "Tiêu đề không quá 150 ký tự!" },
          ]}
        >
          <Input
            className="h-9!"
            allowClear
            placeholder="Nhập tiêu đề thông báo..."
            maxLength={150}
          />
        </Form.Item>

        <Form.Item
          required={false}
          label={
            <span className="text-[16px] font-medium">
              Nội dung thông báo <span className="text-red-500">*</span>
            </span>
          }
          name="content"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung thông báo!" },
          ]}
        >
          <Input.TextArea
            rows={5}
            allowClear
            placeholder="Nhập nội dung chi tiết thông báo..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} className="h-9!">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={sendMutation.isPending}
            className="h-9!"
          >
            Gửi ngay
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
