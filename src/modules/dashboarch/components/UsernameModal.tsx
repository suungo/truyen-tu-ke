import { useState } from "react";

interface UsernameModalProps {
  onSubmit: () => Promise<void>;
}

const generateRandomCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid O, 0, I, 1 for visual clarity
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captcha, setCaptcha] = useState(generateRandomCaptcha());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (userCaptcha.trim().toUpperCase() !== captcha) {
      setCaptcha(generateRandomCaptcha());
      setUserCaptcha("");
      return setError("Mã captcha xác thực không chính xác");
    }

    setLoading(true);
    try {
      await onSubmit();
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
      setCaptcha(generateRandomCaptcha());
      setUserCaptcha("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#F7EAD3] border border-[#2D251E]/20 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-fadeIn text-[#2D251E]">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📖</div>
          <h2 className="text-2xl font-bold">Xác nhận truy cập</h2>
          <p className="text-[#2D251E]/60 text-sm mt-1">
            Vui lòng nhập mã captcha chống spam để bắt đầu đọc truyện
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Captcha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#2D251E]/80">Mã xác thực chống spam</label>
            <div className="flex items-center gap-3">
              <div
                className="flex-1 bg-white/40 border border-[#2D251E]/20 rounded-xl py-2 px-4 text-center font-mono text-xl font-extrabold tracking-widest text-[#2D251E] select-none italic"
                style={{
                  backgroundImage: "linear-gradient(45deg, rgba(45,37,30,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(45,37,30,0.05) 25%, transparent 25%)",
                  backgroundSize: "10px 10px",
                }}
              >
                {captcha}
              </div>
              <button
                type="button"
                onClick={() => setCaptcha(generateRandomCaptcha())}
                className="p-2 border border-[#2D251E]/20 bg-white/40 rounded-xl hover:bg-white/85 text-[#2D251E] transition-colors cursor-pointer text-sm"
                title="Tải lại mã"
              >
                🔄
              </button>
            </div>
            <input
              type="text"
              value={userCaptcha}
              onChange={(e) => {
                setUserCaptcha(e.target.value);
                setError("");
              }}
              placeholder="Nhập mã xác thực ở trên..."
              className="w-full px-4 py-3 border border-[#2D251E]/20 rounded-xl bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
            />
          </div>

          {error && <p className="text-red-600 font-semibold text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all cursor-pointer text-sm shadow-md mt-2"
            style={{
              background: loading
                ? "#ccc"
                : "linear-gradient(135deg, #1E2D3D, #2D251E)",
            }}
          >
            {loading ? "Đang xử lý..." : "Xác nhận & Bắt đầu đọc 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
