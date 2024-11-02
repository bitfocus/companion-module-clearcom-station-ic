import type { ModuleInstance } from './main.js'
import { CompanionVariableDefinition } from '@companion-module/base'

const variables: CompanionVariableDefinition[] = [{ variableId: 'CONNECTION', name: 'Connection Status' }]

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions(variables)
}

export function CreateVariable(
	self: ModuleInstance,
	varName: string,
	data: number | string | boolean | undefined,
): void {
	// Auto-create a variable

	// Add new Auto-created variable and value
	const varToAdd = { variableId: varName, name: 'Auto-Created Variable' }
	const curVarVal = self.getVariableValue(varName)
	if (curVarVal === undefined) variables.push(varToAdd) // if Variable doesn't exist, add it
	self.setVariableDefinitions(variables)
	self.setVariableValues({ [varName]: data })
}
