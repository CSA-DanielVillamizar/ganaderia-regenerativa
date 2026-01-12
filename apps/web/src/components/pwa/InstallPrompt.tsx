'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Componente PWA Install Prompt
 * Detecta capacidad de instalación y muestra botón nativo
 *
 * Solo se muestra si:
 * - El navegador soporta PWA
 * - La app NO está instalada
 * - El usuario NO ha rechazado previamente
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Verificar si el usuario rechazó previamente
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    // Detectar cuando se instala
    const handleAppInstalled = () => {
      console.log('✅ PWA instalada exitosamente');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar prompt nativo del navegador
    deferredPrompt.prompt();

    // Esperar respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó instalación');
    } else {
      console.log('❌ Usuario rechazó instalación');
    }

    // Limpiar estado
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  // No mostrar si ya está instalada o no hay prompt disponible
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-5">
      <div className="max-w-md mx-auto bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-2xl p-6">
        {/* Botón Cerrar */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenido */}
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🐄</span>
          </div>

          {/* Texto */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Instala Ganadería Voisin</h3>
            <p className="text-sm text-white/90 mb-4">
              Accede más rápido desde tu pantalla de inicio. Funciona offline y en el campo sin
              señal.
            </p>

            {/* Botón Instalar */}
            <button
              onClick={handleInstallClick}
              className="w-full bg-white text-green-700 py-3 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Instalar Ahora
            </button>

            {/* Link "No ahora" */}
            <button
              onClick={handleDismiss}
              className="w-full mt-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              No ahora
            </button>
          </div>
        </div>

        {/* Características */}
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-xs text-white/90">
          <div className="text-center">
            <div className="text-lg mb-1">📱</div>
            <div>App Nativa</div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">🔌</div>
            <div>Sin Internet</div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">⚡</div>
            <div>Más Rápida</div>
          </div>
        </div>
      </div>
    </div>
  );
}
