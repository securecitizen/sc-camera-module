import { EventEmitter } from 'events'
import { User } from 'oidc-client-ts'

class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter()

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []))
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.on(eventName, handler as any)
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.off(eventName, handler as any)
  }
}

// const emits = defineEmits(['photoTaken', 'cameraError', 'cancelled']); // leave here for future emitter but as HTML listeners

/**
 * A map of event names to argument tuples
 */
type LocalEventTypes = {
  'takePhotoBtn': [],
  'openCameraBtn': [],
  'closeCameraBtn': [],
  'login': [],
  'logout': [],
  'getUser': [],
  'getSession': [],
  'photoTaken': [statusCode: number, photoString: string]
  'userAcquired': [statusCode: number, user: User | null]
  'userChange': [statusCode: number, change: 'token_expired' | 'token_expiring' | 'user_loaded' | 'user_unloaded' | 'user_signed_in' | 'user_signed_out']
  'userError': [statusCode: number, error: string]
  'cancelled' : [statusCode: number, reason?: string]
  'cameraError': [statusCode: number, error: string]
}

export const EventBroker = new TypedEventEmitter<LocalEventTypes>();