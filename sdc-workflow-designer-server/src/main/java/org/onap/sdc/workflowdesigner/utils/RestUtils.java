/**
 * Copyright (c) 2018 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the Apache License, Version 2.0
 * and the Eclipse Public License v1.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */

package org.onap.sdc.workflowdesigner.utils;

import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.core.Response;

import org.onap.sdc.workflowdesigner.utils.entity.CommonErrorResponse;

/**
 * 
 */
public class RestUtils {
  public static InternalServerErrorException newInternalServerErrorException(Exception e) {
    return new InternalServerErrorException(Response.status(Response.Status.INTERNAL_SERVER_ERROR)
        .entity(new CommonErrorResponse(e.getMessage())).build(), e);
  }
}
