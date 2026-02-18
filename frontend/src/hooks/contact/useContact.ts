// src/hooks/contact/useContact.ts
import { useState } from "react";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  category: string; // "bug" | "request" | "other" を想定（厳密化は今はしない）
  message: string;
};

function pickMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

export function useContact() {
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    subject: "",
    category: "bug",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField(key: keyof ContactFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setValues({
      name: "",
      email: "",
      subject: "",
      category: "bug",
      message: "",
    });
  }

  function validate(v: ContactFormValues): string | null {
    if (!v.name.trim()) return "お名前を入力してください。";
    if (!v.email.trim()) return "メールアドレスを入力してください。";
    if (!v.subject.trim()) return "件名を入力してください。";
    if (!v.category.trim()) return "カテゴリを選択してください。";
    if (!v.message.trim()) return "本文を入力してください。";
    return null;
  }

  function submit(): void {
    if (submitting) return;

    setSuccess(null);
    setError(null);

    const msg = validate(values);
    if (msg) {
      setError(msg);
      return;
    }

    setSubmitting(true);

    fetch("/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        category: values.category,
        message: values.message.trim(),
      }),
    })
      .then((res) => {
        if (res.ok) {
          // JSON返却があっても無くても壊れないように
          return res.text().then(() => null);
        }
        return res.text().then((t) => {
          throw new Error(pickMessage(t));
        });
      })
      .then(() => {
        setSuccess("送信しました。");
        reset();
      })
      .catch((e: any) => {
        setError(e?.message ?? "送信に失敗しました。");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return {
    values,
    setField,
    submitting,
    success,
    error,
    submit,
  };
}
