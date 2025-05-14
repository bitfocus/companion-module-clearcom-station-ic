import type { ModuleInstance } from './main.js'
import { StationICMessage, keyDef, keyFuncArray } from './messages.js'
import { DropdownChoice } from '@companion-module/base'

export const keySetChoices: DropdownChoice[] = []
export const keyChoices: DropdownChoice[] = []

export function UpdateActions(self: ModuleInstance): void {
	keySetChoices.length = 0 // Clear it
	for (const ks of keyDef.keysets!) {
		keySetChoices.push({ id: ks.id.toString(), label: ks.label })
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
				const ksId = keyDef.keysets![Number(event.options.keySet)].id
				const key = keyDef.keysets![ksId].keys.find((k) => k.function == event.options.function)?.key
				const msg = `{
					"type": "MAIN_KEYSET",
					"apiKey": "${self.apiKey}",
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
					max: self.maxVol,
					range: true,
					isVisible: (opt) => !opt.relative,
				},
				{
					id: 'volRel',
					type: 'number',
					label: 'Volume',
					default: 1,
					min: -15,
					max: self.maxVol,
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
				const curVol = self.getVariableValue(`KS_${event.options.keySet}_VOL`)
				let vol = 0
				if (event.options.relative) {
					if (curVol !== undefined) {
						vol = Number(curVol) + Number(event.options.volRel)
					} else {
						self.log('warn', 'Cannot set relative volume - have not received current volume from Station-IC.')
						return
					}
				} else {
					vol = Number(event.options.volValue)
				}
				if (isNaN(vol)) return
				vol = Math.min(Math.max(vol, 0), self.maxVol)
				const ksId = keyDef.keysets![Number(event.options.keySet)].id
				const msg = `{
					"type": "KEYSET_VOLUME",
					"apiKey": "${self.apiKey}",
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
					"apiKey": "${self.apiKey}",
					"key": "MAIN",
					"action": "${event.options.action}"
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},

		reply_ctrl: {
			name: 'Reply Control',
			description: 'Scroll or clear the Reply Stack',
			options: [
				{
					id: 'key',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 'LEFT', label: 'Scroll Left' },
						{ id: 'RIGHT', label: 'Scroll Right' },
						{ id: 'CLEAR', label: 'Clear Reply' },
					],
					default: 'LEFT',
				},
			],
			callback: async (event): Promise<void> => {
				const msg = `{
					"type": "REPLY_KEYSET",
					"apiKey": "${self.apiKey}",
					"key": "${event.options.key}",
					"action": "PRESS+RELEASE"
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
					"apiKey": "${self.apiKey}",
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
					"apiKey": "${self.apiKey}",
					"action": "PRESS+RELEASE"
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},
	})
}
