'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Crown, Shield, Zap, Users, ChevronRight, Sparkles, Lock, Mail } from 'lucide-react';

const demoAccounts = [
  { 
    id: 'acme-admin', 
    email: 'admin@acme.test', 
    password: 'password', 
    label: 'Acme Corp - Admin',
    company: 'Acme Corporation',
    role: 'Admin'
  },
  { 
    id: 'acme-user', 
    email: 'user@acme.test', 
    password: 'password', 
    label: 'Acme Corp - Member',
    company: 'Acme Corporation',
    role: 'Member'
  },
  { 
    id: 'globex-admin', 
    email: 'admin@globex.test', 
    password: 'password', 
    label: 'Globex Corp - Admin',
    company: 'Globex Corporation',
    role: 'Admin'
  },
  { 
    id: 'globex-user', 
    email: 'user@globex.test', 
    password: 'password', 
    label: 'Globex Corp - Member',
    company: 'Globex Corporation',
    role: 'Member'
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!selectedDemo) return;
    
    const account = demoAccounts.find(acc => acc.id === selectedDemo);
    if (!account) return;

    setEmail(account.email);
    setPassword(account.password);
    
    setIsLoading(true);
    setError('');

    try {
      await login(account.email, account.password);
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="relative min-h-screen flex">
        {/* Left side - Hero content */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NotesApp</h1>
                <p className="text-purple-200 text-sm">Multi-Tenant SaaS Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Organize your ideas,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {" "}amplify your productivity
              </span>
            </h2>
            
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Secure, multi-tenant note management with enterprise-grade features. 
              Perfect for teams that value privacy and collaboration.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/20 border border-green-400/30">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-purple-100">Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-purple-100">Multi-tenant architecture</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-400/30">
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <span className="text-purple-100">Lightning-fast performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-white">NotesApp</h1>
                  <p className="text-purple-200 text-sm">Multi-Tenant SaaS</p>
                </div>
              </div>
            </div>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
                <CardDescription className="text-purple-200">
                  Sign in to your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-400/30 backdrop-blur-sm">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-200">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400/20"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-200">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400/20"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 transition-all duration-200 shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign in</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-slate-900/50 text-purple-200 backdrop-blur-sm rounded-full">
                      or try a demo account
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-purple-200">Demo Accounts</label>
                  <Select value={selectedDemo} onValueChange={setSelectedDemo}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Choose a demo account" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/20">
                      {demoAccounts.map((account) => (
                        <SelectItem 
                          key={account.id} 
                          value={account.id}
                          className="focus:bg-white/10 focus:text-white text-gray-200 cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{account.company}</span>
                              <span className="text-xs text-gray-400">{account.role} • {account.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {account.role === 'Admin' && (
                                <Crown className="h-3 w-3 text-yellow-400" />
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleDemoLogin}
                    disabled={!selectedDemo || isLoading}
                    variant="outline"
                    className="w-full border-2 border-purple-400/30 text-purple-200 hover:bg-purple-500/20 hover:text-white hover:border-purple-300/50 transition-all duration-200 backdrop-blur-sm bg-purple-500/10"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Try Demo Account</span>
                    </div>
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-purple-300">
                    Simple Note Management Project                  
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick features for mobile */}
            <div className="lg:hidden mt-8 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-purple-200">Secure</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-xs text-purple-200">Fast</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-purple-200">Multi-tenant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}