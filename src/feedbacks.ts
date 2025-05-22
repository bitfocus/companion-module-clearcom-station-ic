import { combineRgb, CompanionFeedbackInfo } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { keyDef, msgTypes, globalStatus, keyStatus, keyTypes, favsArray } from './messages.js'
import { keySetChoices, keyChoices } from './actions.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		button_state: {
			name: 'KeySet Button State',
			description: 'Check KeySet Button Activity',
			type: 'boolean',
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
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'ACTIVE', label: 'Active' },
						{ id: 'FLASHING', label: 'Flashing' },
					],
					default: 'ACTIVE',
				},
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			callback: async (event: CompanionFeedbackInfo): Promise<boolean> => {
				let status = false
				let ksId = -1
				if (event.options.keySet?.toString().startsWith('FAV')) {
					const favId = Number(event.options.keySet?.toString().replace('FAV', ''))
					if (favId > favsArray.length) {
						return false
					}
					ksId = favsArray[favId - 1].keysetId
				} else if (Number(event.options.keySet) < keyDef.keysets!.length) {
					ksId = keyDef.keysets![Number(event.options.keySet)].id
				} else {
					return false
				}
				const key = keyDef.keysets![ksId].keys.find((k) => k.function == event.options.function)?.key
				const ks = keyStatus.get(ksId)?.get(key!)
				if (event.options.state == 'ACTIVE') {
					status = !!ks?.isActive
				} else {
					status = !!ks?.isFlashing
				}
				return status
			},
		},

		reply_state: {
			name: 'Reply Button State',
			description: 'Check if Reply Button is Pressed',
			type: 'boolean',
			options: [
				{
					id: 'key',
					type: 'dropdown',
					label: 'Key',
					choices: [
						{ id: 'MAIN', label: 'Main' },
						{ id: 'LEFT', label: 'Left' },
						{ id: 'RIGHT', label: 'Right' },
					],
					default: 'MAIN',
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'ACTIVE', label: 'Active' },
						{ id: 'FLASHING', label: 'Flashing' },
					],
					default: 'ACTIVE',
				},
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			callback: async (event: CompanionFeedbackInfo): Promise<boolean> => {
				let status = false
				const replyKey = globalStatus.get('REPLY_KEYSET')
				const replyState = replyKey?.get(event.options.key as keyTypes)
				if (!replyState) {
					return false
				}
				if (event.options.state == 'ACTIVE') {
					status = !!replyState?.isActive
				} else {
					status = !!replyState?.isFlashing
				}
				return status
			},
		},

		global_state: {
			name: 'Global Mutes',
			description: 'Check on Global Talk & Listen Mutes',
			type: 'boolean',
			options: [
				{
					id: 'function',
					type: 'dropdown',
					label: 'Function',
					choices: [
						{ id: 'TALK', label: 'Talk' },
						{ id: 'LISTEN', label: 'Listen' },
					],
					default: 'TALK',
				},
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			callback: async (event: CompanionFeedbackInfo): Promise<boolean> => {
				const globalFunction = `GBL_${event.options.function}` as msgTypes
				const globalState = globalStatus.get(globalFunction)?.get('MAIN')!.muted
				return !!globalState
			},
		},
	})
}
