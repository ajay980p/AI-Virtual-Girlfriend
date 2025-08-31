"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

function AuthContent() {
  return <AuthForm mode="signin" />;
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}