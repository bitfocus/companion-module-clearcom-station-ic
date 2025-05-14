import { combineRgb, CompanionFeedbackInfo } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { keyDef, msgTypes, globalStatus, keyStatus, IKeyStatus } from './messages.js'
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
				const ksId = keyDef.keysets![Number(event.options.keySet)].id
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
				const replyState: IKeyStatus = globalStatus.get('REPLY_KEYSET')!
				let status = false
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
				const globalState = globalStatus.get(globalFunction)?.muted
				return !!globalState
			},
		},
	})
}
