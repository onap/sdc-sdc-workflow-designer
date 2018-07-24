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

import com.google.gson.Gson;

/**
 *
 */
public class JsonUtils {
  /**
   * 
   * @param json
   * @param clazz
   * @return
   */
  public static <T> T fromJson(String json, Class<T> clazz) {
    Gson gson = new Gson();
    return gson.fromJson(json, clazz);
  }

  /**
   * 
   * @param t
   * @return
   */
  public static <T> String toJson(T t) {
    Gson gson = new Gson();
    return gson.toJson(t);
  }
  
}
