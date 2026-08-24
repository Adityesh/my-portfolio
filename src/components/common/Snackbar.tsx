import React, { createContext, useContext, useState, useRef, useCallback, ReactNode, CSSProperties } from 'react';

interface SnackbarOptions {
  position?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
  style?: CSSProperties;
  closeStyle?: CSSProperties;
}

interface SnackbarContextType {
  openSnackbar: (message: string, duration?: number | [number], options?: SnackbarOptions) => void;
  closeSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [customStyle, setCustomStyle] = useState<CSSProperties>({});
  const [customCloseStyle, setCustomCloseStyle] = useState<CSSProperties>({});
  const [position, setPosition] = useState<string>('bottom-center');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeSnackbar = useCallback(() => {
    setIsOpen(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openSnackbar = useCallback((msg: string, duration?: number | [number], options?: SnackbarOptions) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setMessage(msg);
    if (options?.style) setCustomStyle(options.style);
    if (options?.closeStyle) setCustomCloseStyle(options.closeStyle);
    if (options?.position) setPosition(options.position);
    setIsOpen(true);

    const dur = Array.isArray(duration) ? duration[0] : (duration ?? 4000);
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, dur);
  }, []);

  const getPositionStyles = (): CSSProperties => {
    const base: CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      left: 0,
      right: 0,
      pointerEvents: 'none',
    };

    if (position.startsWith('top')) {
      base.top = '20px';
    } else {
      base.bottom = '20px';
    }

    return base;
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
      {children}
      {isOpen && (
        <div style={getPositionStyles()}>
          <div
            style={{
              pointerEvents: 'auto',
              minWidth: '280px',
              maxWidth: '600px',
              padding: '12px 20px',
              borderRadius: '6px',
              backgroundColor: '#333',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              fontFamily: 'sans-serif',
              fontSize: '15px',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
              ...customStyle,
            }}
          >
            <span>{message}</span>
            <button
              onClick={closeSnackbar}
              style={{
                marginLeft: '16px',
                background: 'transparent',
                border: 'none',
                color: 'currentColor',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '0 4px',
                ...customCloseStyle,
              }}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (defaultOptions?: SnackbarOptions) => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }

  const open = useCallback(
    (msg: string, duration?: number | [number]) => {
      context.openSnackbar(msg, duration, defaultOptions);
    },
    [context, defaultOptions]
  );

  return [open, context.closeSnackbar] as const;
};

export default SnackbarProvider;
