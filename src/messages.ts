import { InstanceStatus } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { InitVariables, CreateVariable } from './variables.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'

export type msgTypes =
	| 'VERSION'
	| 'CONNECTION'
	| 'KEYSETS_MAPPING'
	| 'FAVS_MAPPING'
	| 'GBL_TALK'
	| 'GBL_LISTEN'
	| 'REPLY_KEYSET'
	| 'KEYSETS_VOLUME'
	| 'KEYSET_VOLUME'
	| 'MAIN_KEYSET'
export type actionTypes = 'PRESS+RELEASE' | 'HOLD' | 'RELEASE'
export type keyTypes = 'MAIN' | 'CLEAR' | 'PRIMARY_RIGHT' | 'PRIMARY_LEFT' | 'SECONDARY_RIGHT' | 'SECONDARY_LEFT'
export type keyFunctions = 'TALK' | 'LISTEN' | 'CALL' | 'RMK' | 'EVENT1' | 'EVENT2'

interface IStationICMessage {
	apiKey?: string
	type: msgTypes
	version?: string
	status?: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
	keysetId?: number
	keysets?: IKeyset[]
	favs?: IFav[]
	volumes?: IVolume[]
	label?: string
	key?: keyTypes
	action?: actionTypes
	isMuted?: boolean
	isActive?: boolean
	isFlashing?: boolean
	volValue?: number
	currentVolume?: number
}

interface IKeyset {
	label: string
	id: number
	keys: IKeyMap[]
}

interface IVolume {
	type: msgTypes
	keysetId: number
	currentVolume: number
}

interface IKeyMap {
	key: keyTypes
	function: keyFunctions
}

interface IFav {
	favId: number
	keysetId: number
	gKey: number
	label: string
	talkMode: number
	listenMode: number
}

export interface IKeyStatus {
	label?: string
	muted?: boolean
	isActive?: boolean
	isFlashing?: boolean
}

export const maxKeySets = 24
export const maxFavs = 6

function createBlankKeyDef(): IStationICMessage {
	const ksArr = []
	for (let i = 0; i < maxKeySets; i++) {
		ksArr.push({ label: i.toString(), id: i, keys: [] })
	}
	return {
		type: 'KEYSETS_MAPPING',
		keysets: ksArr,
	}
}
export let keyDef: IStationICMessage = createBlankKeyDef()
export const keyFuncArray: keyFunctions[] = ['TALK', 'LISTEN', 'CALL', 'RMK', 'EVENT1', 'EVENT2']
export const globalStatus: Map<msgTypes, IKeyStatus> = new Map()
export const keyVolume: Map<number, number> = new Map()
export const keyStatus: Map<number, Map<keyTypes, IKeyStatus>> = new Map()
export let favsArray: IFav[] = []

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
		case 'VERSION': {
			self.setVariableValues({ VERSION: data.version })
			let msg = new StationICMessage(`{"type": "CONNECTION", "apiKey": "${self.apiKey}"}`)
			msg.send(self.ws)
			msg = new StationICMessage('{"type": "CONNECTION"}')
			msg.send(self.ws)
			break
		}

		case 'CONNECTION': {
			self.setVariableValues({ CONNECTION: data.status })
			switch (data.status) {
				case 'DISCONNECTED':
					InitVariables(self)
					self.updateStatus(InstanceStatus.Disconnected)
					self.ws?.close(1000)
					break
				case 'CONNECTED':
					self.updateStatus(InstanceStatus.Ok)
					break
				case 'CONNECTING':
					self.updateStatus(InstanceStatus.Connecting)
			}
			break
		}

		case 'KEYSETS_MAPPING': {
			keyDef = data
			for (const ks of data.keysets!) {
				if (ks.label !== '') CreateVariable(self, `KS_${ks.id}_LABEL`, ks.label?.trim())
			}
			UpdateActions(self)
			UpdateFeedbacks(self)
			break
		}

		case 'FAVS_MAPPING': {
			self.variables = self.variables.filter((v) => !v.variableId.startsWith('FAV_'))
			self.setVariableDefinitions(self.variables)
			favsArray = data.favs!
			favsArray.map((f) => {
				CreateVariable(self, `FAV_${f.favId}_LABEL`, keyDef.keysets![f.keysetId].label?.trim())
			})
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

		case 'KEYSETS_VOLUME': {
			for (const v of data.volumes!) {
				keyVolume.set(v.keysetId, v.currentVolume)
				const kLabel = keyDef.keysets![v.keysetId].label
				if (kLabel !== '') CreateVariable(self, `KS_${v.keysetId}_VOL`, v.currentVolume)
			}
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
			const kFunction = keyFunction(data.keysetId, data.key)
			if (kFunction !== '') {
				CreateVariable(self, `KS_${data.keysetId}_${kFunction}_ACTIVE`, data.isActive)
				CreateVariable(self, `KS_${data.keysetId}_${kFunction}_FLASHING`, data.isFlashing)
				self.checkFeedbacks('button_state')
			}
			break
		}
	}
}

function keyFunction(id: number | undefined, key: string | undefined): string {
	let kName = ''
	if (id !== undefined && key !== undefined) {
		const kData = keyDef.keysets![id].keys.find((k) => k.key == key)!
		kName = kData?.function || ''
	}
	return kName
}
