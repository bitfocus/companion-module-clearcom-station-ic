import type { ModuleInstance } from './main.js'
import { CreateVariable } from './variables.js'

export type actionTypes = 'PRESS+RELEASE' | 'HOLD' | 'RELEASE'

interface IStationICMessage {
	apiKey?: string
	type: 'CONNECTION' | 'LABELS_MAPPING' | 'GBL_TALK' | 'GBL_LISTEN' | 'REPLY_KEYSET' | 'KEYSET_VOLUME' | 'MAIN_KEYSET'
	status?: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
	keysetId?: number
	keysetIds?: ILabel[]
	key?: 'MAIN' | 'CLEAR' | 'PRIMARY_RIGHT' | 'PRIMARY_LEFT' | 'SECONDARY_RIGHT' | 'SECONDARY_LEFT'
	action?: 'PRESS+RELEASE' | 'HOLD' | 'RELEASE'
	isMuted?: boolean
	isActive?: boolean
	isFlashing?: boolean
	volValue?: number
	currentVolume?: number
}

interface ILabel {
	label: string
	id: number
}

export class StationICMessage {
	instance!: ModuleInstance
	data: IStationICMessage = { type: 'CONNECTION' }

	constructor(self: ModuleInstance, newMsg: string = '') {
		this.instance = self
		if (newMsg != '') {
			try {
				this.data = JSON.parse(newMsg)
				console.log('WS Parsed:   ', this.data)
			} catch (e) {
				console.log('Error: ', e, 'WS: Unrecognized message. ', newMsg)
			}
		}
	}

	send(): void {
		try {
			this.instance.ws.send(JSON.stringify(this.data))
		} catch (e) {
			console.log('Error: ', e, 'Cannot send: ', this.data)
		}
	}
}

export function ParseMessage(self: ModuleInstance, msg: string): void {
	const data = new StationICMessage(self, msg).data
	switch (data.type) {
		case 'CONNECTION': {
			console.log('CONNECTION status = ', data.status)
			self.setVariableValues({ CONNECTION: data.status })
			break
		}
		case 'KEYSET_VOLUME': {
			console.log(`KEYSET VOLUME #${data.keysetId} = ${data.currentVolume}`)
			CreateVariable(self, `KS_${data.keysetId}_VOL`, data.currentVolume)
			break
		}
		case 'LABELS_MAPPING': {
			for (const lm of data.keysetIds!) {
				console.log(`KEYSET #${lm.id} = ${lm.label}`)
				CreateVariable(self, `KS_${lm.id}_LABEL`, lm.label)
			}
			break
		}
		case 'MAIN_KEYSET': {
			console.log(
				`KEYSET BUTTON #${data.keysetId} ${data.key} ${data.isActive ? 'ACTIVE' : ''} ${data.isFlashing ? ', FLASHING' : ''}`,
			)
			CreateVariable(self, `KS_${data.keysetId}_${data.key}_ACTIVE`, data.isActive)
			break
		}
	}
}
