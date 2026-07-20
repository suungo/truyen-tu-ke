import { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Radio,
  Space,
} from "antd";
import { BookOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";
import { useAdminStats } from "../../stories/hooks/useStories";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const { Title } = Typography;

export default function DashboardPage() {
  const [filterType, setFilterType] = useState<"day" | "month" | "year">("day");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));

  const filters = useMemo(() => {
    if (filterType === "day") {
      return { date: selectedDate };
    } else if (filterType === "month") {
      return { month: selectedMonth, year: selectedYear };
    } else {
      return { year: selectedYear };
    }
  }, [filterType, selectedDate, selectedMonth, selectedYear]);

  const { data: stats, isLoading } = useAdminStats(filters);

  return (
    <div className="p-4 bg-[#FFFFFF] rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Title level={3} style={{ margin: 0 }}>
          Tổng quan hệ thống
        </Title>
      </div>

      {/* Bộ lọc thống kê */}
      <Card className="mb-6 shadow-sm" styles={{ body: { padding: "16px" } }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Space align="center" className="flex-wrap">
            <span className="font-semibold text-gray-700">
              Bộ lọc lượng truy cập:
            </span>
            <Radio.Group
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="day">Theo Ngày</Radio.Button>
              <Radio.Button value="month">Theo Tháng</Radio.Button>
              <Radio.Button value="year">Theo Năm</Radio.Button>
            </Radio.Group>
          </Space>

          <Space>
            {filterType === "day" && (
              <DatePicker
                value={dayjs(selectedDate)}
                onChange={(date) =>
                  date && setSelectedDate(date.format("YYYY-MM-DD"))
                }
                allowClear={false}
                placeholder="Chọn ngày"
                className="rounded-lg"
                size="middle"
              />
            )}
            {filterType === "month" && (
              <DatePicker
                picker="month"
                value={dayjs(`${selectedYear}-${selectedMonth}-01`)}
                onChange={(date) => {
                  if (date) {
                    setSelectedMonth(date.format("MM"));
                    setSelectedYear(date.format("YYYY"));
                  }
                }}
                allowClear={false}
                placeholder="Chọn tháng"
                className="rounded-lg"
                size="middle"
              />
            )}
            {filterType === "year" && (
              <DatePicker
                picker="year"
                value={dayjs(`${selectedYear}-01-01`)}
                onChange={(date) =>
                  date && setSelectedYear(date.format("YYYY"))
                }
                allowClear={false}
                placeholder="Chọn năm"
                className="rounded-lg"
                size="middle"
              />
            )}
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card loading={isLoading} bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng số truyện"
              value={stats?.totalStories || 0}
              prefix={<BookOutlined style={{ color: "#1dbfaf" }} />}
              valueStyle={{ color: "#1dbfaf", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={isLoading} bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng số độc giả"
              value={stats?.totalReaders || 0}
              prefix={<UserOutlined style={{ color: "#2b4dc9" }} />}
              valueStyle={{ color: "#2b4dc9", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={isLoading} bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng lượng truy cập"
              value={stats?.totalViews || 0}
              prefix={<EyeOutlined style={{ color: "#00B4DB" }} />}
              valueStyle={{ color: "#00B4DB", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        {/* Main Traffic Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              filterType === "day"
                ? "📈 Lượng truy cập 7 ngày qua"
                : filterType === "month"
                  ? `📅 Lượng truy cập trong tháng ${selectedMonth}/${selectedYear}`
                  : `📅 Lượng truy cập trong năm ${selectedYear}`
            }
            className="shadow-sm h-full"
            bordered={false}
            loading={isLoading}
          >
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.trafficData || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#666", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#666", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0, 180, 219, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderRadius: "8px",
                      border: "none",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    itemStyle={{ color: "#00B4DB" }}
                    formatter={(value) => [`${value} lượt`, "Truy cập"]}
                  />
                  <Bar
                    dataKey="visits"
                    fill="#00B4DB"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Hourly Traffic Chart */}
        <Col xs={24} lg={12}>
          <Card
            title="⏰ Lượng truy cập theo giờ"
            className="shadow-sm h-full"
            bordered={false}
            loading={isLoading}
          >
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.hourlyData || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#666", fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#666", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(43, 77, 201, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderRadius: "8px",
                      border: "none",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    itemStyle={{ color: "#2b4dc9" }}
                    formatter={(value) => [`${value} lượt`, "Truy cập"]}
                  />
                  <Bar
                    dataKey="visits"
                    fill="#2b4dc9"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
