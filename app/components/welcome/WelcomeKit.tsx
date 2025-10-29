import logo from '../../assets/logo/logo.png'
import { motion } from 'framer-motion'

export default function WelcomeKit() {
  const itemVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }

  return (
    <motion.div
      className="relative w-full h-[460px] sm:h-[520px]"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 flex flex-col gap-4">
        <motion.div
          className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.12, delayChildren: 0.15 }}
        >
          <motion.div variants={itemVariants}>Welcome to a new way to</motion.div>
          <div className="mt-4 space-y-1">
            <motion.div variants={itemVariants} className="line-through text-black/50 dark:text-white/50">design</motion.div>
            <motion.div variants={itemVariants} className="line-through text-black/50 dark:text-white/50">engineer</motion.div>
            <motion.div variants={itemVariants}>designgineer</motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 right-0 flex items-center gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35, ease: 'easeOut' }}
      >
        <img src={logo} alt="Inspector logo" className="w-16 h-16 object-contain" />
        <div className="text-4xl sm:text-5xl">Inspector</div>
      </motion.div>
    </motion.div>
  )
}
