import type { ModuleInstance } from './main.js'
import { StationICMessage, keyDef, keyFuncArray } from './messages.js'
import { DropdownChoice } from '@companion-module/base'

export const keySetChoices: DropdownChoice[] = []
export const keyChoices: DropdownChoice[] = []

export function UpdateActions(self: ModuleInstance): void {
	const maxVol = 15
	if (keySetChoices.length == 0) {
		for (const ks of keyDef.keysetIds!) {
			keySetChoices.push({ id: ks.id.toString(), label: ks.label })
		}
	}
	if (keyChoices.length == 0) {
		for (const id of keyFuncArray) {
			const prettyId = `${id.charAt(0).toUpperCase()}${id.slice(1).toLowerCase()}`
			keyChoices.push({ id: id, label: prettyId })
		}
	}

	self.setActionDefinitions({
		key_press: {
			name: 'KeySet Press',
			description: 'Press or Release a Key',
			options: [
				{
					id: 'keySet',
					type: 'dropdown',
					label: 'KeySet',
					choices: keySetChoices,
					default: 0,
				},
				{
					id: 'function',
					type: 'dropdown',
					label: 'Function',
					choices: keyChoices,
					default: keyChoices[0]?.id,
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 'HOLD', label: 'Hold' },
						{ id: 'RELEASE', label: 'Release' },
						{ id: 'PRESS+RELEASE', label: 'Press+Release' },
					],
					default: 'PRESS+RELEASE',
				},
			],
			callback: async (event): Promise<void> => {
				const ksId = keyDef.keysetIds![Number(event.options.keySet)].id
				const key = keyDef.keysetIds![ksId].keys.find((k) => k.function == event.options.function)?.key
				const msg = `{
					"type": "MAIN_KEYSET",
					"apiKey": "xxx",
					"keysetId": ${ksId},
					"key": "${key}",
					"action": "${event.options.action}"
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},

		keyset_volume: {
			name: 'KeySet Volume',
			description: 'Set the Volume for a Keyset',
			options: [
				{
					id: 'keySet',
					type: 'dropdown',
					label: 'KeySet',
					choices: keySetChoices,
					default: 0,
				},
				{
					id: 'volValue',
					type: 'number',
					label: 'Volume',
					default: 7,
					min: 0,
					max: maxVol,
					range: true,
					isVisible: (opt) => !opt.relative,
				},
				{
					id: 'volRel',
					type: 'number',
					label: 'Volume',
					default: 1,
					min: -15,
					max: maxVol,
					isVisible: (opt) => !!opt.relative,
				},
				{
					id: 'relative',
					type: 'checkbox',
					label: 'Relative',
					default: false,
				},
			],
			callback: async (event): Promise<void> => {
				const curVol = self.getVariableValue(`KS_${event.options.keysetId}_VOL`)
				let vol = 0
				if (event.options.relative) {
					if (curVol) {
						vol = Number(curVol) + Number(event.options.volRel)
					} else {
						self.log('warn', 'Cannot set relative volume - have not received current volume from Station-IC.')
						return
					}
				} else {
					vol = Number(event.options.volValue)
				}
				if (isNaN(vol)) return
				vol = Math.min(Math.max(vol, 0), maxVol)
				const ksId = keyDef.keysetIds![Number(event.options.keySet)].id
				const msg = `{
					"type": "KEYSET_VOLUME",
					"apiKey": "xxx",
					"keysetId": ${ksId},
					"volValue": ${vol}
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},

		reply: {
			name: 'Reply Key Press',
			description: 'Press or Release the Reply Key',
			options: [
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 'HOLD', label: 'Hold' },
						{ id: 'RELEASE', label: 'Release' },
					],
					default: 'HOLD',
				},
			],
			callback: async (event): Promise<void> => {
				const msg = `{
					"type": "REPLY_KEYSET",
					"apiKey": "xxx",
					"key": "MAIN",
					"action": "${event.options.action}"
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},

		global_talk: {
			name: 'Global Talk Mute',
			description: 'Toggle Global Talk Mute state',
			options: [],
			callback: async (): Promise<void> => {
				const msg = `{
					"type": "GBL_TALK",
					"apiKey": "xxx",
					"action": "PRESS+RELEASE"
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},

		global_listen: {
			name: 'Global Listen Mute',
			description: 'Toggle Global Listen Mute state',
			options: [],
			callback: async (): Promise<void> => {
				const msg = `{
					"type": "GBL_LISTEN",
					"apiKey": "xxx",
					"action": "PRESS+RELEASE"
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},
	})
}
