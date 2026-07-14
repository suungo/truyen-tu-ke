import { useState, useEffect, useMemo } from "react";
import { Modal, Select, Button } from "antd";

interface VoiceSelectionModalProps {
  open: boolean;
  onCancel: () => void;
  onStartSpeaking: (voice: SpeechSynthesisVoice | null) => void;
  voices: SpeechSynthesisVoice[];
}

export default function VoiceSelectionModal({
  open,
  onCancel,
  onStartSpeaking,
  voices,
}: VoiceSelectionModalProps) {
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  const uniqueLangs = useMemo(() => {
    const langs = new Set<string>();
    voices.forEach((v) => langs.add(v.lang));
    return Array.from(langs);
  }, [voices]);

  const getLangName = (langCode: string) => {
    try {
      const displayNames = new Intl.DisplayNames(["vi", "en"], { type: "language" });
      return displayNames.of(langCode) || langCode;
    } catch {
      return langCode;
    }
  };

  const filteredVoices = useMemo(() => {
    return voices.filter((v) => v.lang === selectedLang);
  }, [voices, selectedLang]);

  useEffect(() => {
    if (voices.length > 0) {
      const viVoice = voices.find(
        (v) => v.lang.includes("vi-VN") || v.lang.includes("vi")
      );
      if (viVoice) {
        setSelectedLang(viVoice.lang);
        setSelectedVoiceURI(viVoice.voiceURI);
      } else {
        setSelectedLang(voices[0].lang);
        setSelectedVoiceURI(voices[0].voiceURI);
      }
    }
  }, [voices]);

  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    const firstVoice = voices.find((v) => v.lang === lang);
    if (firstVoice) {
      setSelectedVoiceURI(firstVoice.voiceURI);
    }
  };

  const getVoiceDisplayNameAndGender = (voice: SpeechSynthesisVoice) => {
    let rawName = voice.name;
    let cleanName = rawName
      .replace(/Microsoft\s+/gi, "")
      .replace(/Google\s+/gi, "")
      .replace(/Online\s*\(Natural\)/gi, "")
      .replace(/Online/gi, "")
      .trim();

    if (cleanName.includes(" - ")) {
      cleanName = cleanName.split(" - ")[0].trim();
    }
    cleanName = cleanName.replace(/\s*\([^)]*\)/g, "").trim();

    if (cleanName.toLowerCase() === "tiếng việt") {
      cleanName = "Google Tiếng Việt";
    }

    const lowerName = rawName.toLowerCase();
    let gender = "Giọng nữ";

    if (
      lowerName.includes("male") ||
      lowerName.includes("david") ||
      lowerName.includes("george") ||
      lowerName.includes("namminh") ||
      lowerName.includes("nam minh") ||
      lowerName.includes("manh") ||
      lowerName.includes("mạnh") ||
      lowerName.includes("phong")
    ) {
      gender = "Giọng nam";
    } else if (
      lowerName.includes("female") ||
      lowerName.includes("zira") ||
      lowerName.includes("hazel") ||
      lowerName.includes("susan") ||
      lowerName.includes("hoaimy") ||
      lowerName.includes("hoài my") ||
      lowerName.includes("lan") ||
      lowerName.includes("linh") ||
      lowerName.includes("an") ||
      lowerName.includes("huyen") ||
      lowerName.includes("huyền") ||
      lowerName.includes("vy") ||
      lowerName.includes("chi") ||
      lowerName.includes("tiếng việt")
    ) {
      gender = "Giọng nữ";
    }

    return `${cleanName} - ${gender}`;
  };

  const handleConfirm = () => {
    const voice = voices.find((v) => v.voiceURI === selectedVoiceURI) || null;
    onStartSpeaking(voice);
  };

  return (
    <Modal
      title={
        <span className="text-[#2D251E] font-bold text-lg flex items-center gap-2">
          🎙️ Tùy chọn giọng đọc
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      styles={{
        body: {
          padding: "12px 0 0 0",
        },
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#2D251E]/75 mb-1.5">
            Ngôn ngữ
          </label>
          <Select
            className="w-full"
            value={selectedLang}
            onChange={handleLangChange}
            options={uniqueLangs.map((lang) => ({
              value: lang,
              label: `${getLangName(lang)} (${lang})`,
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D251E]/75 mb-1.5">
            Giọng đọc
          </label>
          <Select
            className="w-full"
            value={selectedVoiceURI}
            onChange={(val) => setSelectedVoiceURI(val)}
            options={filteredVoices.map((voice) => ({
              value: voice.voiceURI,
              label: getVoiceDisplayNameAndGender(voice),
            }))}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-[#2D251E]/10">
          <Button
            onClick={onCancel}
            className="rounded-lg border-[#2D251E]/20 text-[#2D251E] hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            className="bg-[#1E2D3D] hover:bg-[#2c3d50] text-white rounded-lg border-none"
          >
            Bắt đầu đọc
          </Button>
        </div>
      </div>
    </Modal>
  );
}
