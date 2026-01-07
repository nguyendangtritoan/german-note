import { useSettings } from '../context/SettingsContext';
import { useBundle } from '../context/BundleContext';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { useAI } from './useAI';

export const useAppLogic = () => {
  const settings = useSettings(); // { targetLanguages, selectedGrammar, visibility }
  const { activeBundleId, setActiveBundleId } = useBundle();

  // 1. Auth Hook
  const {
    user,
    authLoading,
    handleGoogleLogin,
    handleGuestLogin,
    handleLinkGoogleAccount
  } = useAuth();

  // 2. Firestore Data Hook
  const {
    currentSessionWords,
    pastBundles,
    syncSession,
    handleDeleteWord,
    handleUpdateWord,
    handleDeleteWordFromBundle,
    handleDeleteBundle,
    handleSummarize
  } = useFirestore(user, activeBundleId, setActiveBundleId);

  // 3. AI Logic Hook (Needs access to data & sync function)
  const {
    isLoading,
    handleSearch,
    handleRegenerateWord
  } = useAI(user, authLoading, currentSessionWords, syncSession, settings);

  // Return Unified Interface
  return {
    user,
    authLoading,
    currentSessionWords,
    pastBundles,
    isLoading: isLoading || (authLoading && !user), // Simplified loading logic
    handleSearch,
    handleRegenerateWord,
    handleSummarize,
    handleDeleteBundle,
    handleDeleteWord,
    handleUpdateWord,
    handleDeleteWordFromBundle,
    handleLinkGoogleAccount,
    handleGoogleLogin,
    handleGuestLogin
  };
};