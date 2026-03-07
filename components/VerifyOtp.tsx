import React, { useState, useRef, useEffect } from 'react';
import { verifyOtp, resendOtp } from '../services/apiService';
import { CheckCircle, XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerifyOtpProps {
    email: string;
    onSuccess: (token: string, user: any) => void;
    onBack: () => void;
}

const VerifyOtp: React.FC<VerifyOtpProps> = ({ email, onSuccess, onBack }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await verifyOtp(email, otpCode);
            setSuccess(true);
            setTimeout(() => {
                onSuccess(response.data.token, response.data.user);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResending(true);
        setError(null);
        try {
            await resendOtp(email);
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[40px] shadow-2xl text-center border border-gray-100"
        >
            <button
                onClick={onBack}
                className="absolute top-8 left-8 p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="bg-orange-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <img src="/Hoopref.png" alt="HoopRef" className="w-12 h-12" />
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2 italic uppercase">Verify OTP</h1>
            <p className="text-gray-500 mb-8 font-medium">
                We've sent a 6-digit code to <br />
                <span className="text-gray-900 font-bold">{email}</span>
            </p>

            <div className="flex justify-between gap-2 mb-8">
                {otp.map((digit, idx) => (
                    <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-16 text-center text-2xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-600 focus:bg-white outline-none transition-all"
                    />
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs font-bold text-left">{error}</p>
                </div>
            )}

            {success ? (
                <div className="mb-6 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3 text-green-600 animate-in zoom-in-95">
                    <CheckCircle className="w-6 h-6" />
                    <p className="font-bold">Verification Successful!</p>
                </div>
            ) : (
                <button
                    onClick={handleVerify}
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        'Verify & Continue'
                    )}
                </button>
            )}

            <div className="mt-8">
                <p className="text-sm text-gray-500 font-medium mb-3">Didn't receive the code?</p>
                <button
                    onClick={handleResend}
                    disabled={timer > 0 || resending}
                    className={`flex items-center justify-center gap-2 mx-auto font-black uppercase tracking-widest text-xs transition-all ${timer > 0 ? 'text-gray-300' : 'text-orange-600 hover:text-black'}`}
                >
                    {resending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" />
                            {timer > 0 ? `Resend Code (${timer}s)` : 'Resend Code'}
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default VerifyOtp;
