import { Typography, Divider, Alert } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import VideoGeneratorForm from "../components/VideoGeneratorForm";
import VideoJobList from "../components/VideoJobList";
import { useVideoGeneratorSocket } from "../hooks/useVideoGenerator";

const { Title, Text } = Typography;

export default function VideoGeneratorPage() {
  // Lắng nghe sự kiện realtime từ Socket.io
  useVideoGeneratorSocket();

  return (
    <div className="p-4 bg-[#FFFFFF] rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            <VideoCameraOutlined style={{ color: "white", fontSize: 18 }} />
          </div>
          <Title level={3} className="m-0">
            Tạo Video Tự Động
          </Title>
        </div>
        <Text type="secondary">
          Nhập kịch bản phim → AI tự động tạo video MP4 với giọng đọc tiếng Việt
          miễn phí
        </Text>
      </div>

      {/* Notice */}
      <Alert
        type="info"
        showIcon
        className="mb-6 rounded-xl"
        message="Lưu ý về tính năng"
        description={
          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
            <li>
              Video được tạo tự động với nền màu + giọng đọc Edge TTS
              (Microsoft, miễn phí)
            </li>
            <li>Thời gian xử lý: 2–5 phút tùy độ dài kịch bản</li>
            <li>
              File video được lưu tạm trên server (xóa sau khi server restart)
            </li>
            <li>Hãy tải về ngay sau khi hoàn thành để lưu trữ lâu dài</li>
          </ul>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form nhập kịch bản */}
        <div>
          <VideoGeneratorForm />
        </div>

        {/* Danh sách jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Title level={5} className="m-0 text-gray-700">
              📋 Lịch sử tạo video
            </Title>
          </div>
          <VideoJobList />
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <Text type="secondary" className="text-xs">
          Powered by Microsoft Edge TTS + FFmpeg · Hoàn toàn miễn phí
        </Text>
      </div>
    </div>
  );
}
