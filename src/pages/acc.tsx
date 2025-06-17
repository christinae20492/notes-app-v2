import SessionProviderWrapper from '@/app/components/session'
import Layout from '@/app/components/ui/layout'
import { failToast, successToast } from '@/app/utils/toast';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react'

export default function acc() {

    const router = useRouter();

    const handleSignOut = async () => {

    try {

      const result = await signOut({ redirect: false});

      if (result) {
        successToast("You have been signed out.");
        router.push("/auth/login");
      }
    } catch (error) {
      failToast(`Error during sign out:, ${error}`);
      failToast("Failed to sign out. Please try again.");
    }
  };

  return (
    <>
    <SessionProviderWrapper>
        <Layout>
            <h1>Your account details</h1>
            <button
      onClick={handleSignOut}
      className="button bg-crimsonRed-700"
    >
      Sign Out
    </button>
        </Layout>
    </SessionProviderWrapper>
    </>
  )
}
