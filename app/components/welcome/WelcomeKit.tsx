import logo from '../../assets/logo.png'

export default function WelcomeKit() {
  return (
    <div className="relative w-full h-[460px] sm:h-[520px]">
      <div className="absolute inset-0 flex flex-col gap-4">
        <div className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight">
          <div>Welcome to a new way to</div>
          <div className="mt-4 space-y-1">
            <div className="line-through text-black/50 dark:text-white/50">design</div>
            <div className="line-through text-black/50 dark:text-white/50">engineer</div>
            <div>designgineer</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 flex items-center gap-3">
        <img src={logo} alt="Inspector logo" className="w-16 h-16 object-contain" />
        <div className="text-4xl sm:text-5xl">Inspector</div>
      </div>
    </div>
  )
}
