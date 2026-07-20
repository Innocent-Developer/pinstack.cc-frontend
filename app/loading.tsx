export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-16 border-b border-borderC animate-pulse bg-white" />
      <div className="bg-bgAlt py-20 px-6">
        <div className="max-w-[520px] mx-auto space-y-4">
          <div className="h-6 w-40 mx-auto rounded-full bg-borderC/50 animate-pulse" />
          <div className="h-10 w-full rounded bg-borderC/60 animate-pulse" />
          <div className="h-4 w-4/5 mx-auto rounded bg-borderC/40 animate-pulse" />
          <div className="h-12 w-full rounded-btn bg-borderC/50 animate-pulse" />
        </div>
      </div>
      <div className="py-10 px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded bg-bgAlt animate-pulse" />
        ))}
      </div>
      <div className="py-14 px-6 max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[110px] rounded-card bg-bgAlt animate-pulse" />
        ))}
      </div>
    </div>
  );
}
