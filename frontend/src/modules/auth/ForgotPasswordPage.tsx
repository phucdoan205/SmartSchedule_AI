import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { authApi } from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [identity, setIdentity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      const res = await authApi.forgotPassword(identity);
      navigate('/auth/verify-otp', {
        state: {
          email: res.email || identity,
          message: res.message,
        },
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Khôi Phục Mật Khẩu"
      description="Nhập Email hoặc số điện thoại để nhận mã xác thực OTP qua hộp thư Gmail"
    >
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/80">
            Số điện thoại hoặc Email tài khoản
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="VD: 0912.345.678 hoặc user@gmail.com"
              className="
                w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium
                bg-white/10 border border-white/20 text-white placeholder-white/35
                focus:outline-none focus:border-teal-400/60 focus:bg-white/15
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Info hint */}
        <p className="text-xs text-white/50 leading-relaxed bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
          Mã OTP 6 chữ số sẽ được gửi trực tiếp đến hộp thư Email đã đăng ký của bạn qua hệ thống máy chủ thư Gmail.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full py-3.5 rounded-xl font-extrabold text-sm text-white
            bg-gradient-to-r from-teal-500 to-emerald-500
            hover:from-teal-400 hover:to-emerald-400
            shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30
            transition-all duration-200 active:scale-[0.98]
            flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50
          "
        >
          {isSubmitting ? (
            <span>Đang gửi mã OTP qua Gmail...</span>
          ) : (
            <>
              <span>Gửi Mã OTP Xác Thực</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-1 border-t border-white/10 text-center text-xs">
        <NavLink
          to="/auth/login"
          className="text-white/45 hover:text-white/80 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang Đăng nhập
        </NavLink>
      </div>
    </AuthLayout>
  );
};
