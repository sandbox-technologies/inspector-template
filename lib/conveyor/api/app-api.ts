import { ConveyorApi } from '@/lib/preload/shared'

export class AppApi extends ConveyorApi {
  version = () => this.invoke('version')
  selectProject = () => this.invoke('select-project')
  detectProject = (projectPath: string) => this.invoke('detect-project', projectPath)
}
