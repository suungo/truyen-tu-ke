import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendOtp, registerReader } from "@/apis/readers.api";
import { message } from "antd";

export default function RegisterReaderPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Vui lòng nhập email trước");

    setSendingOtp(true);
    try {
      await sendOtp(trimmedEmail);
      setOtpSent(true);
      message.success("Mã OTP đã được gửi đến email của bạn!");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Không thể gửi OTP. Vui lòng kiểm tra lại email.",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = username.trim();
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedName) return setError("Vui lòng nhập tên độc giả");
    if (!trimmedEmail) return setError("Vui lòng nhập email");
    if (!trimmedOtp) return setError("Vui lòng nhập mã OTP xác thực");

    setRegistering(true);
    try {
      await registerReader(trimmedName, trimmedEmail, trimmedOtp);
      message.success("Đăng ký tài khoản độc giả thành công!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn",
      );
    } finally {
      setRegistering(false);
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
          <div className="text-5xl mb-3">✍️</div>
          <h2 className="text-2xl font-bold">Đăng Ký Độc Giả</h2>
          <p className="text-[#2D251E]/60 text-sm mt-1">
            Xác minh email để bắt đầu viết truyện và chia sẻ tác phẩm
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#2D251E]/80">
              Tên độc giả
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full px-4 py-3 border border-[#2D251E]/20 rounded-xl bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
              required
              disabled={otpSent}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#2D251E]/80">
              Email xác thực
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="nhap.email@cua.ban"
                className="flex-1 px-4 py-3 border border-[#2D251E]/20 rounded-xl bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
                required
                disabled={otpSent}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpSent || !email}
                className="px-4 py-2 bg-[#2D251E] hover:bg-[#1dbfaf] text-[#EEDCBE] rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-[#2D251E] cursor-pointer shrink-0"
              >
                {sendingOtp ? "Đang gửi..." : otpSent ? "Đã OTP" : "Gửi mã OTP"}
              </button>
            </div>
          </div>

          {/* OTP */}
          {otpSent && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <label className="text-xs font-bold text-[#2D251E]/80">
                Nhập mã xác thực (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError("");
                }}
                placeholder="Mã OTP gồm 6 chữ số"
                maxLength={6}
                className="w-full px-4 py-3 border border-[#2D251E]/20 rounded-xl bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm text-center font-mono tracking-widest"
                required
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 font-semibold text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={registering || !otpSent}
            className="w-full py-3 rounded-xl font-bold text-white transition-all cursor-pointer text-sm shadow-md mt-2 disabled:opacity-45 disabled:cursor-not-allowed"
            style={{
              background: registering
                ? "#ccc"
                : "linear-gradient(135deg, #1E2D3D, #2D251E)",
            }}
          >
            {registering ? "Đang xử lý..." : "Đăng Ký & Đăng Nhập"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-[#2D251E]/60">
          Đã có tài khoản?{" "}
          <Link
            to="/auth/login"
            className="font-bold text-[#C2410C] hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
