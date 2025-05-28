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
			tooltip: 'Use 127.0.0.1 if Station-IC is running on the same machine as Companion',
			width: 4,
			regex: Regex.IP,
			default: '127.0.0.1',
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port #',
			tooltip: 'Default is 16000',
			width: 4,
			regex: Regex.PORT,
			default: '16000',
		},
		{
			type: 'textinput',
			id: 'apikey',
			label: 'API Key',
			tooltip: 'Copy from the "Settings/Remote API" page in Station-IC',
			width: 8,
			default: 'xxx',
		},
	]
}
