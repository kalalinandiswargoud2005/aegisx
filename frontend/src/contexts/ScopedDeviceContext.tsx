import React, { createContext, useContext, useState, useEffect } from 'react';

interface ScopedDeviceContextType {
  scopedDeviceId: string | null;
  isScoped: boolean;
}

const ScopedDeviceContext = createContext<ScopedDeviceContextType>({
  scopedDeviceId: null,
  isScoped: false,
});

export const useScopedDevice = () => useContext(ScopedDeviceContext);

export const ScopedDeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scopedDeviceId, setScopedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Standalone features disabled
    sessionStorage.removeItem('astra_scoped_device');
  }, []);

  return (
    <ScopedDeviceContext.Provider value={{ scopedDeviceId, isScoped: !!scopedDeviceId }}>
      {children}
    </ScopedDeviceContext.Provider>
  );
};
