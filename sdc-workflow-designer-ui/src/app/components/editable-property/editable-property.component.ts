/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * node or workflow-line name
 */
@Component({
    selector: 'b4t-editable-property',
    templateUrl: 'editable-property.component.html',
    styleUrls: ['./editable-property.component.css']
})
export class EditablePropertyComponent {
    @Input() public name: string;
    @Output() public nameChange = new EventEmitter<string>();

    public showEdit = false;
    public isEditing = false;

    public showEditComponent(isShow: boolean): void {
        if(isShow){
            this.showEdit = isShow;
        }else{
            if(!this.isEditing){
                this.showEdit = false;
            }
        }
    }

    public startEdit(): void {
        this.isEditing = true;
    }

    public stopEdit(): void {
        this.isEditing = false;
        this.showEdit = false;
    }

    public change(newName: string) {
        this.name = newName;
        this.nameChange.emit(this.name);
    }
}
