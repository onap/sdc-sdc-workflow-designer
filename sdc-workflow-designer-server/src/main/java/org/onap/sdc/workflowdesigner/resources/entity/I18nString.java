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
package org.onap.sdc.workflowdesigner.resources.entity;

/**
 *
 */
public class I18nString {
  private String en_US;
  
  private String zh_CN;

  /**
   * 
   */
  public I18nString() {
    super();
  }

  /**
   * @param en_US
   * @param zh_CN
   */
  public I18nString(String en_US, String zh_CN) {
    super();
    this.en_US = en_US;
    this.zh_CN = zh_CN;
  }

  /**
   * @return the en_US
   */
  public String getEn_US() {
    return en_US;
  }

  /**
   * @param en_US the en_US to set
   */
  public void setEn_US(String en_US) {
    this.en_US = en_US;
  }

  /**
   * @return the zh_CN
   */
  public String getZh_CN() {
    return zh_CN;
  }

  /**
   * @param zh_CN the zh_CN to set
   */
  public void setZh_CN(String zh_CN) {
    this.zh_CN = zh_CN;
  }
  
  

}
