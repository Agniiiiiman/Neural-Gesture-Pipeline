import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Neural Gesture Pipeline — AI/ML Control & Analytics Dashboard",
  description: "Real-time gesture recognition interface using MediaPipe and OpenCV. Analyze landmarks, track stats, and manage ML settings.",
  keywords: ["Computer Vision", "MediaPipe", "OpenCV", "AI Dashboard", "Gesture Recognition", "Hand Tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>

        <style>{`
          .app-layout {
            display: flex;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            position: relative;
          }

          .main-content {
            flex: 1;
            margin-left: 300px; /* Sidebar width 260px + spacing */
            padding: 40px;
            overflow-y: auto;
            position: relative;
            z-index: 10;
            height: 100vh;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          /* Responsive main content adjustment */
          @media (max-width: 1024px) {
            .app-layout {
              flex-direction: column;
            }

            .main-content {
              margin-left: 0;
              margin-top: 60px; /* Height of mobile header */
              padding: 24px 20px;
              height: calc(100vh - 60px);
            }
          }
        `}</style>
      </body>
    </html>
  );
}
