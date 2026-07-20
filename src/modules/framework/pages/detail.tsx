import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Popconfirm,
  message,
  Modal,
  Progress,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  AppstoreAddOutlined,
  BookOutlined,
  SettingOutlined,
  FireOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  useAdminFrameworks,
  useFrameworkByStory,
  useCreateOrUpdateFramework,
  useAddPhase,
  useUpdatePhase,
  useDeletePhase,
  useAddEpisode,
  useUpdateEpisode,
  useDeleteEpisode,
  useToggleEpisodeComplete,
} from "../hooks/useFramework";
import { useAdminStories } from "@/modules/stories/hooks/useStories";
import type { FrameworkPhase, FrameworkEpisode } from "@/apis/framework.api";
import AIPublishModal from "../components/AIPublishModal";
import ChapterListDrawer from "../components/ChapterListDrawer";
import { useChaptersByStory, useCreateChapter } from "../hooks/useChapters";

const { TextArea } = Input;

const PHASE_COLORS = [
  {
    bg: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-600",
    text: "text-violet-700",
    dot: "#7c3aed",
  },
  {
    bg: "from-blue-500 to-indigo-600",
    light: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-600",
    text: "text-blue-700",
    dot: "#2563eb",
  },
  {
    bg: "from-teal-500 to-emerald-600",
    light: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-600",
    text: "text-teal-700",
    dot: "#0d9488",
  },
  {
    bg: "from-orange-500 to-red-500",
    light: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-600",
    text: "text-orange-700",
    dot: "#ea580c",
  },
  {
    bg: "from-pink-500 to-rose-600",
    light: "bg-pink-50",
    border: "border-pink-200",
    badge: "bg-pink-600",
    text: "text-pink-700",
    dot: "#db2777",
  },
  {
    bg: "from-amber-500 to-yellow-600",
    light: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-600",
    text: "text-amber-700",
    dot: "#d97706",
  },
];

export default function FrameworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [phaseForm] = Form.useForm();
  const [episodeForm] = Form.useForm();

  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  const [editPhaseOpen, setEditPhaseOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<FrameworkPhase | null>(null);
  const [addEpisodeOpen, setAddEpisodeOpen] = useState(false);
  const [editEpisodeOpen, setEditEpisodeOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<FrameworkEpisode | null>(
    null,
  );
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [collapsedInfo, setCollapsedInfo] = useState(false);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<number>>(
    new Set(),
  );
  const [aiPublishOpen, setAiPublishOpen] = useState(false);
  const [aiEpisode, setAiEpisode] = useState<FrameworkEpisode | null>(null);
  const [aiPhase, setAiPhase] = useState<FrameworkPhase | null>(null);
  const [chapterDrawerOpen, setChapterDrawerOpen] = useState(false);

  const { data: stories = [] } = useAdminStories();
  const { data: allFrameworks = [] } = useAdminFrameworks();

  const isCreate = id === "create";
  const frameworkId = isCreate ? null : Number(id);
  const queryStoryId = new URLSearchParams(window.location.search).get(
    "storyId",
  );
  const effectiveStoryId =
    selectedStoryId || (queryStoryId ? Number(queryStoryId) : null);
  const [foundStoryId, setFoundStoryId] = useState<number | null>(null);

  useEffect(() => {
    if (!isCreate && frameworkId) {
      if (queryStoryId) {
        setFoundStoryId(Number(queryStoryId));
      } else if (allFrameworks.length > 0) {
        const found = allFrameworks.find((fw) => fw.id === frameworkId);
        if (found) setFoundStoryId(found.storyId);
      }
    } else if (effectiveStoryId) {
      setFoundStoryId(effectiveStoryId);
    }
  }, [isCreate, frameworkId, queryStoryId, effectiveStoryId, allFrameworks]);

  const resolvedStoryId = foundStoryId || effectiveStoryId;
  const { data: framework } = useFrameworkByStory(resolvedStoryId || 0);

  const createMutation = useCreateOrUpdateFramework();
  const addPhaseMutation = useAddPhase();
  const updatePhaseMutation = useUpdatePhase();
  const deletePhaseMutation = useDeletePhase();
  const addEpisodeMutation = useAddEpisode();
  const updateEpisodeMutation = useUpdateEpisode();
  const deleteEpisodeMutation = useDeleteEpisode();
  const toggleMutation = useToggleEpisodeComplete();
  const createChapterMutation = useCreateChapter();
  const { data: chaptersData } = useChaptersByStory(resolvedStoryId || 0);

  useEffect(() => {
    if (framework) {
      form.setFieldsValue({
        totalEpisodes: framework.totalEpisodes,
        overview: framework.overview,
      });
    }
  }, [framework, form]);

  const handleSaveFramework = async (values: any) => {
    if (!resolvedStoryId) {
      message.error("Vui lòng chọn truyện");
      return;
    }
    try {
      await createMutation.mutateAsync({
        storyId: resolvedStoryId,
        payload: values,
      });
      message.success("Lưu khung kịch bản thành công");
    } catch {
      message.error("Lưu thất bại");
    }
  };

  const handleAddPhase = async (values: any) => {
    if (!framework) return;
    try {
      await addPhaseMutation.mutateAsync({
        frameworkId: framework.id,
        payload: values,
        storyId: resolvedStoryId ?? undefined,
      });
      message.success("Thêm giai đoạn thành công");
      setAddPhaseOpen(false);
      phaseForm.resetFields();
    } catch {
      message.error("Thêm giai đoạn thất bại");
    }
  };

  const handleEditPhase = async (values: any) => {
    if (!editingPhase) return;
    try {
      await updatePhaseMutation.mutateAsync({
        id: editingPhase.id,
        payload: values,
        storyId: resolvedStoryId ?? undefined,
      });
      message.success("Cập nhật giai đoạn thành công");
      setEditPhaseOpen(false);
      setEditingPhase(null);
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    try {
      await deletePhaseMutation.mutateAsync({
        phaseId,
        storyId: resolvedStoryId ?? undefined,
      });
      message.success("Đã xóa giai đoạn");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleAddEpisode = async (values: any) => {
    if (!activePhaseId) return;
    try {
      await addEpisodeMutation.mutateAsync({
        phaseId: activePhaseId,
        payload: values,
        storyId: resolvedStoryId ?? undefined,
      });
      message.success("Thêm tập thành công");
      setAddEpisodeOpen(false);
      episodeForm.resetFields();
    } catch {
      message.error("Thêm tập thất bại");
    }
  };

  const handleEditEpisode = async (values: any) => {
    if (!editingEpisode) return;
    try {
      await updateEpisodeMutation.mutateAsync({
        id: editingEpisode.id,
        payload: values,
        storyId: resolvedStoryId ?? undefined,
      });
      message.success("Cập nhật tập thành công");
      setEditEpisodeOpen(false);
      setEditingEpisode(null);
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const handleDeleteEpisode = async (episodeId: number) => {
    try {
      await deleteEpisodeMutation.mutateAsync({
        episodeId,
        storyId: resolvedStoryId ?? undefined,
      });
      message.success("Đã xóa tập");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleToggle = async (episodeId: number) => {
    try {
      await toggleMutation.mutateAsync({
        episodeId,
        storyId: resolvedStoryId ?? undefined,
      });
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const openEditPhase = (phase: FrameworkPhase) => {
    setEditingPhase(phase);
    phaseForm.setFieldsValue({
      title: phase.title,
      description: phase.description,
      episodeFrom: phase.episodeFrom,
      episodeTo: phase.episodeTo,
    });
    setEditPhaseOpen(true);
  };

  const openEditEpisode = (ep: FrameworkEpisode) => {
    setEditingEpisode(ep);
    episodeForm.setFieldsValue({
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      synopsis: ep.synopsis,
      keyEvents: ep.keyEvents,
      charactersInvolved: ep.charactersInvolved,
    });
    setEditEpisodeOpen(true);
  };

  const openAddEpisode = (phaseId: number) => {
    setActivePhaseId(phaseId);
    episodeForm.resetFields();
    setAddEpisodeOpen(true);
  };

  const toggleCollapsePhase = (phaseId: number) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  const allEpisodes = framework?.phases?.flatMap((p) => p.episodes || []) || [];
  const completedCount = allEpisodes.filter((e) => e.isCompleted).length;
  const progressPct = allEpisodes.length
    ? Math.round((completedCount / allEpisodes.length) * 100)
    : 0;
  const selectedStory = stories.find((s) => s.id === resolvedStoryId);
  const sortedPhases = [...(framework?.phases || [])].sort(
    (a, b) => a.order - b.order,
  );

  const openAIPublish = (ep: FrameworkEpisode, ph: FrameworkPhase) => {
    setAiEpisode(ep);
    setAiPhase(ph);
    setAiPublishOpen(true);
  };

  const handleAIPublish = async (
    _epNum: number,
    epTitle: string,
    content: string,
  ) => {
    if (!resolvedStoryId || !aiEpisode)
      throw new Error("Không tìm thấy truyện");
    await createChapterMutation.mutateAsync({
      storyId: resolvedStoryId,
      payload: {
        chapterNumber: aiEpisode.episodeNumber,
        title: epTitle,
        content,
        synopsis: aiEpisode.synopsis,
      },
    });
  };

  // ─── Phase Form ────────────────────────────────────────────────────────────
  const phaseFormUI = (
    <Form form={phaseForm} layout="vertical" requiredMark={false}>
      <Form.Item
        label={
          <span className="font-semibold text-gray-700">
            Tên giai đoạn <span className="text-red-500">*</span>
          </span>
        }
        name="title"
        rules={[{ required: true, message: "Vui lòng nhập tên giai đoạn" }]}
      >
        <Input
          autoFocus
          allowClear
          placeholder="Ví dụ: Giai đoạn 1: Sinh Tồn & Bộ Tộc Nguyên Thủy"
          className="h-9!"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="font-semibold text-gray-700">Mô tả giai đoạn</span>
        }
        name="description"
      >
        <TextArea
          rows={3}
          placeholder="Tóm tắt nội dung của giai đoạn này..."
        />
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label={
            <span className="font-semibold text-gray-700">
              Từ tập <span className="text-red-500">*</span>
            </span>
          }
          name="episodeFrom"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <InputNumber min={1} className="w-full! rounded-lg" />
        </Form.Item>
        <Form.Item
          label={
            <span className="font-semibold text-gray-700">
              Đến tập <span className="text-red-500">*</span>
            </span>
          }
          name="episodeTo"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <InputNumber min={1} className="w-full! rounded-lg" />
        </Form.Item>
      </div>
    </Form>
  );

  // ─── Episode Form ───────────────────────────────────────────────────────────
  const episodeFormUI = (
    <Form form={episodeForm} layout="vertical" requiredMark={false}>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label={
            <span className="font-semibold text-gray-700">
              Số tập <span className="text-red-500">*</span>
            </span>
          }
          name="episodeNumber"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <InputNumber min={1} className="w-full! rounded-lg" />
        </Form.Item>
        <Form.Item
          label={
            <span className="font-semibold text-gray-700">
              Tên tập <span className="text-red-500">*</span>
            </span>
          }
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tên tập" }]}
        >
          <Input
            placeholder="Ví dụ: Tỉnh dậy ở hồng hoang"
            className="rounded-lg"
          />
        </Form.Item>
      </div>
      <Form.Item
        label={
          <span className="font-semibold text-gray-700">Tóm tắt nội dung</span>
        }
        name="synopsis"
      >
        <TextArea
          rows={3}
          placeholder="Nam ngắt do quá sức, tỉnh dậy trong hang đá..."
          className="rounded-lg"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="font-semibold text-gray-700">Sự kiện chính</span>
        }
        name="keyEvents"
      >
        <TextArea
          rows={2}
          placeholder="Gặp bộ tộc, học đốt lửa, thoát khỏi thú dữ..."
          className="rounded-lg"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="font-semibold text-gray-700">
            Nhân vật xuất hiện
          </span>
        }
        name="charactersInvolved"
      >
        <Input
          placeholder="Nam, Tộc trưởng, Phù thủy bộ tộc..."
          className="rounded-lg"
        />
      </Form.Item>
    </Form>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 p-5">
      {/* ═══════════════════════════════ HERO HEADER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 via-purple-600 to-indigo-700 p-6 mb-5 shadow-xl shadow-purple-200">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
              <BookOutlined />
              <span>Khung kịch bản</span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">
              {framework
                ? selectedStory?.title || `Truyện #${resolvedStoryId}`
                : "Tạo Khung Kịch Bản Mới"}
            </h1>
            {framework && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  📚 {framework.totalEpisodes} tập
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  🎬 {sortedPhases.length} giai đoạn
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  ✅ {completedCount}/{allEpisodes.length} hoàn thành
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-400/30 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-400/40">
                  📖 {chaptersData?.total || 0}/{framework.totalEpisodes} tập đã
                  xuất bản
                </span>
              </div>
            )}
          </div>
          {framework && (
            <div className="flex flex-col items-end gap-2 min-w-[140px]">
              <span className="text-white/80 text-xs font-medium">
                Tiến độ tổng thể
              </span>
              <span className="text-3xl font-black text-white">
                {progressPct}%
              </span>
              <Progress
                percent={progressPct}
                showInfo={false}
                strokeColor={{ "0%": "#a78bfa", "100%": "#34d399" }}
                trailColor="rgba(255,255,255,0.25)"
                strokeWidth={8}
                className="w-36"
              />
              <button
                onClick={() => setChapterDrawerOpen(true)}
                className="mt-1 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer border border-white/30"
              >
                <BookOutlined />
                Xem danh sách tập
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════ INFO SECTION ════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5 overflow-hidden">
        <button
          onClick={() => setCollapsedInfo(!collapsedInfo)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm">
              <SettingOutlined className="text-white text-sm" />
            </div>
            <span className="font-semibold text-gray-800">
              Thông tin khung kịch bản
            </span>
          </div>
          <span
            className={`text-gray-400 transition-transform duration-200 text-xs ${collapsedInfo ? "rotate-0" : "rotate-180"}`}
          >
            ▲
          </span>
        </button>

        {!collapsedInfo && (
          <div className="px-5 pb-5 border-t border-gray-50">
            {isCreate && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Chọn truyện <span className="text-red-500">*</span>
                </label>
                <Select
                  showSearch
                  placeholder="Tìm và chọn truyện..."
                  filterOption={(input, option) =>
                    String(option?.label)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={stories.map((s) => ({
                    label: s.title,
                    value: s.id,
                  }))}
                  onChange={(val) => setSelectedStoryId(val)}
                  value={effectiveStoryId}
                  className="w-full rounded-xl"
                  size="large"
                />
              </div>
            )}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveFramework}
              requiredMark={false}
              className="mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  label={
                    <span className="text-sm font-semibold text-gray-700">
                      Tổng số tập dự kiến
                    </span>
                  }
                  name="totalEpisodes"
                  rules={[{ required: true, message: "Bắt buộc" }]}
                >
                  <InputNumber
                    min={1}
                    max={9999}
                    className="w-full rounded-xl"
                    size="large"
                    placeholder="40"
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-sm font-semibold text-gray-700">
                      Tổng quan kịch bản
                    </span>
                  }
                  name="overview"
                  className="md:col-span-2"
                >
                  <TextArea
                    rows={2}
                    placeholder="Mô tả tổng quan về hành trình, chủ đề và mục tiêu của câu chuyện..."
                    className="rounded-xl"
                  />
                </Form.Item>
              </div>
              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={createMutation.isPending}
                  size="large"
                  style={{
                    background: "linear-linear(135deg,#0d9488,#0891b2)",
                    border: "none",
                  }}
                  className="rounded-xl px-6 font-semibold shadow-md"
                >
                  Lưu khung kịch bản
                </Button>
              </div>
            </Form>
          </div>
        )}
      </div>

      {/* ════════════════════════════ PHASES & EPISODES ════════════════════════ */}
      {framework && (
        <div className="space-y-1">
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">🎬</span>
              </div>
              <h2 className="text-base font-bold text-gray-800">
                Giai đoạn & Tập
              </h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {sortedPhases.length}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "linear-linear(135deg,#7c3aed,#6d28d9)",
                border: "none",
              }}
              onClick={() => {
                phaseForm.resetFields();
                setAddPhaseOpen(true);
              }}
              className="rounded-xl font-semibold shadow-md"
            >
              Thêm giai đoạn
            </Button>
          </div>

          {sortedPhases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-16 gap-3">
              <AppstoreAddOutlined className="text-5xl text-gray-300" />
              <p className="text-gray-400 font-medium">Chưa có giai đoạn nào</p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  background: "linear-linear(135deg,#7c3aed,#6d28d9)",
                  border: "none",
                }}
                onClick={() => {
                  phaseForm.resetFields();
                  setAddPhaseOpen(true);
                }}
                className="rounded-xl"
              >
                Thêm giai đoạn đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPhases.map((phase, phaseIndex) => {
                const color = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
                const sortedEps = [...(phase.episodes || [])].sort(
                  (a, b) => a.episodeNumber - b.episodeNumber,
                );
                const phaseCompleted = sortedEps.filter(
                  (e) => e.isCompleted,
                ).length;
                const phasePct = sortedEps.length
                  ? Math.round((phaseCompleted / sortedEps.length) * 100)
                  : 0;
                const isCollapsed = collapsedPhases.has(phase.id);

                return (
                  <div
                    key={phase.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200"
                  >
                    {/* ── Phase Header ── */}
                    <div
                      className={`relative px-5 py-4 ${color.light} border-b ${color.border}`}
                    >
                      {/* Left accent bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b ${color.bg} rounded-l-none`}
                      />

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Phase number badge */}
                          <div
                            className={`shrink-0 w-9 h-9 rounded-xl ${color.badge} flex items-center justify-center shadow-sm`}
                          >
                            <span className="text-white text-sm font-black">
                              {phaseIndex + 1}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-800 text-sm leading-tight">
                                {phase.title}
                              </h3>
                              <span
                                className={`text-xs font-semibold ${color.text} bg-white/70 px-2 py-0.5 rounded-full border ${color.border}`}
                              >
                                Tập {phase.episodeFrom}–{phase.episodeTo}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs text-gray-500">
                                {phaseCompleted}/{sortedEps.length} tập hoàn
                                thành
                              </span>
                              <div className="flex-1 max-w-[120px]">
                                <Progress
                                  percent={phasePct}
                                  showInfo={false}
                                  strokeColor={color.dot}
                                  trailColor="#e5e7eb"
                                  strokeWidth={5}
                                  size="small"
                                />
                              </div>
                              <span
                                className={`text-xs font-bold ${color.text}`}
                              >
                                {phasePct}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Phase actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Tooltip title="Thêm tập">
                            <Button
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => openAddEpisode(phase.id)}
                              className="rounded-lg text-xs font-semibold"
                            >
                              Thêm tập
                            </Button>
                          </Tooltip>
                          <Tooltip title="Sửa giai đoạn">
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => openEditPhase(phase)}
                              className="rounded-lg"
                            />
                          </Tooltip>
                          <Popconfirm
                            title="Xóa giai đoạn?"
                            description="Toàn bộ tập trong giai đoạn sẽ bị xóa."
                            onConfirm={() => handleDeletePhase(phase.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              size="small"
                              icon={<DeleteOutlined />}
                              danger
                              className="rounded-lg"
                            />
                          </Popconfirm>
                          <button
                            onClick={() => toggleCollapsePhase(phase.id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all cursor-pointer ${color.text}`}
                          >
                            <span
                              className={`text-xs transition-transform duration-200 ${isCollapsed ? "rotate-180" : "rotate-0"}`}
                            >
                              ▲
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Phase description */}
                      {phase.description && !isCollapsed && (
                        <p className="mt-2 text-xs text-gray-500 italic leading-relaxed ml-12">
                          {phase.description}
                        </p>
                      )}
                    </div>

                    {/* ── Episodes Grid ── */}
                    {!isCollapsed && (
                      <div className="p-4">
                        {sortedEps.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <span className="text-3xl">📝</span>
                            <p className="text-gray-400 text-sm">
                              Chưa có tập nào
                            </p>
                            <button
                              onClick={() => openAddEpisode(phase.id)}
                              className={`text-sm font-semibold ${color.text} underline cursor-pointer hover:opacity-70 transition-opacity`}
                            >
                              + Thêm tập đầu tiên
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {sortedEps.map((ep) => (
                              <div
                                key={ep.id}
                                className={`group relative rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                                  ep.isCompleted
                                    ? "bg-emerald-50/60 border-emerald-200"
                                    : "bg-gray-50/80 border-gray-100 hover:border-gray-200"
                                }`}
                              >
                                {/* Completed ribbon */}
                                {ep.isCompleted && (
                                  <div className="absolute top-0 right-0 w-0 h-0 border-l-20 border-l-transparent border-t-20 border-t-emerald-400 rounded-tr-xl" />
                                )}

                                <div className="p-3.5">
                                  {/* Episode top row */}
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <button
                                        onClick={() => handleToggle(ep.id)}
                                        className="shrink-0 cursor-pointer hover:scale-110 transition-transform"
                                      >
                                        {ep.isCompleted ? (
                                          <CheckCircleOutlined className="text-emerald-500 text-base" />
                                        ) : (
                                          <ClockCircleOutlined className="text-gray-300 text-base hover:text-teal-400 transition-colors" />
                                        )}
                                      </button>
                                      <div className="min-w-0">
                                        <div
                                          className={`text-[10px] font-bold uppercase tracking-wide ${color.text} mb-0.5`}
                                        >
                                          Tập {ep.episodeNumber}
                                        </div>
                                        <p
                                          className={`text-sm font-semibold leading-tight truncate ${ep.isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}
                                        >
                                          {ep.title}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Actions - visible on hover */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      {chaptersData?.chapters?.some((ch: any) => ch.chapterNumber === ep.episodeNumber) ? (
                                        <Tooltip title="Tập này đã được xuất bản">
                                          <button
                                            disabled
                                            className="w-6 h-6 rounded-md bg-gray-200 border-0 flex items-center justify-center text-gray-400 cursor-not-allowed shadow-sm"
                                          >
                                            <ThunderboltOutlined
                                              style={{ fontSize: 10 }}
                                            />
                                          </button>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="✨ AI xuất bản tập này">
                                          <button
                                            onClick={() =>
                                              openAIPublish(ep, phase)
                                            }
                                            className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-purple-600 border-0 flex items-center justify-center text-white hover:opacity-80 transition-opacity cursor-pointer shadow-sm"
                                          >
                                            <ThunderboltOutlined
                                              style={{ fontSize: 10 }}
                                            />
                                          </button>
                                        </Tooltip>
                                      )}
                                      <button
                                        onClick={() => openEditEpisode(ep)}
                                        className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors cursor-pointer shadow-sm"
                                      >
                                        <EditOutlined
                                          style={{ fontSize: 10 }}
                                        />
                                      </button>
                                      <Popconfirm
                                        title="Xóa tập này?"
                                        onConfirm={() =>
                                          handleDeleteEpisode(ep.id)
                                        }
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                      >
                                        <button className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors cursor-pointer shadow-sm">
                                          <DeleteOutlined
                                            style={{ fontSize: 10 }}
                                          />
                                        </button>
                                      </Popconfirm>
                                    </div>
                                  </div>

                                  {/* Synopsis */}
                                  {ep.synopsis && (
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2 pl-6">
                                      {ep.synopsis}
                                    </p>
                                  )}

                                  {/* Meta tags */}
                                  {(ep.keyEvents || ep.charactersInvolved) && (
                                    <div className="space-y-1 pl-6">
                                      {ep.keyEvents && (
                                        <div className="flex items-start gap-1.5">
                                          <FireOutlined className="text-amber-500 text-[10px] mt-0.5 shrink-0" />
                                          <p className="text-[11px] text-amber-700 leading-relaxed line-clamp-1">
                                            {ep.keyEvents}
                                          </p>
                                        </div>
                                      )}
                                      {ep.charactersInvolved && (
                                        <div className="flex items-start gap-1.5">
                                          <TeamOutlined className="text-violet-500 text-[10px] mt-0.5 shrink-0" />
                                          <p className="text-[11px] text-violet-700 leading-relaxed line-clamp-1">
                                            {ep.charactersInvolved}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {ep.isCompleted && (
                                    <div className="mt-2 pl-6">
                                      <Tag
                                        color="success"
                                        className="text-[10px] border-0"
                                      >
                                        ✓ Hoàn thành
                                      </Tag>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════ MODALS ══════════════════════════════════ */}
      {/* Add Phase */}
      <Modal
        title={
          <span className="font-bold text-gray-800">➕ Thêm Giai Đoạn</span>
        }
        open={addPhaseOpen}
        onCancel={() => setAddPhaseOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddPhaseOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={addPhaseMutation.isPending}
            onClick={() => phaseForm.validateFields().then(handleAddPhase)}
            style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
          >
            Thêm giai đoạn
          </Button>,
        ]}
        width={600}
      >
        {phaseFormUI}
      </Modal>

      {/* Edit Phase */}
      <Modal
        title={
          <span className="font-bold text-gray-800">
            ✏️ Chỉnh Sửa Giai Đoạn
          </span>
        }
        open={editPhaseOpen}
        onCancel={() => {
          setEditPhaseOpen(false);
          setEditingPhase(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditPhaseOpen(false);
              setEditingPhase(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updatePhaseMutation.isPending}
            onClick={() => phaseForm.validateFields().then(handleEditPhase)}
            style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
          >
            Lưu thay đổi
          </Button>,
        ]}
        width={600}
      >
        {phaseFormUI}
      </Modal>

      {/* Add Episode */}
      <Modal
        title={<span className="font-bold text-gray-800">➕ Thêm Tập</span>}
        open={addEpisodeOpen}
        onCancel={() => setAddEpisodeOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddEpisodeOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={addEpisodeMutation.isPending}
            onClick={() => episodeForm.validateFields().then(handleAddEpisode)}
            style={{ background: "#0d9488", borderColor: "#0d9488" }}
          >
            Thêm tập
          </Button>,
        ]}
        width={650}
      >
        {episodeFormUI}
      </Modal>

      {/* Edit Episode */}
      <Modal
        title={
          <span className="font-bold text-gray-800">✏️ Chỉnh Sửa Tập</span>
        }
        open={editEpisodeOpen}
        onCancel={() => {
          setEditEpisodeOpen(false);
          setEditingEpisode(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditEpisodeOpen(false);
              setEditingEpisode(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateEpisodeMutation.isPending}
            onClick={() => episodeForm.validateFields().then(handleEditEpisode)}
            style={{ background: "#0d9488", borderColor: "#0d9488" }}
          >
            Lưu thay đổi
          </Button>,
        ]}
        width={650}
      >
        {episodeFormUI}
      </Modal>

      {/* AI Publish Modal */}
      <AIPublishModal
        open={aiPublishOpen}
        onClose={() => setAiPublishOpen(false)}
        episode={aiEpisode}
        phase={aiPhase}
        storyTitle={selectedStory?.title || ""}
        storyOverview={framework?.overview}
        storyCharacters={selectedStory?.characters}
        storySetting={selectedStory?.setting}
        onPublish={handleAIPublish}
      />

      {/* Chapter List Drawer */}
      {framework && resolvedStoryId && (
        <ChapterListDrawer
          open={chapterDrawerOpen}
          onClose={() => setChapterDrawerOpen(false)}
          storyId={resolvedStoryId}
          storyTitle={selectedStory?.title || `Truyện #${resolvedStoryId}`}
          totalEpisodes={framework.totalEpisodes}
        />
      )}
    </div>
  );
}
