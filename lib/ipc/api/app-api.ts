import { BaseApi } from '@/lib/preload/shared'

export class AppApi extends BaseApi {
  version = () => this.invoke('version')
}
