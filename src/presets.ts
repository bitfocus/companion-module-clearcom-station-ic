import type { ModuleInstance } from './main.js'
import { combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	self.setPresetDefinitions({
		talk_key: {
			type: 'button', // This must be 'button' for now
			category: 'Keys', // This groups presets into categories in the ui. Try to create logical groups to help users find presets
			name: `TALK Key`, // A name for the preset. Shown to the user when they hover over it
			style: {
				text: `TALK`, // You can use variables from your module here
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'key_press',
							options: {
								keySet: 0,
								function: 'TALK',
								action: 'PRESS+RELEASE',
							},
						},
					],
					up: [],
					200: {
						options: {},
						actions: [
							{
								actionId: 'key_press',
								options: {
									keySet: 0,
									function: 'TALK',
									action: 'RELEASE',
								},
							},
						],
					},
				},
			],
			feedbacks: [
				{
					feedbackId: 'button_state',
					options: {
						keySet: 0,
						function: 'TALK',
						state: 'ACTIVE',
					},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		},

		listen_key: {
			type: 'button',
			category: 'Keys',
			name: `LISTEN Key`,
			style: {
				text: `LISTEN`,
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'key_press',
							options: {
								keySet: 0,
								function: 'LISTEN',
								action: 'PRESS+RELEASE',
							},
						},
					],
					up: [],
					200: {
						options: {},
						actions: [
							{
								actionId: 'key_press',
								options: {
									keySet: 0,
									function: 'LISTEN',
									action: 'RELEASE',
								},
							},
						],
					},
				},
			],
			feedbacks: [
				{
					feedbackId: 'button_state',
					options: {
						keySet: 0,
						function: 'LISTEN',
						state: 'ACTIVE',
					},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
				{
					feedbackId: 'button_state',
					options: {
						keySet: 0,
						function: 'CALL',
						state: 'ACTIVE',
					},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
						text: 'CALL',
					},
				},
			],
		},

		call_key: {
			type: 'button',
			category: 'Keys',
			name: `CALL Key`,
			style: {
				text: `CALL`,
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'key_press',
							options: {
								keySet: 0,
								function: 'CALL',
								action: 'PRESS+RELEASE',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'button_state',
					options: {
						keySet: 0,
						function: 'CALL',
						state: 'ACTIVE',
					},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		},

		reply_key: {
			type: 'button',
			category: 'Keys',
			name: `REPLY Key`,
			style: {
				text: `REPLY`,
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'reply',
							options: {
								action: 'HOLD',
							},
						},
					],
					up: [
						{
							actionId: 'reply',
							options: {
								action: 'RELEASE',
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'reply_state',
					options: {
						state: 'FLASHING',
					},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
						text: 'Reply\nTo\n$(CC_Station-IC:RK_LABEL)',
					},
				},
				{
					feedbackId: 'reply_state',
					options: {
						state: 'ACTIVE',
					},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
			],
		},

		key_volume: {
			type: 'button',
			category: 'Volume',
			name: `Volume Rotary`,
			options: {
				rotaryActions: true,
			},
			style: {
				text: `$(${self.label}:KS_1_VOL)`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
					rotate_left: [
						{
							actionId: 'keyset_volume',
							options: {
								keySet: 0,
								volRel: -1,
								relative: true,
							},
						},
					],
					rotate_right: [
						{
							actionId: 'keyset_volume',
							options: {
								keySet: 0,
								volRel: 1,
								relative: true,
							},
						},
					],
				},
			],
			feedbacks: [],
		},

		key_volUp: {
			type: 'button',
			category: 'Volume',
			name: `Volume +`,
			style: {
				text: `$(${self.label}:KS_1_LABEL)\nVOL+`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'keyset_volume',
							options: {
								keySet: 0,
								volRel: 1,
								relative: true,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},

		key_volDn: {
			type: 'button',
			category: 'Volume',
			name: `Volume -`,
			style: {
				text: `$(${self.label}:KS_1_LABEL)\nVOL-`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'keyset_volume',
							options: {
								keySet: 0,
								volRel: -1,
								relative: true,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
	})
}
