import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Mail, AlertCircle, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

function extractToken(message: string): string | null {
  // Backend demo currently returns: "Token: {token}"
  const match = message.match(/Token:\s*(.+)$/i);
  return match?.[1]?.trim() ? match[1].trim() : null;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const token = useMemo(() => (serverMessage ? extractToken(serverMessage) : null), [serverMessage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setServerMessage(null);

    try {
      if (!email) {
        setError('Vui lòng nhập email');
        return;
      }
      const res = await authApi.forgotPassword(email);
      setServerMessage(res.message || 'Nếu email tồn tại, link reset mật khẩu đã được gửi.');
      toast.success('Yêu cầu đặt lại mật khẩu đã được gửi');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/logo-storynest.png"
              alt="StoryNest Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-serif font-bold text-2xl text-foreground">StoryNest</h1>
              <p className="text-sm text-muted-foreground">Analysis System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Quên mật khẩu</h2>
            <p className="text-muted-foreground">
              Nhập email để nhận hướng dẫn đặt lại mật khẩu (demo: server có thể trả về token).
            </p>
          </div>

          <Card variant="glass" className="p-6">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      className="pl-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="xl"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Gửi yêu cầu
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {serverMessage && (
                <div className="mt-6 space-y-3">
                  <div className="text-sm text-muted-foreground">{serverMessage}</div>

                  {token && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        Reset token (demo)
                      </label>
                      <div className="flex gap-2">
                        <Input value={token} readOnly />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            await navigator.clipboard.writeText(token);
                            toast.success('Đã copy token');
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/reset-password?token=${encodeURIComponent(token)}`)}
                      >
                        Đi tới đặt lại mật khẩu
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Quay lại{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  đăng nhập
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 text-center max-w-lg"
        >
          <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center animate-pulse-glow">
            <img
              src="/logo-storynest.png"
              alt="StoryNest Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
            Lấy lại truy cập<br />nhanh chóng & an toàn
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Chúng tôi sẽ giúp bạn đặt lại mật khẩu. Token reset chỉ có hiệu lực trong thời gian giới hạn.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

