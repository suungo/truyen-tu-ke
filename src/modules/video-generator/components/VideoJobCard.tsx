import { Card, Badge, Progress, Button, Popconfirm, Tag, Tooltip, Typography } from "antd";
import {
  DownloadOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useDeleteVideoJob } from "../hooks/useVideoGenerator";
import { getVideoDownloadUrl, type VideoJob } from "../api/video-generator.api";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text, Paragraph } = Typography;

interface Props {
  job: VideoJob;
}

const STATUS_CONFIG = {
  pending: {
    color: "default",
    icon: <ClockCircleOutlined />,
    label: "Chờ xử lý",
    progressStatus: "active" as const,
    badgeStatus: "default" as const,
  },
  processing: {
    color: "processing",
    icon: <LoadingOutlined />,
    label: "Đang dựng video",
    progressStatus: "active" as const,
    badgeStatus: "processing" as const,
  },
  completed: {
    color: "success",
    icon: <CheckCircleOutlined />,
    label: "Hoàn thành",
    progressStatus: "success" as const,
    badgeStatus: "success" as const,
  },
  failed: {
    color: "error",
    icon: <CloseCircleOutlined />,
    label: "Thất bại",
    progressStatus: "exception" as const,
    badgeStatus: "error" as const,
  },
};

export default function VideoJobCard({ job }: Props) {
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteVideoJob();
  const cfg = STATUS_CONFIG[job.status];
  const downloadUrl = getVideoDownloadUrl(job.id);

  return (
    <Card
      size="small"
      className="shadow-sm hover:shadow-md transition-shadow"
      style={{ borderRadius: 12, borderColor: job.status === "completed" ? "#6d28d9" : undefined }}
      styles={{ body: { padding: "16px 20px" } }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Status icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                job.status === "completed"
                  ? "linear-gradient(135deg,#059669,#047857)"
                  : job.status === "failed"
                  ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                  : job.status === "processing"
                  ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                  : "#f3f4f6",
            }}
          >
            <span style={{ color: job.status === "pending" ? "#6b7280" : "white", fontSize: 16 }}>
              {job.status === "completed" ? (
                <PlayCircleOutlined />
              ) : (
                cfg.icon
              )}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text strong className="text-sm truncate" style={{ maxWidth: 280 }}>
                🎬 {job.title}
              </Text>
              <Badge status={cfg.badgeStatus} text={<span className="text-xs">{cfg.label}</span>} />
            </div>

            <div className="mt-1 flex items-center gap-3">
              <Text type="secondary" className="text-xs">
                {dayjs(job.createdAt).fromNow()}
              </Text>
              {job.completedAt && (
                <Tag color="green" className="text-xs">
                  ✓ {dayjs(job.completedAt).format("HH:mm")}
                </Tag>
              )}
            </div>

            {/* Progress */}
            {(job.status === "processing" || job.status === "pending") && (
              <Progress
                percent={job.progress}
                status={cfg.progressStatus}
                size="small"
                className="mt-2 mb-0"
                style={{ maxWidth: 320 }}
              />
            )}

            {/* Error message */}
            {job.status === "failed" && job.error && (
              <Paragraph
                className="text-xs mt-1 mb-0"
                type="danger"
                ellipsis={{ rows: 2, expandable: true }}
              >
                {job.error}
              </Paragraph>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {job.status === "completed" && (
            <Tooltip title="Tải video MP4">
              <Button
                type="primary"
                size="small"
                icon={<DownloadOutlined />}
                href={downloadUrl}
                download
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  border: "none",
                  borderRadius: 8,
                }}
              >
                Tải về
              </Button>
            </Tooltip>
          )}

          <Popconfirm
            title="Xóa job này?"
            description="File video cũng sẽ bị xóa khỏi server."
            onConfirm={() => deleteJob(job.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa job">
              <Button
                size="small"
                danger
                ghost
                icon={<DeleteOutlined />}
                loading={isDeleting}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
}
