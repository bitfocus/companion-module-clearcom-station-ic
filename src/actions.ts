import type { ModuleInstance } from './main.js'
import { StationICMessage } from './message.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		keyset_talk: {
			name: 'KeySet Talk',
			options: [
				{
					id: 'keyset',
					type: 'number',
					label: 'KeySet #',
					default: 0,
					min: 0,
					max: 23,
				},
				{
					id: 'mode',
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
			callback: async (event) => {
				const msg = `{
					"type": "MAIN_KEYSET",
					"apiKey": "xxx",
					"keysetId": "${event.options.keyset}",
					"key": "PRIMARY_RIGHT",
					"action": "${event.options.mode}"
				}`
				const stnMsg = new StationICMessage(self, msg)
				console.log('WS Sending:', stnMsg.data)
				self.ws.send(JSON.stringify(stnMsg.data))
			},
		},
	})
}
