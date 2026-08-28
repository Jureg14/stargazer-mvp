'use client';

import React, { useState } from 'react';
import { ObservationWindow } from '@/lib/types/itinerary';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PushRemindersProps {
  bestWindow?: ObservationWindow | null;
  locationName?: string;
}

export function PushReminders({ bestWindow, locationName }: PushRemindersProps) {
  const { language, t } = useLanguage();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [isScheduled, setIsScheduled] = useState(false);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert(t.reminders.notSupported);
      return;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === 'granted' && bestWindow) {
      scheduleNotification(bestWindow);
    }
  };

  const scheduleNotification = (windowObj: ObservationWindow) => {
    if (Notification.permission !== 'granted') return;

    const title = language === 'pt' ? '🌌 Alerta Stargazer Configurado!' : `🌌 Stargazer Alert Set!`;
    const body = language === 'pt'
      ? `Janela principal de observação iniciando às ${windowObj.start} para ${locationName || 'sua localização'} (Qualidade: ${windowObj.avgScore}/100).`
      : `Prime observation window starting at ${windowObj.start} for ${locationName || 'your location'} (Score: ${windowObj.avgScore}/100).`;

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        });
      });
    } else {
      new Notification(title, { body, icon: '/icon-192.png' });
    }

    setIsScheduled(true);
  };

  if (permission === 'denied') return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs sm:text-sm text-slate-300">
      <div className="flex items-center gap-2.5">
        <span className="text-amber-400 text-base">🔔</span>
        <div>
          <p className="font-semibold text-slate-100">{t.reminders.title}</p>
          <p className="text-xs text-slate-400">
            {isScheduled
              ? (language === 'pt' ? `Alerta agendado para a janela principal (${bestWindow?.start || 'Hoje à noite'})` : `Alert scheduled for prime window (${bestWindow?.start || 'Tonight'})`)
              : bestWindow
              ? (language === 'pt' ? `Janela principal encontrada (Qualidade ${bestWindow.avgScore}/100). Ativar alerta?` : `Prime window found (${bestWindow.avgScore}/100 quality). Set notification alert?`)
              : (language === 'pt' ? 'Receba alertas quando a qualidade do céu atingir notas excelentes (>75).' : 'Receive notifications when sky quality reaches prime scores (>75).')}
          </p>
        </div>
      </div>

      <button
        onClick={requestPermission}
        disabled={isScheduled}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
          isScheduled
            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
        }`}
      >
        {isScheduled ? (language === 'pt' ? '✓ Lembrete Ativo' : t.reminders.enabledBtn) : t.reminders.enableBtn}
      </button>
    </div>
  );
}

