import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	CompanionVariableDefinition,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { InitVariables } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { ParseMessage } from './messages.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	variables: CompanionVariableDefinition[] = []
	ws!: WebSocket
	reconnectTimer!: NodeJS.Timeout
	maxKeySets: number = 24
	maxVol: number = 15
	apiKey: string = 'xxx'

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.apiKey = this.config.apikey
		this.initWebSocket()
		InitVariables(this) // export variable definitions
		UpdateActions(this)
		UpdateFeedbacks(this)
		UpdatePresets(this)
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		if (this.ws) {
			console.log('Destroying WS.\nWS readyState= ', this.ws.readyState)
			if (this.ws.readyState != WebSocket.CLOSED) {
				this.ws.close()
			}
		}
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.apiKey = this.config.apikey
		this.initWebSocket()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	initWebSocket(): void {
		if (this.ws && this.ws.readyState == WebSocket.OPEN) {
			this.ws.close(1000)
			this.updateStatus(InstanceStatus.Disconnected)
		}

		this.ws = new WebSocket(`ws://${this.config.host}:${this.config.port}`)

		this.ws.addEventListener('error', (event) => {
			console.log('WS Error: ', event.message)
			this.updateStatus(InstanceStatus.ConnectionFailure)
			if (this.ws?.readyState == WebSocket.OPEN) {
				this.ws.close()
			}
			this.reconnectTimer = setTimeout(() => this.initWebSocket(), 1000)
		})

		this.ws.addEventListener('open', () => {
			console.log('WS Open.')
			this.updateStatus(InstanceStatus.Ok)
			clearTimeout(this.reconnectTimer)
		})

		this.ws.addEventListener('closed', (event) => {
			console.log('WS Closed. Msg: ', event)
			this.updateStatus(InstanceStatus.Disconnected)
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = setTimeout(() => this.initWebSocket(), 1000)
		})

		this.ws.addEventListener('message', (event) => {
			try {
				console.log('WS Received: ', JSON.stringify(JSON.parse(event.data), null, 2))
				ParseMessage(this, event.data)
			} catch (e) {
				console.log('Parse Error: ', e, '\nUnrecognized message: ', event.data)
			}
		})
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
