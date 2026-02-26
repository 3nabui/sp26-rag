import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User as UserIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const getRoleRoute = (role: string): string => {
    const roleMap: Record<string, string> = {
      Admin: '/admin/dashboard',
      Staff: '/staff/review',
      Author: '/author/dashboard',
    };
    return roleMap[role] || '/author/dashboard';
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!fullName || !email || !password || !confirmPassword) {
        setError('Vui lòng nhập đầy đủ thông tin');
        return;
      }

      if (!acceptPolicy) {
        setError('Bạn cần đồng ý với chính sách bảo mật trước khi đăng ký.');
        return;
      }

      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }

      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }

      await register(fullName, email, password);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const route = getRoleRoute(user.role);
        toast.success('Đăng ký thành công!');
        navigate(route);
      } else {
        navigate('/author/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
              Create New Account
            </h2>
            <p className="text-muted-foreground">
              Sign up to start analyzing your manuscript with AI
            </p>
          </div>

          {/* Register Form */}
          <Card variant="glass" className="p-6">
            <CardContent className="p-0">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* Full name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="e.g., John Doe"
                      className="pl-11"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      className="pl-11 pr-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      className="pl-11 pr-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              {/* Privacy Policy Consent */}
              <div className="flex items-start gap-2 text-sm">
                <input
                  id="accept_policy"
                  type="checkbox"
                  className="mt-1"
                  checked={acceptPolicy}
                  onChange={(e) => setAcceptPolicy(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="accept_policy" className="text-foreground">
                  Tôi đồng ý với{' '}
                  <span className="font-medium text-primary">
                    Chính sách bảo mật
                  </span>
                  {' '}và{' '}
                  <span className="font-medium text-primary">
                    Điều khoản sử dụng
                  </span>
                  {' '}của StoryNest.
                </label>
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
                      Sign Up
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Already have account */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
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
          {/* Decorative logo */}
          <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center animate-pulse-glow">
            <img 
              src="/logo-storynest.png" 
              alt="StoryNest Logo" 
              className="w-full h-full object-contain"
            />
          </div>

          <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
            Start Your Journey<br />Analyzing Stories with AI
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Create a free account to discover how AI helps you understand pacing,
            emotions, and characters in your work more deeply.
          </p>

          {/* Quote */}
          <div className="glass rounded-xl p-6 text-left">
            <p className="text-foreground italic mb-3">
              "Signing up takes just seconds, but the insights from AI can change the entire way I write stories."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">SA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sarah Anderson</p>
                <p className="text-xs text-muted-foreground">Emerging Author</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

