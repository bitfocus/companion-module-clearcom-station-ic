import type { ModuleInstance } from './main.js'
import { StationICMessage } from './messages.js'

export function UpdateActions(self: ModuleInstance): void {
	const maxVol = 15
	const maxKS = 23

	self.setActionDefinitions({
		key_press: {
			name: 'KeySet Press',
			description: 'Press or Release a Key',
			options: [
				{
					id: 'keysetId',
					type: 'number',
					label: 'KeySet #',
					default: 0,
					min: 0,
					max: maxKS,
				},
				{
					id: 'key',
					type: 'dropdown',
					label: 'Key',
					choices: [
						{ id: 'PRIMARY_LEFT', label: 'PRIMARY LEFT' },
						{ id: 'PRIMARY_RIGHT', label: 'PRIMARY RIGHT' },
						{ id: 'SECONDARY_LEFT', label: 'SECONDARY LEFT' },
						{ id: 'SECONDARY_RIGHT', label: 'SECONDARY RIGHT' },
					],
					default: 'PRIMARY_RIGHT',
				},
				{
					id: 'action',
					type: 'dropdown',
					label: 'Mode',
					choices: [
						{ id: 'HOLD', label: 'HOLD' },
						{ id: 'RELEASE', label: 'RELEASE' },
						{ id: 'PRESS+RELEASE', label: 'TOGGLE' },
					],
					default: 'PRESS+RELEASE',
				},
			],
			callback: async (event): Promise<void> => {
				const msg = `{
					"type": "MAIN_KEYSET",
					"apiKey": "xxx",
					"keysetId": ${event.options.keysetId},
					"key": "${event.options.key}",
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
					id: 'keysetId',
					type: 'number',
					label: 'KeySet #',
					default: 0,
					min: 0,
					max: maxKS,
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
				let vol = event.options.relative
					? Number(self.getVariableValue(`KS_${event.options.keysetId}_VOL`)) + Number(event.options.volRel)
					: Number(event.options.volValue)
				vol = Math.min(Math.max(vol, 0), maxVol)
				console.log(event.options, Number(self.getVariableValue(`KS_${event.options.keysetId}_VOL`)), vol)
				const msg = `{
					"type": "KEYSET_VOLUME",
					"apiKey": "xxx",
					"keysetId": ${event.options.keysetId},
					"volValue": ${vol}
				}`
				const stnMsg = new StationICMessage(msg)
				stnMsg.send(self.ws)
			},
		},

		reply: {
			name: 'Reply',
			description: 'Toggle Reply Key',
			options: [
				{
					id: 'action',
					type: 'dropdown',
					label: 'mode',
					choices: [
						{ id: 'HOLD', label: 'HOLD' },
						{ id: 'RELEASE', label: 'RELEASE' },
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
			name: 'Global Talk',
			description: 'Toggle Global Talk',
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
			name: 'Global Listen',
			description: 'Toggle Global Listen',
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
