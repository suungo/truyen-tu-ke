import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginReader } from "@/apis/readers.api";
import { message } from "antd";

export default function LoginReaderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Vui lòng nhập email");

    setLoading(true);
    try {
      await loginReader(trimmedEmail);
      message.success("Đăng nhập thành công!");
      const redirect = searchParams.get("redirect") || "/dashboard";
      navigate(redirect);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Email chưa đăng ký tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5C88A] flex items-center justify-center p-4">
      <div className="bg-[#F7EAD3] border border-[#2D251E]/20 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto text-[#2D251E] relative">
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#2D251E]/30 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#2D251E]/30 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#2D251E]/30 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#2D251E]/30 pointer-events-none" />

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📖</div>
          <h2 className="text-2xl font-bold">Đăng Nhập Độc Giả</h2>
          <p className="text-[#2D251E]/60 text-sm mt-1">
            Nhập email của bạn để viết truyện và xem lịch sử đăng ký
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#2D251E]/80">Email của bạn</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="nhap.email@cua.ban"
              className="w-full px-4 py-3 border border-[#2D251E]/20 rounded-xl bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
              required
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
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-[#2D251E]/60">
          Chưa có tài khoản?{" "}
          <Link to="/auth/register" className="font-bold text-[#C2410C] hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
