import { motion } from "framer-motion";

interface FadedComponentProps {
  children: React.ReactNode;
  className?: string;
}

export const FadedComponent = ({
  children,
  className,
}: FadedComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
