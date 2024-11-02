import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { ParseMessage } from './parseMessage.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	ws!: WebSocket
	labelMap!: Map<number, string>
	keysetVolumeMap!: Map<number, number>

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.labelMap = new Map<number, string>()
		this.keysetVolumeMap = new Map<number, number>()

		this.updateStatus(InstanceStatus.Connecting)
		this.initWebSocket()

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		console.log('WS readyState: ', this.ws.readyState)
		if (this.ws.readyState == WebSocket.OPEN) {
			this.ws.close()
		}
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.initWebSocket()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	initWebSocket(): void {
		if (this.ws?.readyState == WebSocket.OPEN) {
			this.ws.close(1000)
			this.updateStatus(InstanceStatus.Disconnected)
		}
		this.ws = new WebSocket(`ws://${this.config.host}:16000`)

		this.ws.addEventListener('error', (event) => {
			console.log('WS Error: ', event.message)
			this.updateStatus(InstanceStatus.ConnectionFailure)
			if (this.ws?.readyState == WebSocket.OPEN) {
				this.ws.close()
			}
		})

		this.ws.addEventListener('open', () => {
			console.log('WS Open.')
			this.updateStatus(InstanceStatus.Ok)
		})

		this.ws.addEventListener('closed', (event) => {
			console.log('WS Closed. Msg: ', event)
			this.updateStatus(InstanceStatus.Disconnected)
		})

		this.ws.addEventListener('message', (event) => {
			try {
				console.log('WS Received: ', JSON.parse(event.data))
				ParseMessage(this, event.data)
			} catch (e) {
				console.log('Parse Error: ', e, 'Unrecognized message: ', event.data)
			}
		})
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
