import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate register then go to dashboard
    setTimeout(() => {
      navigate('/author/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-glow">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl text-foreground">RAG Story</h1>
              <p className="text-sm text-muted-foreground">Analysis System</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
              Tạo tài khoản mới
            </h2>
            <p className="text-muted-foreground">
              Đăng ký để bắt đầu phân tích bản thảo với AI
            </p>
          </div>

          {/* Register Form */}
          <Card variant="glass" className="p-6">
            <CardContent className="p-0">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Họ và tên</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ví dụ: Nguyễn An"
                      className="pl-11"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      className="pl-11"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ít nhất 8 ký tự"
                      className="pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      className="pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
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
                      Đăng ký
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Already have account */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side - Visual (reuse style from Login) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
        {/* Background decoration */}
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
          {/* Decorative book */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-glow animate-pulse-glow">
            <BookOpen className="w-12 h-12 text-primary-foreground" />
          </div>

          <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
            Bắt đầu hành trình<br />phân tích truyện với AI
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Tạo tài khoản miễn phí để khám phá cách AI giúp bạn hiểu sâu hơn về nhịp độ,
            cảm xúc và nhân vật trong tác phẩm của mình.
          </p>

          {/* Quote */}
          <div className="glass rounded-xl p-6 text-left">
            <p className="text-foreground italic mb-3">
              "Đăng ký chỉ mất vài giây, nhưng những insight từ AI có thể thay đổi cả cách
              tôi viết truyện."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">NA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Nguyễn Anh</p>
                <p className="text-xs text-muted-foreground">Tác giả trẻ</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

