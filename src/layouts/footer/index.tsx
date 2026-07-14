import { BookOpen, Heart, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="mt-8 mb-5 bg-[#2D251E] text-[#EEDCBE] rounded-2xl border border-[#2D251E]/10 shadow-xl overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Cột 1: Thương hiệu & Giới thiệu */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/image-logo.png"
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover border border-[#EEDCBE]/20 shadow-sm"
              />
              <span className="font-extrabold text-xl tracking-wide text-[#EEDCBE]">
                Kho Truyện Tự Kể
              </span>
            </div>
            <p className="text-sm text-[#EEDCBE]/70 leading-relaxed">
              Nơi giao lưu, chia sẻ và lưu trữ những câu chuyện ký ức đặc sắc
              được viết bởi chính cộng đồng. Cùng nhau gìn giữ những giá trị
              tinh thần quý báu.
            </p>
            {/* Các liên kết mạng xã hội */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#EEDCBE]/5 hover:bg-[#EEDCBE]/15 text-[#EEDCBE]/80 hover:text-[#EEDCBE] transition-all duration-200"
                title="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#EEDCBE]/5 hover:bg-[#EEDCBE]/15 text-[#EEDCBE]/80 hover:text-[#EEDCBE] transition-all duration-200"
                title="Youtube"
              >
                <YoutubeIcon />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#EEDCBE]/5 hover:bg-[#EEDCBE]/15 text-[#EEDCBE]/80 hover:text-[#EEDCBE] transition-all duration-200"
                title="GitHub"
              >
                <GithubIcon />
              </a>
              <a
                href="https://example.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#EEDCBE]/5 hover:bg-[#EEDCBE]/15 text-[#EEDCBE]/80 hover:text-[#EEDCBE] transition-all duration-200"
                title="Website"
              >
                <GlobeIcon />
              </a>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#E5C88A] mb-4">
              Khám Phá
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/dashboard"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200 flex items-center gap-1.5"
                >
                  <BookOpen size={14} />
                  Kho Truyện Chung
                </Link>
              </li>
              <li>
                <Link
                  to="/register-story"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200 flex items-center gap-1.5"
                >
                  <span className="text-xs">✍️</span>
                  Đăng ký viết truyện
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200"
                >
                  Truyện Mới Xuất Bản
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200"
                >
                  Tác Giả Nổi Bật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200"
                >
                  Tuyển Tập Chọn Lọc
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hướng dẫn & Điều khoản */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#E5C88A] mb-4">
              Hỗ Trợ & Chính Sách
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200"
                >
                  Hướng Dẫn Viết Truyện
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200"
                >
                  Tiêu Chuẩn Cộng Đồng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200"
                >
                  Điều Khoản Sử Dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#EEDCBE]/70 hover:text-[#E5C88A] transition-colors duration-200"
                >
                  Chính Sách Bảo Mật
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#E5C88A] mb-4">
              Liên Hệ Hỗ Trợ
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-[#EEDCBE]/75">
                <MapPin size={16} className="mt-0.5 text-[#E5C88A] shrink-0" />
                <span>
                  123 Đường Sách, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-[#EEDCBE]/75">
                <Phone size={16} className="text-[#E5C88A] shrink-0" />
                <a
                  href="tel:0123456789"
                  className="hover:text-[#E5C88A] transition-colors"
                >
                  0123.456.789
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-[#EEDCBE]/75">
                <Mail size={16} className="text-[#E5C88A] shrink-0" />
                <a
                  href="mailto:support@khotruyentuke.com"
                  className="hover:text-[#E5C88A] transition-colors"
                >
                  support@khotruyentuke.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Thanh ngăn cách */}
        <div className="h-px bg-[#EEDCBE]/10 my-8"></div>

        {/* Thanh bản quyền dưới cùng */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EEDCBE]/55">
          <p>
            © {new Date().getFullYear()} Kho Truyện Tự Kể. Tất cả quyền được bảo
            lưu.
          </p>
          <p className="flex items-center gap-1.5">
            Phát triển với{" "}
            <Heart
              size={12}
              className="text-red-400 fill-current animate-pulse"
            />{" "}
            bởi Cộng Đồng Truyện Kể.
          </p>
        </div>
      </div>
    </footer>
  );
}
