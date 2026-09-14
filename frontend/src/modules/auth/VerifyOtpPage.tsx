import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { authApi } from '../../services/api';

export const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleResend = async () => {
    if (!email) {
      navigate('/auth/forgot-password');
      return;
    }
    try {
      setIsResending(true);
      setErrorMessage(null);
      setResendStatus(null);
      const res = await authApi.forgotPassword(email);
      setResendStatus(res.message || 'Mã OTP mới đã được gửi lại vào email của bạn');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi lại mã OTP';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join('').trim();
    if (otpStr.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }
    if (!email) {
      navigate('/auth/forgot-password');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await authApi.verifyOtp(email, otpStr);
      navigate('/auth/reset-password', {
        state: { email, otp: otpStr },
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mã OTP không chính xác hoặc đã hết hạn';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Xác Thực Mã OTP"
      description={`Mã OTP 6 chữ số đã được gửi qua Gmail đến ${email || 'hộp thư của bạn'}`}
    >
      {/* Alert Messages */}
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {resendStatus && (
        <div className="mb-4 p-3 bg-teal-500/20 border border-teal-400/40 rounded-xl text-xs text-teal-200 font-semibold">
          {resendStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="
                w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-extrabold
                bg-white/10 border border-white/25 rounded-2xl
                text-teal-300
                focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-white/15
                transition-all duration-200
              "
              style={{ width: '2.75rem', height: '3.25rem' }}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center text-xs text-white/50">
          Không nhận được mã?{' '}
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="text-teal-300 hover:text-teal-200 font-bold underline underline-offset-2 inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
            <span>{isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}</span>
          </button>
        </div>

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
          {isSubmitting ? <span>Đang xác thực...</span> : (
            <>
              <span>Xác Nhận OTP</span>
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
