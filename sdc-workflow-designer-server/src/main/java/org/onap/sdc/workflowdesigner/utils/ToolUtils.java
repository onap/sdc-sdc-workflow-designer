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

package org.onap.sdc.workflowdesigner.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * common utility class.
 * 
 */
public class ToolUtils {
  static final Logger logger = LoggerFactory.getLogger(ToolUtils.class);

  /**
   * @param array
   * @param t
   * @param ts
   * @return
   */
  public static <T> T[] addElement2Array(T[] array, T t, T[] ts) {
    List<T> list = new ArrayList<>();
    if (isNotEmpty(array)) {
      list.addAll(Arrays.asList(array));
    }
    list.add(t);

    return list.toArray(ts);
  }

  /**
   * 
   * @param name
   * @param v
   * @return
   */
  public static <K, V> Entry<K, V> buildEntry(K name, V v) {
    return buildMapObject(name, v).entrySet().iterator().next();
  }

  /**
   * @param key
   * @param v
   * @return
   */
  public static <K, V> Map<K, V> buildMapObject(K key, V v) {
    Map<K, V> map = new HashMap<>();
    map.put(key, v);
    return map;
  }

  /**
   * 
   * @return
   */
  public static String generateUUID() {
    return UUID.randomUUID().toString();
  }

  /**
   * 
   * @param path
   * @return
   */
  public static String getRuntimePath(String path) {
    return Class.class.getClass().getResource("/").getPath() + path;
  }

  /**
   * 
   * @param map
   * @return
   */
  @SuppressWarnings("unchecked")
  public static <K, V> Map<V, K> invertMap(Map<K, V> map) {
    if (isEmpty(map)) {
      return new HashMap<>();
    }

    return MapUtils.invertMap(map);
  }

  /**
   * 
   * @param coll
   * @return
   */
  public static boolean isEmpty(Collection<?> coll) {
    return null == coll || coll.isEmpty();
  }

  /**
   * @param map
   * @return
   */
  public static <K, V> boolean isEmpty(Map<K, V> map) {
    return map == null || map.isEmpty();
  }

  /**
   * @param val
   * @return
   */
  public static boolean isEmpty(String val) {
    return val == null || val.trim().isEmpty();
  }

  /**
   * 
   * @param t
   * @return
   */
  public static <T> boolean isEmpty(T t) {
    return t == null || t.toString().isEmpty();
  }

  /**
   * 
   * @param array
   * @return
   */
  public static <T> boolean isEmpty(T[] array) {
    return array == null || array.length == 0;
  }

  /**
   * 
   * @param x
   * @param y
   * @return
   */
  public static <T> boolean isEqual(final T x, final T y) {
    return x == y || (x != null && y != null && x.equals(y));
  }

  /**
   * 
   * @param coll
   * @return
   */
  public static boolean isNotEmpty(Collection<?> coll) {
    return null != coll && !coll.isEmpty();
  }

  /**
   * 
   * @param map
   * @return
   */
  public static <K, V> boolean isNotEmpty(Map<K, V> map) {
    return map != null && !map.isEmpty();
  }

  /**
   * 
   * @param val
   * @return
   */
  public static boolean isNotEmpty(String val) {
    return val != null && !val.trim().isEmpty();
  }

  /**
   * 
   * @param t
   * @return
   */
  public static <T> boolean isNotEmpty(T t) {
    return t != null && !t.toString().isEmpty();
  }

  /**
   * 
   * @param array
   * @return
   */
  public static <T> boolean isNotEmpty(T[] array) {
    return array != null && array.length > 0;
  }

  private static <K, V> Map<K, V> merge(Map<K, V> mapA, Map<K, V> mapB) {
    Map<K, V> target = new HashMap<>();
    if (!isEmpty(mapA)) {
      target.putAll(mapA);
    }
    if (!isEmpty(mapB)) {
      target.putAll(mapB);
    }
    return target;
  }

  /**
   * @param mapA
   * @param mapB
   * @param override
   * @return
   */
  public static <K, V> Map<K, V> merge(Map<K, V> mapA, Map<K, V> mapB, boolean override) {
    if (override) {
      return merge(mapA, mapB);
    }

    return merge(mapB, mapA);
  }

  /**
   * 
   * @param keySet
   * @param origalKey
   * @return
   */
  public static String newNonRepetitiveKey(Set<String> keySet, String origalKey) {
    return newNonRepetitiveKey(keySet, origalKey, 1);
  }

  /**
   * 
   * @param keySet
   * @param origalKey
   * @param index
   * @return
   */
  public static String newNonRepetitiveKey(Set<String> keySet, String origalKey, int index) {
    String key = origalKey + index;
    while (keySet.contains(key)) {
      index++;
      key = origalKey + index;
    }

    return key;
  }

}
