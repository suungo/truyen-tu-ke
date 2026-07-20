import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Typography,
  Button,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAdminReaderStats } from "../hooks/useReaders";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ReaderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: stats, isLoading, isError } = useAdminReaderStats(Number(id));

  if (isLoading) {
    return <div className="p-6 text-center">Đang tải thông tin...</div>;
  }

  if (isError || !stats) {
    return (
      <div className="p-6 text-center">
        <Text type="danger">Có lỗi xảy ra khi tải dữ liệu độc giả</Text>
        <div className="mt-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/readers")}
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const { reader, totalRegistered, totalApproved, totalRejected } = stats;

  return (
    <div className="p-4 bg-[#FFFFFF] min-h-screen rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Title level={3} style={{ margin: 0 }}>
          Chi tiết độc giả: {reader.username}
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        {/* Thông tin cá nhân */}
        <Col xs={24} md={10}>
          <Card
            title="Thông tin độc giả"
            className="shadow-sm rounded-xl h-full"
          >
            <Descriptions column={1} layout="vertical" bordered size="middle">
              <Descriptions.Item label="Họ và tên">
                <span className="font-bold text-gray-800 text-base">
                  {reader.username}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ Email">
                <span className="text-gray-700 font-mono">{reader.email}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {dayjs(reader.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Thống kê kịch bản */}
        <Col xs={24} md={14}>
          <Card
            title="Thống kê hoạt động"
            className="shadow-sm rounded-xl h-full"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  className="bg-blue-50/50 hover:bg-blue-50 transition-colors"
                >
                  <Statistic
                    title="Tổng kịch bản đã đăng ký"
                    value={totalRegistered}
                    prefix={<FileTextOutlined style={{ color: "#2F80ED" }} />}
                    valueStyle={{ color: "#2F80ED", fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  className="bg-green-50/50 hover:bg-green-50 transition-colors"
                >
                  <Statistic
                    title="Kịch bản được duyệt"
                    value={totalApproved}
                    prefix={
                      <CheckCircleOutlined style={{ color: "#27AE60" }} />
                    }
                    valueStyle={{ color: "#27AE60", fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  className="bg-red-50/50 hover:bg-red-50 transition-colors"
                >
                  <Statistic
                    title="Kịch bản bị từ chối"
                    value={totalRejected}
                    prefix={
                      <CloseCircleOutlined style={{ color: "#EB5757" }} />
                    }
                    valueStyle={{ color: "#EB5757", fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
