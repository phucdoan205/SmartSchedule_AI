# 🦷 SmartSchedule AI - Backend Architecture & Database Specification (30 Tables ERD)

Tài liệu đặc tả kiến trúc Backend và lược đồ cơ sở dữ liệu quan hệ (ERD 30 bảng) cho hệ sinh thái **SmartSchedule - Bệnh Viện Răng Hàm Mặt Việt Anh Đức**.

---

## 1. Cấu Trúc Phân Nhóm 30 Thực Thể (Domain Breakdown)

Hệ thống quản lý 30 bảng được nhóm theo 7 phân hệ nghiệp vụ chính:
1. **Quản trị người dùng & Phân quyền (RBAC):** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `doctor_profiles`, `staff_schedules`.
2. **Chi nhánh & Không gian điều trị:** `branches`, `rooms`, `operatory_chairs`.
3. **Dịch vụ nha khoa & Bảng giá:** `service_categories`, `services`, `branch_services`.
4. **Bệnh nhân & Lịch hẹn thông minh:** `patients`, `appointments`, `appointment_status_history`, `appointment_services`.
5. **Bệnh án điện tử & Phác đồ AI (EMR):** `treatment_plans`, `treatment_steps`, `medical_records`, `prescriptions`, `prescription_items`, `dental_charts`.
6. **Tài chính, Hóa đơn & Đánh giá:** `invoices`, `invoice_items`, `payments`, `service_reviews`.
7. **Trang thiết bị y tế, Kho vật tư & Audit Trail:** `equipments`, `equipment_maintenance_logs`, `consumable_materials`, `audit_logs`.

---

## 2. Toàn Bộ 30 Bảng Trong `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ====================================================
// 1. NHÓM NGƯỜI DÙNG, PHÂN QUYỀN & LỊCH TRỰC (7 BẢNG)
// ====================================================

model User {
  id              String         @id @default(uuid())
  employeeCode    String         @unique // NV001
  fullName        String
  email           String         @unique
  phone           String         @unique
  passwordHash    String
  avatarUrl       String?
  branchId        String
  isTwoFactorAuth Boolean        @default(false)
  twoFactorSecret String?
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  branch          Branch         @relation(fields: [branchId], references: [id])
  doctorProfile   DoctorProfile?
  userRoles       UserRole[]
  staffSchedules  StaffSchedule[]
  doctorAppointments Appointment[] @relation("DoctorAppointments")
  technicianLogs  EquipmentMaintenanceLog[]
  auditLogs       AuditLog[]

  @@map("users")
}

model Role {
  id              String           @id @default(uuid())
  name            String           @unique // SUPER_ADMIN, BRANCH_MANAGER, DOCTOR, NURSE, RECEPTIONIST
  description     String?
  createdAt       DateTime         @default(now())

  userRoles       UserRole[]
  rolePermissions RolePermission[]

  @@map("roles")
}

model Permission {
  id              String           @id @default(uuid())
  code            String           @unique // APPOINTMENT_CREATE, EMR_UPDATE, BILLING_EXPORT
  name            String
  module          String           // APPOINTMENTS, EMR, FINANCE, SYSTEM
  createdAt       DateTime         @default(now())

  rolePermissions RolePermission[]

  @@map("permissions")
}

model RolePermission {
  id           String     @id @default(uuid())
  roleId       String
  permissionId String

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@map("user_roles")
}

model DoctorProfile {
  id              String    @id @default(uuid())
  userId          String    @unique
  licenseNumber   String    @unique // 004589/ĐNAI-CCHN
  specialty       String    // Cấy ghép Implant, Phục hình sứ, Chỉnh nha
  experienceYears Int       @default(0)
  bio             String?   @db.Text
  ratingAverage   Float     @default(5.0)
  totalReviews    Int       @default(0)

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignedChairs  OperatoryChair[]

  @@map("doctor_profiles")
}

model StaffSchedule {
  id          String   @id @default(uuid())
  userId      String
  branchId    String
  workDate    DateTime @db.Date
  shiftStart  DateTime @db.Time
  shiftEnd    DateTime @db.Time
  isLeave     Boolean  @default(false)
  notes       String?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch      Branch   @relation(fields: [branchId], references: [id])

  @@index([userId, workDate])
  @@map("staff_schedules")
}

// ====================================================
// 2. NHÓM CƠ SỞ & PHÒNG KHÁM (3 BẢNG)
// ====================================================

model Branch {
  id          String   @id @default(uuid())
  code        String   @unique // CN01, CN02, CN03
  name        String   // Chi nhánh Biên Hòa (Trụ sở chính)
  address     String
  phone       String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  users          User[]
  staffSchedules StaffSchedule[]
  rooms          Room[]
  branchServices BranchService[]
  equipments     Equipment[]
  appointments   Appointment[]
  invoices       Invoice[]

  @@map("branches")
}

model Room {
  id          String   @id @default(uuid())
  branchId    String
  roomNumber  String   // P.101, P.202
  name        String   // Phòng phẫu thuật Implant vô trùng, Phòng X-Quang CT
  floor       Int      @default(1)
  isSterilized Boolean @default(true)

  branch      Branch   @relation(fields: [branchId], references: [id])
  chairs      OperatoryChair[]

  @@map("rooms")
}

model OperatoryChair {
  id                String   @id @default(uuid())
  roomId            String
  code              String   // GHE-01, GHE-02
  name              String   // Ghế phẫu thuật vô trùng Ghế 01
  status            String   @default("AVAILABLE") // AVAILABLE, IN_USE, MAINTENANCE, STERILIZING
  assignedDoctorId  String?

  room              Room           @relation(fields: [roomId], references: [id])
  assignedDoctor    DoctorProfile? @relation(fields: [assignedDoctorId], references: [id])
  equipments        Equipment[]
  appointments      Appointment[]

  @@map("operatory_chairs")
}

// ====================================================
// 3. NHÓM DỊCH VỤ & BẢNG GIÁ (3 BẢNG)
// ====================================================

model ServiceCategory {
  id          String    @id @default(uuid())
  name        String    // Cấy ghép Implant, Răng sứ thẩm mỹ, Chỉnh nha
  slug        String    @unique
  description String?

  services    Service[]

  @@map("service_categories")
}

model Service {
  id             String          @id @default(uuid())
  categoryId     String
  code           String          @unique // DV-IMP-01
  name           String          // Cấy ghép 1 trụ Implant Straumann SLA
  standardPrice  Decimal         @db.Decimal(12, 2)
  durationMinutes Int            @default(60) // Thời gian thực hiện (phút)
  description    String?         @db.Text

  category       ServiceCategory @relation(fields: [categoryId], references: [id])
  branchServices BranchService[]
  appointmentServices AppointmentService[]
  invoiceItems   InvoiceItem[]

  @@map("services")
}

model BranchService {
  id          String   @id @default(uuid())
  branchId    String
  serviceId   String
  customPrice Decimal? @db.Decimal(12, 2)
  isAvailable Boolean  @default(true)

  branch      Branch   @relation(fields: [branchId], references: [id])
  service     Service  @relation(fields: [serviceId], references: [id])

  @@unique([branchId, serviceId])
  @@map("branch_services")
}

// ====================================================
// 4. BỆNH NHÂN & LỊCH HẸN KHÁM (4 BẢNG)
// ====================================================

model Patient {
  id             String          @id @default(uuid())
  patientCode    String          @unique // BN-104
  fullName       String
  phone          String          @unique
  email          String?
  birthYear      Int
  gender         String          // Nam / Nu
  medicalAlerts  String?         @db.Text // Tiền sử cao huyết áp, dị ứng Lidocaine
  createdAt      DateTime        @default(now())

  appointments   Appointment[]
  treatmentPlans TreatmentPlan[]
  medicalRecords MedicalRecord[]
  dentalCharts   DentalChart[]
  invoices       Invoice[]
  reviews        ServiceReview[]

  @@map("patients")
}

model Appointment {
  id              String   @id @default(uuid())
  appointmentCode String   @unique // #LH-2026-8821
  patientId       String
  branchId        String
  doctorId        String
  chairId         String
  startTime       DateTime
  endTime         DateTime
  bufferEndTime   DateTime // endTime + 15m đệm khử trùng vô trùng
  status          String   @default("PENDING") // PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED
  qrPassCode      String   @unique // Token QR quét check-in Kiosk
  notes           String?  @db.Text
  isAiRecommended Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  patient         Patient          @relation(fields: [patientId], references: [id])
  branch          Branch           @relation(fields: [branchId], references: [id])
  doctor          User             @relation("DoctorAppointments", fields: [doctorId], references: [id])
  chair           OperatoryChair   @relation(fields: [chairId], references: [id])
  services        AppointmentService[]
  statusHistory   AppointmentStatusHistory[]
  treatmentPlan   TreatmentPlan?
  invoices        Invoice[]
  reviews         ServiceReview[]

  @@index([branchId, startTime, endTime])
  @@index([doctorId, startTime, endTime])
  @@index([chairId, startTime, endTime])
  @@map("appointments")
}

model AppointmentService {
  id            String      @id @default(uuid())
  appointmentId String
  serviceId     String
  price         Decimal     @db.Decimal(12, 2)

  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  service       Service     @relation(fields: [serviceId], references: [id])

  @@unique([appointmentId, serviceId])
  @@map("appointment_services")
}

model AppointmentStatusHistory {
  id            String      @id @default(uuid())
  appointmentId String
  fromStatus    String
  toStatus      String
  changedBy     String?
  reason        String?
  createdAt     DateTime    @default(now())

  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  @@map("appointment_status_history")
}

// ====================================================
// 5. BỆNH ÁN ĐIỆN TỬ (EMR) & PHÁC ĐỒ AI (6 BẢNG)
// ====================================================

model TreatmentPlan {
  id             String          @id @default(uuid())
  patientId      String
  appointmentId  String?         @unique
  planCode       String          @unique // #PD-2026-001
  planName       String          // Phác đồ Cấy 2 trụ Implant Straumann SLA
  aiDiagnosis    String?         @db.Text
  estimatedCost  Decimal         @db.Decimal(12, 2)
  isAiGenerated  Boolean         @default(true)
  isApproved     Boolean         @default(false)
  createdAt      DateTime        @default(now())

  patient        Patient         @relation(fields: [patientId], references: [id])
  appointment    Appointment?    @relation(fields: [appointmentId], references: [id])
  steps          TreatmentStep[]

  @@map("treatment_plans")
}

model TreatmentStep {
  id             String          @id @default(uuid())
  planId         String
  stepOrder      Int             @default(1)
  stepName       String          // Khám & Chụp CT, Cấy trụ Implant, Lắp răng sứ
  status         String          @default("PLANNED") // PLANNED, IN_PROGRESS, DONE
  targetDate     DateTime?

  plan           TreatmentPlan   @relation(fields: [planId], references: [id], onDelete: Cascade)
  medicalRecords MedicalRecord[]

  @@map("treatment_steps")
}

model MedicalRecord {
  id             String          @id @default(uuid())
  patientId      String
  stepId         String?
  diagnosis      String          @db.Text
  treatmentGiven String          @db.Text
  xrayImageUrls  String[]        // Lưu URL ảnh phim CT Cone Beam/X-Quang
  performedAt    DateTime        @default(now())

  patient        Patient         @relation(fields: [patientId], references: [id])
  step           TreatmentStep?  @relation(fields: [stepId], references: [id])
  prescriptions  Prescription[]

  @@map("medical_records")
}

model DentalChart {
  id             String   @id @default(uuid())
  patientId      String
  toothNumber    Int      // 11 - 48 (Quy chuẩn nha khoa FDI)
  condition      String   // SÂU RĂNG, MẤT RĂNG, IMPLANT, BỌC SỨ
  colorStatus    String?  // Mã màu hiển thị sơ đồ răng
  updatedAt      DateTime @updatedAt

  patient        Patient  @relation(fields: [patientId], references: [id])

  @@unique([patientId, toothNumber])
  @@map("dental_charts")
}

model Prescription {
  id              String             @id @default(uuid())
  medicalRecordId String
  code            String             @unique // #DT-2026-1102
  doctorNotes     String?
  createdAt       DateTime           @default(now())

  medicalRecord   MedicalRecord      @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)
  items           PrescriptionItem[]

  @@map("prescriptions")
}

model PrescriptionItem {
  id             String       @id @default(uuid())
  prescriptionId String
  medicineName   String       // Amoxicillin 500mg, Efferalgan Codeine
  dosage         String       // 1 viên / lần
  frequency      String       // 2 lần / ngày (Sau ăn)
  quantity       Int          @default(10)

  prescription   Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)

  @@map("prescription_items")
}

// ====================================================
// 6. TÀI CHÍNH, HÓA ĐƠN & ĐÁNH GIÁ (4 BẢNG)
// ====================================================

model Invoice {
  id            String        @id @default(uuid())
  invoiceCode   String        @unique // #HD-2026-5541
  branchId      String
  patientId     String
  appointmentId String?
  totalAmount   Decimal       @db.Decimal(12, 2)
  discountAmount Decimal      @default(0) @db.Decimal(12, 2)
  finalAmount   Decimal       @db.Decimal(12, 2)
  status        String        @default("UNPAID") // UNPAID, PARTIAL, PAID
  createdAt     DateTime      @default(now())

  branch        Branch        @relation(fields: [branchId], references: [id])
  patient       Patient       @relation(fields: [patientId], references: [id])
  appointment   Appointment?  @relation(fields: [appointmentId], references: [id])
  items         InvoiceItem[]
  payments      Payment[]

  @@map("invoices")
}

model InvoiceItem {
  id          String   @id @default(uuid())
  invoiceId   String
  serviceId   String
  unitPrice   Decimal  @db.Decimal(12, 2)
  quantity    Int      @default(1)
  subTotal    Decimal  @db.Decimal(12, 2)

  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  service     Service  @relation(fields: [serviceId], references: [id])

  @@map("invoice_items")
}

model Payment {
  id            String   @id @default(uuid())
  receiptCode   String   @unique // #PT-2026-8956
  invoiceId     String
  amountPaid    Decimal  @db.Decimal(12, 2)
  paymentMethod String   // VIETQR, POS, CASH
  transactionRef String? @unique // Mã tham chiếu ngân hàng/VietQR
  isMatched     Boolean  @default(true)
  paidAt        DateTime @default(now())

  invoice       Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@map("payments")
}

model ServiceReview {
  id            String      @id @default(uuid())
  patientId     String
  appointmentId String
  ratingScore   Int         @default(5) // 1 - 5 sao
  doctorRating  Int         @default(5)
  facilityRating Int        @default(5)
  comment       String?     @db.Text
  feedbackTags  String[]    // 'Bác sĩ êm ái', 'Vô trùng sạch'
  isPublic      Boolean     @default(true)
  createdAt     DateTime    @default(now())

  patient       Patient     @relation(fields: [patientId], references: [id])
  appointment   Appointment @relation(fields: [appointmentId], references: [id])

  @@map("service_reviews")
}

// ====================================================
// 7. THIẾT BỊ, KHO VẬT TƯ & NHẬT KÝ AUDIT (4 BẢNG)
// ====================================================

model Equipment {
  id               String   @id @default(uuid())
  branchId         String
  chairId          String?
  code             String   @unique // TB-01, TB-04
  name             String   // Ghế Sirona Intego, Máy CT Cone Beam Vatech
  serialNumber     String   @unique
  status           String   @default("OPERATIONAL") // OPERATIONAL, UNDER_MAINTENANCE
  nextInspectionAt DateTime?

  branch           Branch          @relation(fields: [branchId], references: [id])
  chair            OperatoryChair? @relation(fields: [chairId], references: [id])
  maintenanceLogs  EquipmentMaintenanceLog[]

  @@map("equipments")
}

model EquipmentMaintenanceLog {
  id           String    @id @default(uuid())
  equipmentId  String
  technicianId String
  logCode      String    @unique // #BT-2026-042
  actionType   String    // BẢO TRÌ ĐỊNH KỲ, KHỬ TRÙNG VI SINH
  findings     String    @db.Text
  isCertified  Boolean   @default(false)
  completedAt  DateTime?
  createdAt    DateTime  @default(now())

  equipment    Equipment @relation(fields: [equipmentId], references: [id])
  technician   User      @relation(fields: [technicianId], references: [id])

  @@map("equipment_maintenance_logs")
}

model ConsumableMaterial {
  id           String   @id @default(uuid())
  code         String   @unique // VT-STRAU-01
  name         String   // Trụ Implant Straumann SLA, Bột xương nhân tạo
  unit         String   // Cái, Hộp, Lọ
  stockQty     Int      @default(0)
  minStockQty  Int      @default(5) // Cảnh báo tồn tối thiểu
  unitCost     Decimal  @db.Decimal(12, 2)
  updatedAt    DateTime @updatedAt

  @@map("consumable_materials")
}

model AuditLog {
  id           String   @id @default(uuid())
  userId       String?
  module       String   // APPOINTMENTS, EMR, FINANCE, RBAC_SECURITY
  action       String   // CREATE_APPOINTMENT, UPDATE_EMR, REVERSE_INVOICE
  details      String   @db.Text
  targetEntity String?  // BN-104, GHE-01
  ipAddress    String
  userAgent    String
  createdAt    DateTime @default(now())

  user         User?    @relation(fields: [userId], references: [id])

  @@index([module, createdAt])
  @@map("audit_logs")
}

3. Ràng Buộc Khóa Ngoại & Tính Toàn Vẹn ACID Cốt Lõi
Khóa lịch đa chiều (Concurrency Locking):

Trong một khoảng [startTime, bufferEndTime], một ghế (chairId) hoặc một bác sĩ (doctorId) không thể tồn tại 2 bản ghi Appointment có trạng thái khác CANCELLED.

Thời gian nghỉ vô trùng được đảm bảo: bufferEndTime = endTime + INTERVAL '15 minutes'.

Liên kết bảo trì & Khóa ghế tự động:

Khi tạo bản ghi EquipmentMaintenanceLog với thiết bị gắn tại chairId, OperatoryChair.status tự động chuyển thành MAINTENANCE. Mọi yêu cầu tạo lịch mới tại ghế này sẽ bị chặn ngay từ lớp Service.

Audit Trail tự động (Interceptor):

Các hành vi can thiệp vào các bảng nhạy cảm (invoices, payments, medical_records, role_permissions) đều được AuditLogInterceptor ghi nhận kèm IP, UserAgent và snapshot dữ liệu cũ/mới vào bảng audit_logs.

4. Quy Trình Kiểm Soát Xung Đột Lịch & Đệm Vô Trùng (Concurrency Control)
- Quy tắc đặt lịch cốt lõi được bảo đảm trong AppointmentsService thông qua cơ chế Transaction của PostgreSQL:
+ Khóa bản ghi (Pessimistic / Isolation): Khi người bệnh bấm xác nhận lịch trên Web, NestJS mở một $transaction.
+ Kiểm tra 3 điều kiện ràng buộc đồng thời:
++ Bác sĩ không có lịch khám giao thoa: [startTime, endTime].
++ Ghế khám/Phòng mổ không bị trùng và không ở trạng thái MAINTENANCE:$$\text{NewAppointment.startTime} < \text{Existing.bufferEndTime} \quad \text{AND} \quad \text{NewAppointment.bufferEndTime} > \text{Existing.startTime}$$
++ Thời gian đệm vô trùng (bufferEndTime) luôn tự động cộng thêm đúng 15 phút sau khi kết thúc phẫu thuật/điều trị để điều dưỡng khử khuẩn.
+ Cơ chế Event: Sau khi lưu thành công, hệ thống gửi Event kích hoạt Webhook gửi mã QR Pass qua Zalo ZNS và đồng bộ sang AI Service.

5. Đặc Tả Các Endpoint API Trọng Yếu (Core Endpoints):
Phân hệ | Phương thức | Endpoint | Chức năng / Mô tả
Auth | POST,/api/v1/auth/login,"Đăng nhập hệ thống, cấp Access & Refresh JWT"
,POST,/api/v1/auth/2fa/verify,Xác thực mã OTP 2 lớp
Appointments,POST,/api/v1/appointments/book,Đặt lịch khám thông minh (Bệnh nhân/Lễ tân)
,GET,/api/v1/appointments/available-slots,Trả về các slot khả dụng kèm điểm tối ưu AI
,POST,/api/v1/appointments/check-in-qr,Quét mã QR tại Kiosk tự động check-in
Operatories,GET,/api/v1/operatories/branch/:branchId,Lấy sơ đồ trạng thái ghế khám theo tầng
,PATCH,/api/v1/operatories/:id/status,Đổi trạng thái ghế (Tạm ngưng bảo trì / Khử trùng)
Equipment,POST,/api/v1/equipment/:id/maintenance,Lên lịch bảo trì máy móc (Tự động khóa ghế liên đới)
,GET,/api/v1/equipment/maintenance-history,Danh sách biên bản bảo dưỡng & kiểm định đạt chuẩn
Treatments,POST,/api/v1/treatments/ai-intake,Nhận triệu chứng NLP từ Python AI để tạo phác đồ
Finance,POST,/api/v1/finance/webhook/vietqr,Webhook tự động khớp phiếu thu khi quét mã VietQR
Audit Logs,GET,/api/v1/audit-logs,"Lọc nhật ký hệ thống theo 4 phân hệ (EMR, Lịch hẹn...)"