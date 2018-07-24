/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the Apache License, Version 2.0
 * and the Eclipse Public License v1.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
package org.onap.sdc.workflowdesigner.model;

public class IntermediateCatchEvent extends Element {
    private TimerEventDefinition timerEventDefinition;

    public TimerEventDefinition getTimerEventDefinition() {
        return timerEventDefinition;
    }

    public void setTimerEventDefinition(TimerEventDefinition timerEventDefinition) {
        this.timerEventDefinition = timerEventDefinition;
    }

}
