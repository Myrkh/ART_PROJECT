// ═══════════════════════════════════════════════════════════════════════════
// KORE — UserMenu
// Avatar cliquable + dropdown stylé + modale Paramètres
// DA : navy #003D5C / teal #009BA4 / gris neutres
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  Settings, LogOut, ChevronDown, User, Bell, Shield,
  Moon, Globe, Key, X, ToggleLeft, ToggleRight, Info,
  Building2, Mail,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────

function getInitials(fullName) {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

// Couleur d'avatar déterministe selon les initiales
function getAvatarColor(fullName) {
  const colors = [
    { bg: '#009BA4', ring: '#007A82' }, // teal
    { bg: '#0091D5', ring: '#0070A8' }, // blue
    { bg: '#003D5C', ring: '#002A42' }, // navy
    { bg: '#6366F1', ring: '#4F46E5' }, // indigo
    { bg: '#0EA5E9', ring: '#0284C7' }, // sky
  ];
  const idx = (fullName?.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}

// ── Toggle item (pour les futures préférences) ────────────────────────────

function ToggleItem({ label, description, value, onChange, disabled }) {
  return (
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-[#003D5C]">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className="flex-shrink-0"
        title={disabled ? 'Disponible prochainement' : undefined}
      >
        {value
          ? <ToggleRight className="w-7 h-7 text-[#009BA4]" />
          : <ToggleLeft  className="w-7 h-7 text-gray-300" />
        }
      </button>
    </div>
  );
}

// ── Modale Paramètres ─────────────────────────────────────────────────────

function SettingsModal({ profile, user, onClose }) {
  const [tab, setTab] = useState('profil');

  const tabs = [
    { id: 'profil',        label: 'Profil',         icon: User    },
    { id: 'notifications', label: 'Notifications',  icon: Bell    },
    { id: 'securite',      label: 'Sécurité',        icon: Shield  },
    { id: 'interface',     label: 'Interface',       icon: Globe   },
  ];

  // Placeholder preferences (toutes désactivées pour l'instant)
  const [prefs, setPrefs] = useState({
    notifEmail:    false,
    notifSignature: true,
    notifBt:       true,
    darkMode:      false,
    compactView:   false,
    autoSave:      true,
  });
  const setPref = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const initials = getInitials(profile?.full_name);
  const color    = getAvatarColor(profile?.full_name);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header modale */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color.bg }}
            >
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#003D5C] text-base leading-tight">Paramètres</h2>
              <p className="text-xs text-gray-400">Configurez votre espace KORE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar tabs */}
          <nav className="w-44 flex-shrink-0 bg-gray-50/70 border-r border-gray-100 p-2 flex flex-col gap-0.5">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                    ${active
                      ? 'bg-[#003D5C] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-white hover:text-[#003D5C] hover:shadow-sm'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* ── Profil ── */}
            {tab === 'profil' && (
              <div className="space-y-5">
                {/* Avatar + infos */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#003D5C]/5 to-[#009BA4]/5 rounded-xl border border-[#003D5C]/10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md"
                    style={{ backgroundColor: color.bg }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-[#003D5C] text-base">{profile?.full_name || '—'}</p>
                    <p className="text-sm text-gray-500">{user?.email || '—'}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-[#009BA4] bg-[#009BA4]/10 px-2 py-0.5 rounded-full">
                      <Building2 className="w-3 h-3" />
                      Artelia Industrie
                    </span>
                  </div>
                </div>

                {/* Champs (lecture seule pour l'instant) */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                      Nom complet
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <User className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{profile?.full_name || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <Mail className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{user?.email || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>La modification du profil sera disponible prochainement.</span>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {tab === 'notifications' && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Notifications in-app
                </p>
                <div className="divide-y divide-gray-100">
                  <ToggleItem
                    label="Signature en attente"
                    description="Recevoir une notification quand un document attend votre signature"
                    value={prefs.notifSignature}
                    onChange={v => setPref('notifSignature', v)}
                  />
                  <ToggleItem
                    label="Transmission BT"
                    description="Notification à l'émission d'un Bordereau de Transmission"
                    value={prefs.notifBt}
                    onChange={v => setPref('notifBt', v)}
                  />
                </div>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-5">
                  Notifications email
                </p>
                <div className="divide-y divide-gray-100">
                  <ToggleItem
                    label="Résumé par email"
                    description="Recevoir un récapitulatif quotidien des événements du projet"
                    value={prefs.notifEmail}
                    onChange={v => setPref('notifEmail', v)}
                    disabled
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 mt-4">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>Les préférences de notification seront persistées en base prochainement.</span>
                </div>
              </div>
            )}

            {/* ── Sécurité ── */}
            {tab === 'securite' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#003D5C]/5 border border-[#003D5C]/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-3.5 h-3.5 text-[#009BA4]" />
                    <p className="text-sm font-semibold text-[#003D5C]">Clé de signature</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Votre clé unique d'authentification pour les signatures électroniques KORE.
                  </p>
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs text-gray-400">
                    ••••••••-••••-••••-••••-••••••••••••
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Liée à votre compte — non modifiable
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  <ToggleItem
                    label="Authentification à deux facteurs"
                    description="Renforcer la sécurité de votre compte KORE"
                    value={false}
                    onChange={() => {}}
                    disabled
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>La gestion avancée de la sécurité sera disponible prochainement.</span>
                </div>
              </div>
            )}

            {/* ── Interface ── */}
            {tab === 'interface' && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Apparence
                </p>
                <div className="divide-y divide-gray-100">
                  <ToggleItem
                    label="Mode sombre"
                    description="Thème sombre pour réduire la fatigue visuelle"
                    value={prefs.darkMode}
                    onChange={v => setPref('darkMode', v)}
                    disabled
                  />
                  <ToggleItem
                    label="Vue compacte"
                    description="Réduire la hauteur des lignes dans le Registre"
                    value={prefs.compactView}
                    onChange={v => setPref('compactView', v)}
                    disabled
                  />
                </div>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-5">
                  Comportement
                </p>
                <div className="divide-y divide-gray-100">
                  <ToggleItem
                    label="Sauvegarde automatique"
                    description="Sauvegarder les formulaires en cours automatiquement"
                    value={prefs.autoSave}
                    onChange={v => setPref('autoSave', v)}
                    disabled
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 mt-4">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>Les préférences d'interface seront persistées prochainement.</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL — UserMenu
// ═══════════════════════════════════════════════════════════════════════════

export function UserMenu({ profile, user, onSignOut }) {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef(null);

  const initials = getInitials(profile?.full_name);
  const color    = getAvatarColor(profile?.full_name);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSettings = () => {
    setMenuOpen(false);
    setSettingsOpen(true);
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    onSignOut();
  };

  return (
    <>
      {/* ── Trigger — Avatar + Nom ─────────────────────────────────────── */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 group
            ${menuOpen
              ? 'bg-[#003D5C] shadow-md'
              : 'hover:bg-[#003D5C]/8'
            }`}
        >
          {/* Avatar */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white
              flex-shrink-0 shadow-sm transition-all duration-150 ring-2
              ${menuOpen ? 'ring-white/30' : 'ring-transparent group-hover:ring-[#009BA4]/40'}`}
            style={{ backgroundColor: color.bg }}
          >
            {initials}
          </div>

          {/* Nom */}
          <span className={`text-sm font-medium hidden sm:block transition-colors duration-150
            ${menuOpen ? 'text-white' : 'text-gray-600 group-hover:text-[#003D5C]'}`}>
            {profile?.full_name?.split(' ')[0] || '—'}
          </span>

          {/* Chevron */}
          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-all duration-150
            ${menuOpen
              ? 'text-white/70 rotate-180'
              : 'text-gray-400 group-hover:text-[#003D5C]'
            }`}
          />
        </button>

        {/* ── Dropdown ──────────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden
            animate-[fadeSlideDown_0.15s_ease-out]">

            {/* Carte profil */}
            <div className="px-4 py-3 bg-gradient-to-br from-[#003D5C]/5 to-[#009BA4]/5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: color.bg }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#003D5C] truncate leading-tight">
                    {profile?.full_name || '—'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-1.5">
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                  text-gray-600 hover:bg-[#003D5C]/5 hover:text-[#003D5C] transition-colors group/item"
              >
                <div className="w-6 h-6 rounded-lg bg-gray-100 group-hover/item:bg-[#009BA4]/15
                  flex items-center justify-center transition-colors">
                  <Settings className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#009BA4]" />
                </div>
                Paramètres
              </button>
            </div>

            <div className="px-1.5 pb-1.5">
              <div className="h-px bg-gray-100 mb-1.5" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                  text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors group/item"
              >
                <div className="w-6 h-6 rounded-lg bg-red-50 group-hover/item:bg-red-100
                  flex items-center justify-center transition-colors">
                  <LogOut className="w-3.5 h-3.5 text-red-400 group-hover/item:text-red-500" />
                </div>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modale Paramètres ─────────────────────────────────────────── */}
      {settingsOpen && (
        <SettingsModal
          profile={profile}
          user={user}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}
