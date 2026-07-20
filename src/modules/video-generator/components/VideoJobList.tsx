import { Empty, Skeleton, Typography, Badge } from "antd";
import { useVideoJobs } from "../hooks/useVideoGenerator";
import VideoJobCard from "./VideoJobCard";

const { Text } = Typography;

export default function VideoJobList() {
  const { data: jobs = [], isLoading } = useVideoJobs();

  const processing = jobs.filter((j) => j.status === "processing" || j.status === "pending");
  const done = jobs.filter((j) => j.status === "completed" || j.status === "failed");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} active paragraph={{ rows: 2 }} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Text type="secondary" className="text-sm">
            Chưa có video nào được tạo. Nhập kịch bản ở trên để bắt đầu!
          </Text>
        }
        className="py-8"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Đang xử lý */}
      {processing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge status="processing" />
            <Text strong className="text-sm text-gray-700">
              Đang xử lý ({processing.length})
            </Text>
          </div>
          <div className="space-y-3">
            {processing.map((job) => (
              <VideoJobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Đã hoàn thành / thất bại */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge status="default" />
            <Text strong className="text-sm text-gray-700">
              Đã xong ({done.length})
            </Text>
          </div>
          <div className="space-y-3">
            {done.map((job) => (
              <VideoJobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
