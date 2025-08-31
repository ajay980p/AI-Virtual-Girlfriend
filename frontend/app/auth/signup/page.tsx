"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

function AuthContent() {
  return <AuthForm mode="signup" />;
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}