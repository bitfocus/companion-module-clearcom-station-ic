import { InstanceStatus } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { CreateVariable } from './variables.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'

export type msgTypes =
	| 'CONNECTION'
	| 'LABELS_MAPPING'
	| 'GBL_TALK'
	| 'GBL_LISTEN'
	| 'REPLY_KEYSET'
	| 'KEYSET_VOLUME'
	| 'MAIN_KEYSET'
export type actionTypes = 'PRESS+RELEASE' | 'HOLD' | 'RELEASE'
export type keyTypes = 'MAIN' | 'CLEAR' | 'PRIMARY_RIGHT' | 'PRIMARY_LEFT' | 'SECONDARY_RIGHT' | 'SECONDARY_LEFT'
export type keyFunctions = 'TALK' | 'LISTEN' | 'CALL' | 'RMK' | 'EVENT1' | 'EVENT2'

interface IStationICMessage {
	apiKey?: string
	type: msgTypes
	status?: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
	keysetId?: number
	keysetIds?: ILabel[]
	label?: string
	key?: keyTypes
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
	keys: IKeyMap[]
}

interface IKeyMap {
	key: keyTypes
	function: keyFunctions
}

export interface IKeyStatus {
	label?: string
	muted?: boolean
	isActive?: boolean
	isFlashing?: boolean
}

export const maxKeySets = 24

function createBlankKeyDef(): IStationICMessage {
	const ksID = []
	for (let i = 0; i < maxKeySets; i++) {
		ksID.push({ label: i.toString(), id: i, keys: [] })
	}
	return {
		type: 'LABELS_MAPPING',
		keysetIds: ksID,
	}
}
export let keyDef: IStationICMessage = createBlankKeyDef()
export const keyFuncArray: keyFunctions[] = ['TALK', 'LISTEN', 'CALL', 'RMK', 'EVENT1', 'EVENT2']
export const globalStatus: Map<msgTypes, IKeyStatus> = new Map()
export const keyVolume: Map<number, number> = new Map()
export const keyStatus: Map<number, Map<keyTypes, IKeyStatus>> = new Map()

export class StationICMessage {
	data: IStationICMessage = { type: 'CONNECTION' }
	constructor(newMsg: string = '') {
		if (newMsg != '') {
			try {
				this.data = JSON.parse(newMsg)
			} catch (e) {
				console.log('Error: ', e, 'WS: Unrecognized message. ', newMsg)
			}
		}
	}

	send(ws: WebSocket): void {
		if (ws.readyState === ws.OPEN) {
			try {
				const JSONString = JSON.stringify(this.data)
				console.log('WS Sending:  ', JSONString)
				ws.send(JSONString)
			} catch (e) {
				console.log('Error: ', e, 'Cannot send: ', this.data)
			}
		}
	}
}

export function ParseMessage(self: ModuleInstance, msg: string): void {
	const data = new StationICMessage(msg).data
	switch (data.type) {
		case 'CONNECTION': {
			self.setVariableValues({ CONNECTION: data.status })
			switch (data.status) {
				case 'DISCONNECTED':
					self.updateStatus(InstanceStatus.Disconnected)
					break
				case 'CONNECTED':
					self.updateStatus(InstanceStatus.Ok)
					break
				case 'CONNECTING':
					self.updateStatus(InstanceStatus.Connecting)
			}
			break
		}

		case 'LABELS_MAPPING': {
			keyDef = data
			for (const lm of data.keysetIds!) {
				CreateVariable(self, `KS_${lm.id}_LABEL`, lm.label?.trim())
				/*
				for (const kn of lm.keys!) {
					if (kn?.key && kn?.function) {
						CreateVariable(self, `KS_${lm.id}_${kn.key}`, kn.function?.trim())
					}
				}
				*/
			}
			UpdateActions(self)
			UpdateFeedbacks(self)
			break
		}

		case 'REPLY_KEYSET': {
			globalStatus.set(data.type, { label: data.label, isActive: data.isActive!, isFlashing: data.isFlashing })
			CreateVariable(self, `RK_ACTIVE`, data.isActive)
			CreateVariable(self, `RK_FLASHING`, data.isFlashing)
			CreateVariable(self, `RK_LABEL`, data.label)
			self.checkFeedbacks('reply_state')
			break
		}

		case 'GBL_TALK':
		case 'GBL_LISTEN': {
			globalStatus.set(data.type, { muted: data.isMuted! })
			CreateVariable(self, `${data.type}_MUTED`, data.isMuted)
			self.checkFeedbacks('global_state')
			break
		}

		case 'KEYSET_VOLUME': {
			keyVolume.set(data.keysetId!, data.currentVolume!)
			CreateVariable(self, `KS_${data.keysetId}_VOL`, data.currentVolume)
			break
		}

		case 'MAIN_KEYSET': {
			const keyData = keyStatus.get(data.keysetId!) || new Map<keyTypes, IKeyStatus>()
			keyData?.set(data.key!, { isActive: data.isActive!, isFlashing: data.isFlashing! })
			keyStatus.set(data.keysetId!, keyData)
			const kName = keyName(data.keysetId, data.key)
			if (kName !== '') {
				CreateVariable(self, `KS_${data.keysetId}_${kName}_ACTIVE`, data.isActive)
				CreateVariable(self, `KS_${data.keysetId}_${kName}_FLASHING`, data.isFlashing)
				self.checkFeedbacks('button_state')
			}
			break
		}
	}
}

function keyName(id: number | undefined, key: string | undefined): string {
	let kName = ''
	if (id !== undefined && key !== undefined) {
		const kData = keyDef.keysetIds![id].keys.find((k) => k.key == key)!
		kName = kData.function || ''
	}
	return kName
}
