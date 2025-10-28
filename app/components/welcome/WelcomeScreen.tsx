import WelcomeKit from '@/app/components/welcome/WelcomeKit'

export default function WelcomeScreen() {
  return (
    <div className="pane-surface h-full w-full rounded-md flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <WelcomeKit />
      </div>
    </div>
  )
}


