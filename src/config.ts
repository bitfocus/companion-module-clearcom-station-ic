import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: string
	apikey: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Station-IC IP Address',
			width: 4,
			regex: Regex.IP,
			default: '127.0.0.1',
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port #',
			width: 4,
			regex: Regex.PORT,
			default: '16000',
		},
		{
			type: 'textinput',
			id: 'apikey',
			label: 'API Key',
			width: 8,
			default: 'xxx',
		},
	]
}
