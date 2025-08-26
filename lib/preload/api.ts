import ApiContract from './shared'

export class PreloadAPI extends ApiContract {
  mousePos = async () => {
    return this.renderer.invoke('mouse-pos')
  }
}
