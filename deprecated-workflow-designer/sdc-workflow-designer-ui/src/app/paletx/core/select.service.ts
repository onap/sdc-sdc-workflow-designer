/* tslint:disable:array-type member-access variable-name */
import {Injectable} from '@angular/core';

@Injectable()
export class SelectService {
  selection: string[] = [];

  selected(indexName: string): boolean {
	if (this.selection === undefined || this.selection === []) {
		return null;
	}

	for (let item of this.selection) {
		if (item === indexName) {
		return true;
		}
	}
	return false;
  }

  handleSingleSelect(optionIndex: string) {
	this.selection = [];
	this.selection.push(optionIndex);
	return this.selection;
  }

  handleMutipleSelect(optionIndex: string) {
	if (this.selected(optionIndex)) {
		this.selection = this.handleSecondSelect(optionIndex);
	} else {
		this.selection.push(optionIndex);
	}
	return this.selection;
  }

  handleSecondSelect(optionIndex: string) {
	let selectedOption = [];
	for (let option of this.selection) {
		if (option !== optionIndex) {
		selectedOption.push(option);
		}
	}
	return selectedOption;
  }

  select(optionIndex: string, isMutiple: boolean): string[] {
	if (!isMutiple) {
		return this.handleSingleSelect(optionIndex);
	} else {
		return this.handleMutipleSelect(optionIndex);
	}
  }

  deselect() {
	this.selection = [];
  }
}
