// ═══════════════════════════════════════════════════════════════════════════
// KORE — KoreDoc (Orchestrateur)
// v3.1 Fix : useAuth() interne, props bridgés vers composants existants,
//            Toast aligné, useTransmissions sans projectId (non supporté)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  List,
  BarChart2,
  Send,
  Upload,
  Users,
  FolderOpen,
  Settings,
  RefreshCw,
  LogOut,
} from "lucide-react";

// ── Auth (KORE gère lui-même son auth, App.jsx ne passe pas de props) ─────
import { useAuth } from "../lib/horizonData";
import AuthGate from "../components/AuthGate";

// ── Hooks data ─────────────────────────────────────────────────────────────
import { useProjects } from "../kore/hooks/useProjects";
import { useKoreDocuments } from "../kore/hooks/useKoreDocuments";
import { useTransmissions } from "../kore/hooks/useTransmissions";
import { useKoreNotifications } from "../kore/hooks/useKoreNotifications";
import { can } from "../kore/constants/roles";

// ── Composants ─────────────────────────────────────────────────────────────
import { ProjectsView } from "../kore/components/tabs/ProjectsView";
import { NewDocumentForm } from "../kore/components/tabs/NewDocumentForm";
import { RegisterView } from "../kore/components/tabs/RegisterView/RegisterView";
import { DashboardView } from "../kore/components/tabs/DashboardView/DashboardView";
import { TransmissionView } from "../kore/components/tabs/TransmissionView/TransmissionView";
import { ImportView } from "../kore/components/tabs/ImportView";
import { TeamView } from "../kore/components/tabs/TeamView";
import { NotificationBell } from "../kore/components/common/NotificationBell";
import { UserMenu }         from "../kore/components/common/UserMenu";
import { ProjectSelector } from "../kore/components/tabs/ProjectSelector";
import { Toast } from "../kore/components/common/Toast";

// ── Tabs disponibles par rôle ─────────────────────────────────────────────
const ALL_TABS = [
  { id: "new", label: "Nouveau", icon: FileText, perm: "doc:create" },
  { id: "register", label: "Registre", icon: List, perm: "doc:read" },
  { id: "dashboard", label: "Dashboard", icon: BarChart2, perm: "doc:read" },
  { id: "bt", label: "Transmissions", icon: Send, perm: "bt:read" },
  { id: "import", label: "Import", icon: Upload, perm: "doc:import" },
  { id: "team", label: "Équipe", icon: Users, perm: "team:read" },
];

// ── Composant principal ───────────────────────────────────────────────────
// NOTE : pas de props — useAuth() gère l'auth directement ici
export default function KoreDoc() {
  // ── Auth ─────────────────────────────────────────────────────────────
  const {
    user,
    profile,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
  } = useAuth();

  // ── UI state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("register");
  const [highlightDoc,  setHighlightDoc]  = useState(null);
  const [toast, setToast] = useState(null);


  // ── Notification toast ────────────────────────────────────────────────
  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  // ── Navigation depuis une notification ─────────────────────────────────
  // DOIT être avant les early returns — Rules of Hooks
  const handleNavigateFromNotif = useCallback((docNumber) => {
    setActiveTab('register');
    setHighlightDoc(docNumber);
    setTimeout(() => setHighlightDoc(null), 3000);
  }, []);

  // ── Hooks data ────────────────────────────────────────────────────────
  const {
    projects,
    activeProject,
    members,
    loading: projectsLoading,
    myRole,
    loadProjects,
    selectProject,
    createProject,
    inviteMember,
    updateMemberRole,
    removeMember,
  } = useProjects(user?.id);

  const {
    docs,
    loading: docsLoading,
    reload: reloadDocs,
    insertDoc,
    insertRevision,
    signRevision,
    downloadWithStamp,
    getFileUrl,
  } = useKoreDocuments(user?.id, activeProject?.id);

  // useTransmissions ne filtre que par userId (pas projectId pour l'instant)
  const {
    transmissions,
    loading: btLoading,
    nextBtNumber,
    createTransmission,
  } = useTransmissions(user?.id);

  const { notifications, unreadCount, markAllRead, markOneRead } =
    useKoreNotifications(user?.id);


  // ── Restaurer le projet depuis localStorage ───────────────────────────
  useEffect(() => {
    if (projects.length > 0 && !activeProject) {
      const savedId = localStorage.getItem("kore_active_project");
      const found = savedId ? projects.find((p) => p.id === savedId) : null;
      if (found) selectProject(found);
    }
  }, [projects, activeProject, selectProject]);

  // ── Handlers bridgés vers les composants (API originale) ──────────────

  // NewDocumentForm attend : onSubmit(docData, revData, file)
  const handleCreateDoc = useCallback(
    async (docData, revData, file = null) => {
      const { data, error } = await insertDoc(docData);
      if (error || !data) return { error };
      await insertRevision(data.id, revData, file);
      return { error: null };
    },
    [insertDoc, insertRevision]
  );

  const handleSign = useCallback(
    async ({
      revisionId,
      documentId,
      revision,
      role,
      userId,
      fullName,
      docHash,
    }) => {
      return signRevision({
        revisionId, // On utilise directement les variables extraites de l'objet
        documentId,
        revision,
        role,
        userId,
        fullName,
        docHash,
      });
    },
    [signRevision]
  );

  // RegisterView attend : onDownloadWithStamp(doc, revision)
  const handleDownloadWithStamp = useCallback(
    async (doc, revision) => {
      const { error } = await downloadWithStamp(doc, revision);
      if (error) notify("❌ Erreur téléchargement : " + error.message, "error");
      else notify("✅ Document authentifié téléchargé");
      return { error };
    },
    [downloadWithStamp, notify]
  );

  // ── Auth loading / gate ───────────────────────────────────────────────
  if (authLoading)
    return (
      <div className="min-h-screen bg-[#003D5C] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#009BA4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8BBCC8] text-sm">Chargement...</p>
        </div>
      </div>
    );

  if (!user) return <AuthGate signIn={signIn} signUp={signUp} appName="KORE" />;

  // ── Tabs visibles selon le rôle ───────────────────────────────────────
  const visibleTabs = ALL_TABS.filter((t) => !myRole || can(myRole, t.perm));

  // ── Pas de projet sélectionné → page Mes Projets ─────────────────────
  if (!activeProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header minimal */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#003D5C] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#003D5C] text-lg tracking-wide">
              KORE
            </span>
          </div>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500 hidden sm:inline">
            Gestion Documentaire Projet
          </span>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
              onMarkOneRead={markOneRead}
              onNavigate={handleNavigateFromNotif}
            />
            <UserMenu
              profile={profile}
              user={user}
              onSignOut={signOut}
            />
          </div>
        </header>

        <ProjectsView
          projects={projects}
          loading={projectsLoading}
          onSelectProject={selectProject}
          onCreateProject={async (form) => {
            const { data, error } = await createProject(form);
            if (!error) {
              notify(`Projet "${form.name}" créé`);
              selectProject(data);
            } else {
              notify("Erreur lors de la création", "error");
            }
          }}
        />

        {toast && (
          <Toast msg={toast.msg} type={toast.type} onClose={clearToast} />
        )}
      </div>
    );
  }
  // ── Vue projet actif ──────────────────────────────────────────────────
  const isLoading = docsLoading || btLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-2.5 flex items-center gap-3">
          {/* Logo */}
          {/* Logo cliquable */}
          <button
            onClick={() => selectProject(null)}
            className="flex items-center gap-2 mr-2"
            title="Retour à la liste des projets"
          >
            <div className="w-7 h-7 rounded-lg bg-[#003D5C] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#003D5C] text-lg tracking-wide">
              KORE
            </span>
          </button>

          {/* Sélecteur projet */}
          <ProjectSelector
            projects={projects}
            activeProject={activeProject}
            myRole={myRole}
            onSelect={selectProject}
            onCreateNew={() => {
              // Retourner à la page projets pour en créer un nouveau
              selectProject(null);
            }}
          />

          {/* Droite header */}
          <div className="flex items-center gap-2 ml-auto">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
              onMarkOneRead={markOneRead}
              onNavigate={handleNavigateFromNotif}
            />
                <UserMenu
              profile={profile}
              user={user}
              onSignOut={signOut}
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    <nav className="flex gap-1 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 fustify-center items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-all border-b-2
                    ${
                      isActive
                        ? "bg-[#003D5C] text-white"
                        : "text-gray-500 hover:bg-gray-100 hover:text-[#003D5C]"
                    }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      </div>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-6 h-6 text-[#009BA4] animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Nouveau document ────────────────────────────────────── */}
            {activeTab === "new" && can(myRole, "doc:create") && (
              <NewDocumentForm
                docs={docs}
                onSubmit={handleCreateDoc}
                notify={notify}
              />
            )}

            {/* ── Registre ────────────────────────────────────────────── */}
            {activeTab === "register" && (
              <RegisterView
                docs={docs}
                onAddRevision={insertRevision}
                onDownloadWithStamp={handleDownloadWithStamp}
                onSign={handleSign}
                notify={notify}
                user={user}
                profile={profile}
                highlightDoc={highlightDoc}
              />
            )}

            {/* ── Dashboard ───────────────────────────────────────────── */}
            {activeTab === "dashboard" && <DashboardView docs={docs} />}

            {/* ── Transmissions BT-x ─────────────────────────────────── */}
            {activeTab === "bt" && (
              <TransmissionView
                transmissions={transmissions}
                docs={docs}
                nextBtNumber={nextBtNumber()}
                onCreateTransmission={async (btData, selectedDocs) => {
                  const r = await createTransmission(btData, selectedDocs);
                  if (!r.error) notify(`${btData.bt_number} créé`);
                  else notify("Erreur création BT", "error");
                  return r;
                }}
                notify={notify}
                user={user}
                profile={profile}
                getFileUrl={getFileUrl}
              />
            )}

            {/* ── Import Excel ─────────────────────────────────────────── */}
            {activeTab === "import" && can(myRole, "doc:import") && (
              <ImportView
                activeProject={activeProject}
                userId={user.id}
                notify={notify}
                onImportDone={reloadDocs}
              />
            )}

            {/* ── Équipe ──────────────────────────────────────────────── */}
            {activeTab === "team" && (
              <TeamView
                members={members}
                myRole={myRole}
                activeProject={activeProject}
                onInvite={inviteMember}
                onUpdateRole={updateMemberRole}
                onRemove={removeMember}
                notify={notify}
              />
            )}
          </>
        )}
      </main>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
}