"use client";

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AuthToast() {
  const searchParams = useSearchParams();
  const shownRef = useRef(false);

  useEffect(() => {
    const authSuccess = searchParams.get('auth_success');
    if (authSuccess === 'true' && !shownRef.current) {
      shownRef.current = true;
      setTimeout(() => {
        toast.success("You have successfully logged in");
      }, 500);
      const url = new URL(window.location.href);
      url.searchParams.delete('auth_success');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [searchParams]);

  return null;
}