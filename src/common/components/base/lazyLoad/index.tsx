import { Button } from "antd";
import React, { Suspense, useState } from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white bg-opacity-50">
          <div className="flex flex-col items-center max-w-[400px] text-center p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              className="text-red-500 mb-6"
            >
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Đã xảy ra lỗi!
            </h2>
            <p className="text-gray-600 mb-6">
              Không thể tải nội dung này. Vui lòng thử làm mới trang hoặc quay
              lại sau.
            </p>
            <div className="flex gap-4">
              <Button
                type="default"
                onClick={() => window.history.back()}
                className="min-w-[120px] h-[40px] flex items-center justify-center"
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                className="min-w-[120px] h-[40px] flex items-center justify-center bg-linear-to-r from-[#0096c4] to-[#33B3D6]"
              >
                Tải lại trang
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LazyLoad = ({ children }: { children: React.ReactElement }) => {
  const [timeoutReached, setTimeoutReached] = useState(false);

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-linear-to-br from-[#E5C88A] to-[#DDB96A]">
            <div className="flex flex-col items-center text-center max-w-[320px] p-5">
              <img
                src="/image-logo.png"
                alt="Logo"
                className="w-[140px] h-auto mb-6 animate-pulse"
                style={{ mixBlendMode: "multiply" }}
              />
              <h1 className="font-serif text-2xl font-bold text-[#2D251E] mb-2 tracking-wide">
                Kho Truyện Tự Kể
              </h1>

              {timeoutReached ? (
                <div className="flex flex-col items-center">
                  <p className="text-[#2D251E]/80 text-sm font-medium mb-1">
                    Đang tải lâu bất thường
                  </p>
                  <p className="text-xs text-[#2D251E]/60 mb-6">
                    Vui lòng đợi trong giây lát...
                  </p>
                </div>
              ) : (
                <p className="text-[#2D251E]/80 text-sm font-medium mb-6">
                  Đang tải dữ liệu...
                </p>
              )}

              <div className="w-[180px] h-[4px] bg-[#1E2D3D]/15 rounded-full overflow-hidden relative">
                <div
                  className="absolute left-0 top-0 h-full bg-[#1E2D3D] rounded-full"
                  style={{
                    width: "40%",
                    animation: "progress-slide 1.5s infinite ease-in-out",
                  }}
                />
              </div>
            </div>
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes progress-slide {
                0% { left: -40%; }
                50% { left: 100%; width: 30%; }
                100% { left: 100%; width: 0%; }
              }
            `,
              }}
            />
          </div>
        }
      >
        <TimeoutGuard onTimeout={() => setTimeoutReached(true)} />
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

const TimeoutGuard = ({ onTimeout }: { onTimeout: () => void }) => {
  React.useEffect(() => {
    const id = setTimeout(onTimeout, 15000);
    return () => clearTimeout(id);
  }, [onTimeout]);
  return null;
};

export default LazyLoad;
