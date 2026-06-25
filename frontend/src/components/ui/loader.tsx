import { motion } from "framer-motion";

export const LoaderThree = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex items-center justify-center relative select-none">
      <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-xl scale-150 animate-pulse" />
      <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl scale-125 animate-pulse delay-75" />

      <div className={`relative ${sizeClasses[size]}`}>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 border-l-pink-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-purple-500 border-r-purple-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-3 rounded-full border-2 border-transparent border-t-cyan-400 border-l-cyan-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />

        <div className="absolute inset-0 flex items-center justify-center text-xs animate-pulse">
          🎵
        </div>
      </div>
    </div>
  );
};

export function LoaderThreeDemo() {
  return (
    <div className="h-[20rem] flex items-center justify-center bg-black">
      <LoaderThree size="md" />
    </div>
  );
}
