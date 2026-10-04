export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse select-none bg-[#EFECE1] min-h-screen">
      {/* Header skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-[#D3CDBC]">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-[#D1CCC0] rounded-full" />
          <div className="h-3 w-72 bg-[#EDE9DD] rounded-full" />
        </div>
        <div className="h-8 w-28 bg-[#EDE9DD] border border-[#D1CCC0] rounded-full" />
      </div>

      {/* Grid cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-[#FFFFFF] border-[1.5px] border-[#1E1E1E] rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="h-3 w-24 bg-[#D1CCC0] rounded-full" />
            <div className="h-8 w-16 bg-[#EDE9DD] rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="h-64 bg-[#FCFAF7] border-2 border-[#2B2B28] rounded-[24px] p-6 shadow-sm">
        <div className="h-4 w-40 bg-[#D1CCC0] rounded-full mb-4" />
        <div className="h-32 bg-[#EDE9DD]/60 border-2 border-dashed border-[#D1CCC0] rounded-2xl" />
      </div>
    </div>
  );
}
