import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import UserGuideModal from './UserGuideModal';

const UserGuideContext = createContext(null);

export function UserGuideProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [pendingSectionId, setPendingSectionId] = useState(null);

  const closeUserGuide = useCallback(() => {
    setOpen(false);
    setPendingSectionId(null);
  }, []);

  const openUserGuide = useCallback((sectionId = null) => {
    setPendingSectionId(sectionId);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openUserGuide, closeUserGuide }),
    [openUserGuide, closeUserGuide],
  );

  return (
    <UserGuideContext.Provider value={value}>
      {children}
      <UserGuideModal open={open} onClose={closeUserGuide} pendingSectionId={pendingSectionId} />
    </UserGuideContext.Provider>
  );
}

export function useUserGuide() {
  const ctx = useContext(UserGuideContext);
  if (ctx == null) {
    throw new Error('useUserGuide must be used within UserGuideProvider');
  }
  return ctx;
}
