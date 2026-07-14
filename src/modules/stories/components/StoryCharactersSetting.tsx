interface StoryCharactersSettingProps {
  characters?: string;
  setting?: string;
}

export default function StoryCharactersSetting({
  characters,
  setting,
}: StoryCharactersSettingProps) {
  if (!characters && !setting) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white/40 p-4 rounded-xl border border-[#2D251E]/10">
      {characters && (
        <div>
          <span className="font-bold text-sm text-[#2D251E]/70 block mb-1">
            🎭 Nhân vật:
          </span>
          <p className="text-sm text-[#2D251E]/90 whitespace-pre-wrap">
            {characters}
          </p>
        </div>
      )}
      {setting && (
        <div>
          <span className="font-bold text-sm text-[#2D251E]/70 block mb-1">
            🌍 Bối cảnh:
          </span>
          <p className="text-sm text-[#2D251E]/90 whitespace-pre-wrap">
            {setting}
          </p>
        </div>
      )}
    </div>
  );
}
