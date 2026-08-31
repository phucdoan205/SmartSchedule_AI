# 🏥 SmartSchedule AI - Hệ Thống Quản Lý & Đặt Lịch Nha Khoa Đa Chi Nhánh

Hệ thống quản lý phòng khám và bệnh viện răng hàm mặt ứng dụng trí tuệ nhân tạo (AI): Đặt lịch thông minh tối ưu khung giờ vàng, phân tích triệu chứng gợi ý phác đồ điều trị, quản lý ghế khám/phòng mổ vô trùng, điều chuyển nhân sự liên cơ sở, báo cáo tài chính hợp nhất và nhật ký kiểm toán hệ thống.

---

## 🏗️ Kiến Trúc Tổng Thể (Monorepo Architecture)

Dự án được tổ chức theo mô hình Monorepo gồm 3 phân hệ độc lập:

```text
SmartSchedule_AI/
├── frontend/             # Giao diện người dùng (ReactJS + Vite + Tailwind CSS + TypeScript)
├── backend/              # Core API Server & Business Logic (NestJS + Prisma ORM + PostgreSQL)
├── ai-service/           # Microservice AI & Huấn luyện mô hình (Python + FastAPI + PyTorch/Scikit-learn)
├── package.json          # Root orchestration script (chạy đồng thời FE & BE)
└── README.md             # Tài liệu dự án

🛠️ Tech Stack Chi Tiết
Thành phần: Frontend; Backend; PostgreSQL; AI Engine
Công nghệ chính: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios; NestJS, TypeScript, Prisma ORM, Passport/JWT, Class-Validator; Python 3.10+, FastAPI, PyTorch / Transformers, OpenCV, Scikit-learn
Vai trò / Nghiệp vụ: Cổng bệnh nhân (Đặt lịch AI, Tra cứu lịch) & B2B Dashboard quản trị y tế; RESTful API, RBAC Guards, quản lý lịch hẹn, ghế khám, đối soát tài chính, Audit LogsDatabase; Lưu trữ dữ liệu quan hệ (Người dùng, Chi nhánh, Ghế khám, Thiết bị, Bệnh án EMR, Giao dịch); Dự đoán phác đồ điều trị từ triệu chứng, tối ưu slot xếp lịch, phân tích ảnh X-quang/CT Cone Beam 

cấu trúc thư mục
SmartSchedule_AI/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/           # Button, Modal, Card, Input, QRScanner, Badge
│       │   ├── layout/           # Sidebar Navy (#0B192C), TopBar, Breadcrumb
│       │   └── feedback/         # Toast, LoadingSkeleton, ConfirmDialog
│       ├── modules/
│       │   ├── landing-booking/  # Luồng Đặt lịch AI 3 bước, Đặt lịch Bác sĩ, Phác đồ AI, Ticket Pass
│       │   ├── branches/         # Quản lý chi nhánh, sơ đồ tầng, phân bổ & điều chuyển nhân sự
│       │   ├── operatories/      # Cấu hình Ghế khám & Phòng mổ, đổi BS phụ trách, lịch sử ghế
│       │   ├── finance/          # Báo cáo doanh thu hợp nhất & chi tiết chi nhánh, đối soát VietQR
│       │   ├── maintenance/      # Quản lý thiết bị y tế, lên lịch bảo dưỡng, lịch sử kiểm định
│       │   ├── audit-logs/       # Nhật ký hệ thống (Lịch hẹn, EMR, Thu tiền, Phân quyền RBAC)
│       │   └── profile/          # Hồ sơ cá nhân bác sĩ, bảo mật 2FA, cấu hình thông báo Zalo/SMS
│       ├── services/             # Axios API calls kết nối NestJS Backend & AI Service
│       ├── types/                # TypeScript Interfaces & DTOs
│       └── App.tsx
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Models: User, Branch, OperatoryChair, Appointment, Equipment, AuditLog...
│   │   └── seed.ts               # Dữ liệu khởi tạo (3 chi nhánh, bác sĩ, thiết bị máy móc)
│   └── src/
│       ├── common/               # Guards (RBAC, JWT), Interceptors (AuditLog), Filters, Decorators
│       ├── config/               # Cấu hình Database, JWT, Zalo ZNS Gateway
│       └── modules/
│           ├── auth/             # Đăng nhập, xác thực 2 lớp (2FA), phân quyền vai trò
│           ├── branches/         # CRUD chi nhánh, chỉ số công suất cơ sở
│           ├── operatories/      # Quản lý trạng thái ghế nha khoa, phòng phẫu thuật
│           ├── appointments/     # Quản lý lịch hẹn, check-in mã QR, xếp lịch khám
│           ├── treatments/       # Bệnh án EMR, tiếp nhận phác đồ AI đề xuất
│           ├── finance/          # Thống kê doanh thu cơ sở, webhook thanh toán
│           ├── equipment/        # Lên lịch bảo trì máy móc, nghiệm thu kiểm định vô trùng
│           ├── audit-logs/       # Ghi log truy vết mọi hành vi người dùng
│           └── notifications/    # Gửi tin nhắn xác nhận qua Zalo ZNS / SMS
│
└── ai-service/
    ├── datasets/                 # Dữ liệu huấn luyện (Triệu chứng, ca bệnh mẫu, ảnh X-quang)
    ├── models/                   # Trọng số mô hình đã train (.pt, .pkl, .onnx)
    ├── notebooks/                # Jupyter Notebooks nghiên cứu & thử nghiệm mô hình
    ├── src/
    │   ├── api/                  # FastAPI routes (Inference endpoints)
    │   ├── core/                 # Cấu hình config & load model vào memory
    │   ├── pipelines/
    │   │   ├── symptom_classifier.py  # Phân loại triệu chứng & gợi ý phác đồ/dự toán chi phí
    │   │   ├── schedule_optimizer.py  # Thuật toán tối ưu hóa khung giờ khám tránh quá tải
    │   │   └── x_ray_analyzer.py      # Module xử lý ảnh chẩn đoán hình ảnh sơ bộ
    │   └── training/
    │       ├── train_symptom_model.py # Script train model phân tích triệu chứng
    │       └── evaluate.py            # Đánh giá độ chính xác (Accuracy, F1-score)
    ├── requirements.txt          # Thư viện Python (FastAPI, PyTorch, Uvicorn, Pandas...)
    └── main.py                   # Điểm khởi chạy FastAPI Server (Cổng 8000)

🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án
1. Yêu cầu môi trường
Node.js: >= 18.x

Python: >= 3.10

PostgreSQL: >= 14.x

Trình quản lý gói: npm hoặc yarn

Bước A: Backend (NestJS)
Bash
cd backend
npm install
# Cấu hình kết nối cơ sở dữ liệu trong file .env
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
# Backend chạy tại: http://localhost:3000
Bước B: Frontend (ReactJS)
Bash
cd frontend
npm install
npm run dev
# Frontend chạy tại: http://localhost:5173
Bước C: AI Service (Python FastAPI)
Bash
cd ai-service
python -m venv venv
# Kích hoạt venv (Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate)
pip install -r requirements.txt

# Huấn luyện mô hình phân tích triệu chứng:
python src/training/train_symptom_model.py

# Khởi chạy AI API Service:
uvicorn main:app --reload --port 8000
# AI API chạy tại: http://localhost:8000/docs
🎨 Quy Chuẩn Giao Diện & Bảng Màu Thiết Kế
Primary Navy: #0B192C (Sidebar, Nút hành động chính, Header thẻ)

Accent Cyan: #00A8E8 (Active menu, Icon AI, Tiến trình, Nút nổi bật)

Soft Blue Background: #F0F7FF / #F8FAFC (Card phác đồ, nền canvas)

Success Green: #10B981 (Trạng thái hoạt động, Đạt chuẩn vô trùng, Doanh thu tăng)

Alert Amber / Red: #F59E0B / #EF4444 (Ghế bảo trì, Cảnh báo sự cố máy móc)