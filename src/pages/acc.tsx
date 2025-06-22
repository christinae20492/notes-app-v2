import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { updateUserProfile, changeUserPassword, UserProfileUpdates } from '@/app/utils/userapi'; // Adjust path
import { successToast, failToast, warnToast } from '@/app/utils/toast';
import Layout from '@/app/components/ui/layout'; // Assuming your layout wraps the page
import loading from '@/app/components/ui/loading';
import router from 'next/router';

export default function UserProfilePage() {
  const { data: session, status } = useSession();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.username || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);

    const updates: UserProfileUpdates = {};
    if (username.trim() !== (session?.user?.username || '')) {
      updates.username = username.trim();
    }
    if (email.trim() !== (session?.user?.email || '')) {
      updates.email = email.trim();
    }

    if (Object.keys(updates).length === 0) {
      successToast("No changes detected.");
      setIsProfileSaving(false);
      return;
    }

    const success = await updateUserProfile(updates, session, status);
    setIsProfileSaving(false);
    if (success) {
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);

    if (newPassword !== confirmNewPassword) {
      failToast("New password and confirmation do not match.");
      setIsPasswordSaving(false);
      return;
    }

    const success = await changeUserPassword({ currentPassword, newPassword }, session, status);
    setIsPasswordSaving(false);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

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


  if (status === "loading") {
    return <div>{loading()}</div>;
  }

  if (status === "unauthenticated") {
    warnToast("Please sign in to access.")
  }

  return (
    <Layout>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl text-center font-bold mb-6">Your Profile</h1>

        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-center">Update Profile Details</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
              <input
                type="text"
                id="username"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isProfileSaving}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isProfileSaving}
              />
            </div>
            <div className='text-center'>
            <button
              type="submit"
              className="button"
              disabled={isProfileSaving}
            >
              {isProfileSaving ? 'Saving...' : 'Save Profile'}
            </button>
            </div>
          </form>
        </section>

        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-center">Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">Current Password:</label>
              <input
                type="password"
                id="currentPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isPasswordSaving}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password:</label>
              <input
                type="password"
                id="newPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isPasswordSaving}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
              <input
                type="password"
                id="confirmNewPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={isPasswordSaving}
              />
            </div>
            <div className='text-center'>
            <button
              type="submit"
              className="button text"
              disabled={isPasswordSaving}
            >
              {isPasswordSaving ? 'Changing...' : 'Change Password'}
            </button>
            </div>
          </form>
        </section>
        <div className='text-center'>
          <button
      onClick={handleSignOut}
      className="button bg-crimsonRed-700 text-lg w-28"
    >
      Sign Out
    </button>
        </div>
      </div>
    </Layout>
  );
}