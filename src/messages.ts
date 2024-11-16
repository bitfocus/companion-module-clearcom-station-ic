import type { ModuleInstance } from './main.js'
import { CreateVariable } from './variables.js'

export type actionTypes = 'PRESS+RELEASE' | 'HOLD' | 'RELEASE'

interface IStationICMessage {
	apiKey?: string
	type: 'CONNECTION' | 'LABELS_MAPPING' | 'GBL_TALK' | 'GBL_LISTEN' | 'REPLY_KEYSET' | 'KEYSET_VOLUME' | 'MAIN_KEYSET'
	status?: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
	keysetId?: number
	keysetIds?: ILabel[]
	label?: string
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
	data: IStationICMessage = { type: 'CONNECTION' }

	constructor(newMsg: string = '') {
		if (newMsg != '') {
			try {
				console.log('WS Message   ', newMsg)
				this.data = JSON.parse(newMsg)
				console.log('WS Parsed:   ', this.data)
			} catch (e) {
				console.log('Error: ', e, 'WS: Unrecognized message. ', newMsg)
			}
		}
	}

	send(ws: WebSocket): void {
		try {
			const JSONString = JSON.stringify(this.data)
			console.log('WS Sending:  ', JSONString)
			ws.send(JSONString)
		} catch (e) {
			console.log('Error: ', e, 'Cannot send: ', this.data)
		}
	}
}

export function ParseMessage(self: ModuleInstance, msg: string): void {
	const data = new StationICMessage(msg).data
	switch (data.type) {
		case 'CONNECTION': {
			self.setVariableValues({ CONNECTION: data.status })
			break
		}

		case 'LABELS_MAPPING': {
			for (const lm of data.keysetIds!) {
				CreateVariable(self, `KS_${lm.id}_LABEL`, lm.label?.trim())
			}
			break
		}

		case 'GBL_TALK':
		case 'GBL_LISTEN': {
			CreateVariable(self, `${data.type}_MUTED`, data.isMuted)
			break
		}

		case 'REPLY_KEYSET': {
			CreateVariable(self, `RK_ACTIVE`, data.isActive)
			CreateVariable(self, `RK_FLASHING`, data.isFlashing)
			break
		}

		case 'KEYSET_VOLUME': {
			CreateVariable(self, `KS_${data.keysetId}_VOL`, data.currentVolume)
			break
		}

		case 'MAIN_KEYSET': {
			CreateVariable(self, `KS_${data.keysetId}_${data.key}_ACTIVE`, data.isActive)
			CreateVariable(self, `KS_${data.keysetId}_${data.key}_FLASHING`, data.isFlashing)
			break
		}
	}
}
