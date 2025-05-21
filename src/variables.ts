import type { ModuleInstance } from './main.js'
//import { StationICMessage } from './messages.js'

export function InitVariables(self: ModuleInstance): void {
	self.variables = [
		{ variableId: 'VERSION', name: 'Station-IC API Version' },
		{ variableId: 'CONNECTION', name: 'Connection Status' },
		{ variableId: 'RK_LABEL', name: 'Reply Key Label' },
	]
	UpdateVariableDefinitions(self)
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions(self.variables)
	self.setVariableValues({ VERSION: '' })
}

export function CreateVariable(
	self: ModuleInstance,
	varName: string,
	data: number | string | boolean | undefined,
): void {
	// Add new Auto-created variable and value
	const varToAdd = { variableId: varName, name: 'Auto-Created Variable' }
	const curVarVal = self.getVariableValue(varName)
	if (curVarVal === undefined) self.variables.push(varToAdd) // if Variable doesn't exist, add it
	self.setVariableDefinitions(self.variables)
	self.setVariableValues({ [varName]: data })
}

/*
export function getVolumes(self: ModuleInstance): void {
	for (let i = 0; i < self.maxKeySets; i++) {
		if (self.getVariableValue(`KS_${i}_VOL`) === undefined) {
			const msg = `{
				"type": "KEYSET_VOLUME",
				"apiKey": "${self.apiKey}",
				"keysetId": ${i}
			}`
			const stnMsg = new StationICMessage(msg)
			stnMsg.send(self.ws) // Request current volume
		}
	}
}

export function getKeysets(self: ModuleInstance): void {
	for (let i = 0; i < self.maxKeySets; i++) {
		if (self.getVariableValue(`KS_${i}_LABEL`) === undefined) {
			const msg = `{
				"type": "KEYSETS_MAPPING",
				"apiKey": "${self.apiKey}",
				"keysetId": ${i}
			}`
			const stnMsg = new StationICMessage(msg)
			stnMsg.send(self.ws) // Request Keyset mapping
		}
	}
}
*/
