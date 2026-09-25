'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

export interface UserProfile {
  name: string;
  title: string;
  id: string;
  jacketId?: string;
  role: UserRole;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  roleSubtitle: string;
  roleBadgeColor: string;
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (selectedRole: UserRole, userIdentifier?: string) => void;
  logout: () => void;
}

const defaultUsers: Record<UserRole, UserProfile> = {
  Supervisor: {
    name: 'Rescuer Command',
    title: 'Chief Rescue Safety Controller',
    id: 'RSC-01',
    role: 'Supervisor',
  },
  Worker: {
    name: 'Underground Worker',
    title: 'Drill Operator (Jacket #SJ-003)',
    id: 'W1026',
    jacketId: 'SJ-003',
    role: 'Worker',
  },
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('Worker');
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultUsers['Worker']);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check stored auth session from localStorage on initial client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mineguard_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isLoggedIn) {
            setIsLoggedIn(true);
            if (parsed.role === 'Supervisor' || parsed.role === 'Worker') {
              setRole(parsed.role);
            }
            if (parsed.currentUser) {
              setCurrentUser(parsed.currentUser);
            }
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      }
    } catch (e) {
      console.error('Error reading auth state:', e);
      setIsLoggedIn(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const roleSubtitle = {
    Supervisor: 'Control Room & Safety Management',
    Worker: 'My Smart Jacket & Personal Vitals',
  }[role];

  const roleBadgeColor = {
    Supervisor: 'bg-[#FEF3C7] text-[#B45309]',
    Worker: 'bg-[#DCFCE7] text-[#15803D]',
  }[role];

  const login = (selectedRole: UserRole, userIdentifier?: string) => {
    setRole(selectedRole);
    let profile: UserProfile;
    if (selectedRole === 'Worker') {
      profile = {
        name: userIdentifier ? `Worker (${userIdentifier})` : defaultUsers['Worker'].name,
        title: 'Underground Field Miner',
        id: userIdentifier || 'W1026',
        jacketId: 'SJ-003',
        role: 'Worker',
      };
    } else {
      profile = {
        name: userIdentifier ? `Rescuer (${userIdentifier})` : defaultUsers['Supervisor'].name,
        title: defaultUsers['Supervisor'].title,
        id: userIdentifier || 'RSC-01',
        role: 'Supervisor',
      };
    }
    setCurrentUser(profile);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'mineguard_auth',
          JSON.stringify({
            isLoggedIn: true,
            role: selectedRole,
            currentUser: profile,
          })
        );
      }
    } catch (e) {
      console.error('Error saving auth to storage:', e);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsLoginModalOpen(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mineguard_auth');
        sessionStorage.removeItem('hasSeenLoginIntro');
      }
    } catch (e) {
      console.error('Error removing auth from storage:', e);
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole: (r: UserRole) => login(r),
        currentUser,
        roleSubtitle,
        roleBadgeColor,
        isLoggedIn,
        isLoadingAuth,
        isLoginModalOpen,
        openLoginModal: () => router.push('/login'),
        closeLoginModal: () => setIsLoginModalOpen(false),
        login,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
