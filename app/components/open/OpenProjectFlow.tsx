import { AnimatePresence, motion } from 'framer-motion'
import { useProject } from '@/app/contexts/ProjectContext'
import OpenProjectScreen from './OpenProjectScreen'
import ProjectDetectionScreen from './project_detection_screen/ProjectDetectionScreen'

export default function OpenProjectFlow() {
  const { selectedProjectPath, setSelectedProjectPath } = useProject()

  return (
    <div className="pane-surface h-full w-full rounded-md">
      <AnimatePresence mode="wait">
        {!selectedProjectPath ? (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <OpenProjectScreen />
          </motion.div>
        ) : (
          <motion.div
            key="detect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ProjectDetectionScreen 
              projectPath={selectedProjectPath}
              onBack={() => setSelectedProjectPath(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
