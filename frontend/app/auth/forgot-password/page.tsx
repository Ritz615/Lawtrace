"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Scale, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";

const schema = z.object({ email: z.string().email("Invalid email address") });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">LexAI</span>
          </Link>
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground mt-1">
            {sent ? "Check your inbox" : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                If <span className="text-foreground font-medium">{getValues("email")}</span> exists,
                a reset link has been sent.
              </p>
              <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2 mt-2">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="fp-email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="you@company.com"
                    {...register("email")}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-input rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                id="forgot-submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading
                  ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
              </button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
