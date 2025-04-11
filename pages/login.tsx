import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, LogIn, Lock, User } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Hata',
        description: 'Kullanıcı adı ve şifre gereklidir.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/login', { username, password });
      
      if (response.data.success) {
        toast({
          title: 'Başarılı',
          description: 'Giriş başarılı. Yönlendiriliyorsunuz...',
        });
        
        // Redirect to dashboard or home page
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: 'Giriş Başarısız',
        description: error.response?.data?.error || 'Giriş yapılırken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>RobotPOS - Giriş</title>
        <meta name="description" content="RobotPOS Client yönetim paneli giriş sayfası" />
      </Head>
      
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/login-background.jpg" 
            alt="Login Background" 
            fill 
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
        
        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">RobotPOS</h1>
            <p className="text-gray-300">RealTime Client Yönetim Paneli</p>
          </div>
          
          <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-md">
            <CardHeader className="space-y-1 pb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-2">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
              <CardDescription className="text-center">
                Devam etmek için hesabınıza giriş yapın
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Kullanıcı Adı
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Kullanıcı adınızı girin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Şifre
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Şifrenizi girin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 pt-0">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Giriş Yap
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} RobotPOS. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
