
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

const GoogleIcon = (props: any) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.63-4.5 1.63-3.87 0-7.02-3.15-7.02-7.02s3.15-7.02 7.02-7.02c2.2 0 3.68.86 4.5 1.63l2.44-2.44C19.22 1.73 16.3.5 12.48.5 5.8 0 .5 5.3.5 12s5.3 12 11.98 12c3.23 0 5.46-1.1 7.28-2.9-1.9-1.84-3.3-4.34-3.3-7.2z" />
  </svg>
);
const GitHubIcon = (props: any) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>GitHub</title>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
const FacebookIcon = (props: any) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Facebook</title>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const { signUp, signInWithGoogle, signInWithGitHub, signInWithFacebook } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook') => {
    setIsSocialLoading(provider);
    try {
      let socialSignInFunction;
      switch(provider) {
        case 'google': socialSignInFunction = signInWithGoogle; break;
        case 'github': socialSignInFunction = signInWithGitHub; break;
        case 'facebook': socialSignInFunction = signInWithFacebook; break;
      }
      await socialSignInFunction();
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Could not sign up with " + provider,
        variant: "destructive",
      });
    } finally {
      setIsSocialLoading(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Sign Up Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password);
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const anyLoading = isLoading || !!isSocialLoading;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block" aria-label="Back to Home">
            <Logo width={80} height={80} priority />
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">Create your Account</h1>
          <p className="mt-2 text-muted-foreground">Join us to start your AI-powered journey.</p>
        </div>

        <div className="space-y-4">
          <button onClick={() => handleSocialLogin('google')} className="btn-social btn-social-google" disabled={anyLoading}>
            {isSocialLoading === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
            <span>Sign up with Google</span>
          </button>
          <button onClick={() => handleSocialLogin('github')} className="btn-social btn-social-github" disabled={anyLoading}>
            {isSocialLoading === 'github' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GitHubIcon className="h-5 w-5" />}
            <span>Sign up with GitHub</span>
          </button>
           <button onClick={() => handleSocialLogin('facebook')} className="btn-social btn-social-facebook" disabled={anyLoading}>
            {isSocialLoading === 'facebook' ? <Loader2 className="h-5 w-5 animate-spin" /> : <FacebookIcon className="h-5 w-5" />}
            <span>Sign up with Facebook</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR CREATE AN ACCOUNT WITH EMAIL</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={anyLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={anyLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={anyLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={anyLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Create Free Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
