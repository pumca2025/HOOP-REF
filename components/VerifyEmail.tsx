import React, { useEffect, useState } from 'react';
import { verifyEmail } from '../services/apiService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface VerifyEmailProps {
    token: string;
    onComplete: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ token, onComplete }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const performVerification = async () => {
            try {
                const response = await verifyEmail(token);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                // Automatically go back to login after 3 seconds
                setTimeout(() => {
                    onComplete();
                }, 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (token) {
            performVerification();
        }
    }, [token, onComplete]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-orange-600 rounded-[25px] flex items-center justify-center shadow-lg">
                        <img src="/Hoopref.png" alt="HoopRef Logo" className="w-12 h-12 object-contain" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-6 italic">
                    Email Verification
                </h2>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                        </div>
                        <p className="text-gray-500 font-medium">Verifying your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-center">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{message}</p>
                        <p className="text-gray-500">Redirecting you to login...</p>
                        <button
                            onClick={onComplete}
                            className="mt-6 w-full py-4 bg-black text-white rounded-full font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl"
                        >
                            Go to Login Now
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-center">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{message}</p>
                        <button
                            onClick={onComplete}
                            className="mt-6 w-full py-4 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
