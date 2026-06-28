import { useNavigate } from "@tanstack/react-router";
import bgVideo from "../assets/7269159-uhd_3840_2160_25fps.mp4";
import { useDashboard } from "../hooks/useDashboard";
import { SpaceCard } from "../components/dashboard/SpaceCard";
import { CreateSpaceModal } from "../components/dashboard/CreateSpaceModal";
import { DeleteConfirmModal } from "../components/dashboard/DeleteConfirmModal";

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    spaces,
    loading,
    isCreateOpen,
    setIsCreateOpen,
    isCreating,
    deleteConfirmId,
    setDeleteConfirmId,
    spaceName,
    setSpaceName,
    spacePassword,
    setSpacePassword,
    copiedId,
    handleCopy,
    handleCreateSpaceSubmit,
    handleDeleteSpaceSubmit,
  } = useDashboard((spaceId) => {
    navigate({ to: `/spaces/${spaceId}` });
  });

  return (
    <div className="min-h-screen bg-[#030014] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Background container to prevent scroll overflow from absolute glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Dark overlay for contrast and blur */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]" />

        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Space Station
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your active collaborative music spaces or create a new one.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="self-start md:self-center px-5 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Space
          </button>
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-xl">
              <div className="w-10 h-10 border-4 border-t-pink-500 border-purple-600 rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-400 font-medium">Contacting the mothership for spaces...</p>
            </div>
          ) : (
            <>
              {spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                  onDelete={setDeleteConfirmId}
                  onEnter={(id) => navigate({ to: `/spaces/${id}` })}
                />
              ))}

              {/* Create space card trigger */}
              <div
                onClick={() => setIsCreateOpen(true)}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] border border-dashed border-white/[0.12] hover:border-purple-500/40 transition-all duration-300 cursor-pointer min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-400 mb-4 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-300">Create a new Space</h3>
                <p className="text-xs text-slate-500 text-center mt-1.5 max-w-[200px]">
                  Set up a room, choose a password, and start queuing songs instantly.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <CreateSpaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSpaceSubmit}
        spaceName={spaceName}
        setSpaceName={setSpaceName}
        spacePassword={spacePassword}
        setSpacePassword={setSpacePassword}
        isCreating={isCreating}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        spaceId={deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteSpaceSubmit}
      />
    </div>
  );
}
