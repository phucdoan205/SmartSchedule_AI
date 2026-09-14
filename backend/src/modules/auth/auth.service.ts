import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import bcrypt from 'bcryptjs';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: Transporter;
  private otpStore = new Map<string, { otp: string; expiresAt: number; fullName?: string }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    const user = process.env.EMAIL_USER || 'phucvandoan123@gmail.com';
    const pass = (process.env.EMAIL_PASS || 'yhzy ifbn tuyb sapy').replace(/\s+/g, '');

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  private maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const visibleChars = Math.min(3, Math.floor(name.length / 2));
    return `${name.slice(0, visibleChars)}***@${domain}`;
  }

  async register(data: { fullName: string; phone: string; email?: string; password: string }) {
    const { fullName, phone, email, password } = data;
    const cleanPhone = (phone || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!fullName || !cleanPhone || !password) {
      throw new BadRequestException('Vui lòng điền đầy đủ họ tên, số điện thoại và mật khẩu');
    }

    if (password.length < 6) {
      throw new BadRequestException('Mật khẩu phải có tối thiểu 6 ký tự');
    }

    // Check existing User
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Số điện thoại hoặc email này đã được sử dụng');
    }

    // Find or create PATIENT role
    let patientRole = await this.prisma.role.findUnique({ where: { name: 'PATIENT' } });
    if (!patientRole) {
      patientRole = await this.prisma.role.create({
        data: {
          name: 'PATIENT',
          description: 'Khách hàng / Bệnh nhân',
        },
      });
    }

    // Get default branch
    const defaultBranch = await this.prisma.branch.findFirst();
    if (!defaultBranch) {
      throw new BadRequestException('Hệ thống chưa có chi nhánh phòng khám hoạt động');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const patientCode = `BN-${Date.now().toString().slice(-6)}`;
    const finalEmail = cleanEmail || `${cleanPhone}@smartschedule.ai`;

    // Create user in database
    const newUser = await this.prisma.user.create({
      data: {
        employeeCode: patientCode,
        fullName: fullName.trim(),
        email: finalEmail,
        phone: cleanPhone,
        passwordHash,
        branchId: defaultBranch.id,
        isActive: true,
        userRoles: {
          create: {
            roleId: patientRole.id,
          },
        },
      },
    });

    // Also ensure Patient record exists
    const existingPatient = await this.prisma.patient.findUnique({ where: { phone: cleanPhone } });
    if (!existingPatient) {
      await this.prisma.patient.create({
        data: {
          patientCode,
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: cleanEmail || null,
          birthYear: new Date().getFullYear() - 25,
          gender: 'Nam',
        },
      });
    }

    return {
      success: true,
      message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
      data: {
        id: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
      },
    };
  }

  async forgotPassword(identity: string) {
    const trimmed = (identity || '').trim();
    if (!trimmed) {
      throw new BadRequestException('Vui lòng nhập Email hoặc Số điện thoại tài khoản');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed, mode: 'insensitive' } },
          { phone: trimmed },
          { employeeCode: { equals: trimmed, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với thông tin này');
    }

    if (!user.email || user.email.endsWith('@smartschedule.ai')) {
      throw new BadRequestException('Tài khoản chưa liên kết Email hợp lệ để nhận mã OTP khôi phục');
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.otpStore.set(user.email.toLowerCase(), {
      otp,
      expiresAt,
      fullName: user.fullName,
    });

    // Send Real Email via Gmail SMTP
    try {
      await this.transporter.sendMail({
        from: `"SmartSchedule AI - Nha Khoa Việt Anh Đức" <${process.env.EMAIL_USER || 'phucvandoan123@gmail.com'}>`,
        to: user.email,
        subject: `[SmartSchedule AI] Mã OTP khôi phục mật khẩu: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0f766e; margin: 0;">SmartSchedule AI</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Bệnh Viện Răng Hàm Mặt Việt Anh Đức</p>
            </div>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; color: #166534; font-size: 15px;">Xin chào <strong>${user.fullName}</strong>,</p>
              <p style="margin: 0; color: #374151; font-size: 13px;">Bạn vừa yêu cầu lấy lại mật khẩu cho tài khoản tại hệ thống Nha Khoa Việt Anh Đức.</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d9488; margin: 18px 0; padding: 12px; background: #ffffff; border: 2px dashed #0d9488; border-radius: 8px; display: inline-block;">
                ${otp}
              </div>
              <p style="margin: 0; color: #dc2626; font-size: 12px; font-weight: 600;">* Mã OTP có hiệu lực trong vòng 5 phút. Vui lòng tuyệt đối không cung cấp mã này cho người khác.</p>
            </div>
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
              Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email hoặc liên hệ bộ phận hỗ trợ khách hàng.
            </p>
          </div>
        `,
      });
    } catch (err: any) {
      console.error('Lỗi khi gửi email OTP qua Gmail:', err);
      throw new BadRequestException('Không thể gửi mã OTP tới email lúc này. Vui lòng thử lại sau.');
    }

    return {
      success: true,
      message: `Mã OTP đã được gửi đến email ${this.maskEmail(user.email)}`,
      email: user.email,
    };
  }

  async verifyOtp(email: string, otp: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    const record = this.otpStore.get(cleanEmail);
    if (!record) {
      throw new BadRequestException('Chưa có mã OTP nào được gửi đến email này');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(cleanEmail);
      throw new BadRequestException('Mã OTP đã hết hiệu lực. Vui lòng yêu cầu mã mới.');
    }

    if (record.otp !== cleanOtp) {
      throw new BadRequestException('Mã OTP không chính xác. Vui lòng kiểm tra lại.');
    }

    return {
      success: true,
      message: 'Xác thực mã OTP thành công',
    };
  }

  async resetPassword(email: string, otp: string, newPasswordPlain: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!newPasswordPlain || newPasswordPlain.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có tối thiểu 6 ký tự');
    }

    // Verify OTP
    await this.verifyOtp(cleanEmail, cleanOtp);

    const passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    await this.prisma.user.update({
      where: { email: cleanEmail },
      data: { passwordHash },
    });

    // Invalidate OTP after used
    this.otpStore.delete(cleanEmail);

    return {
      success: true,
      message: 'Đặt lại mật khẩu mới thành công! Bạn có thể đăng nhập ngay.',
    };
  }

  async login(identity: string, passwordPlain: string) {
    const trimmed = (identity || '').trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed, mode: 'insensitive' } },
          { employeeCode: { equals: trimmed, mode: 'insensitive' } },
          { phone: trimmed },
          ...(trimmed.toLowerCase() === 'admin'
            ? [{ email: 'admin@smartschedule.ai' }, { employeeCode: 'NV-ADMIN' }]
            : []),
        ],
      },
      include: {
        branch: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        doctorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị tạm khóa');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.code),
    );

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      branchId: user.branchId,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        employeeCode: user.employeeCode,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        branch: user.branch,
        roles,
        permissions: Array.from(new Set(permissions)),
        doctorProfile: user.doctorProfile,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branch: true,
        doctorProfile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin tài khoản');
    }

    return {
      id: user.id,
      employeeCode: user.employeeCode,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      branch: user.branch,
      roles: user.userRoles.map((ur) => ur.role.name),
      doctorProfile: user.doctorProfile,
    };
  }

  async googleLogin(googleUser: { email: string; name: string; avatarUrl?: string; sub?: string }) {
    if (!googleUser || !googleUser.email) {
      throw new BadRequestException('Thông tin tài khoản Google không hợp lệ');
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();
    let user = await this.prisma.user.findFirst({
      where: { email: cleanEmail },
      include: {
        branch: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        doctorProfile: true,
      },
    });

    if (!user) {
      // Auto register patient from Google
      let patientRole = await this.prisma.role.findUnique({ where: { name: 'PATIENT' } });
      if (!patientRole) {
        patientRole = await this.prisma.role.create({
          data: { name: 'PATIENT', description: 'Khách hàng / Bệnh nhân' },
        });
      }
      const defaultBranch = await this.prisma.branch.findFirst();
      if (!defaultBranch) {
        throw new BadRequestException('Hệ thống chưa có chi nhánh phòng khám hoạt động');
      }

      const randomPass = Math.random().toString(36).slice(-8) + 'Aa1@';
      const passwordHash = await bcrypt.hash(randomPass, 10);
      const code = `GG-${Date.now().toString().slice(-6)}`;
      const phone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;

      user = await this.prisma.user.create({
        data: {
          employeeCode: code,
          fullName: googleUser.name || 'Người dùng Google',
          email: cleanEmail,
          phone,
          avatarUrl: googleUser.avatarUrl,
          passwordHash,
          branchId: defaultBranch.id,
          isActive: true,
          userRoles: {
            create: { roleId: patientRole.id },
          },
        },
        include: {
          branch: true,
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
          doctorProfile: true,
        },
      });

      // Also create patient record
      await this.prisma.patient.create({
        data: {
          patientCode: code,
          fullName: googleUser.name || 'Người dùng Google',
          phone,
          email: cleanEmail,
          birthYear: new Date().getFullYear() - 25,
          gender: 'Nam',
        },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị tạm khóa');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.code),
    );

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      branchId: user.branchId,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        employeeCode: user.employeeCode,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        branch: user.branch,
        roles,
        permissions: Array.from(new Set(permissions)),
        doctorProfile: user.doctorProfile,
      },
    };
  }
}
