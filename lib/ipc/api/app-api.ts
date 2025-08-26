import { ApiContract } from '@/lib/preload/shared'

export class AppAPI extends ApiContract {
  version = () => this.invoke('version')
}
