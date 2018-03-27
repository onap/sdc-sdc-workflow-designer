/**
 * Copyright (c) 2017-2018 ZTE Corporation.
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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * common utility class.
 * 
 */
public class FileCommonUtils {
  private static final Logger logger = LoggerFactory.getLogger(FileCommonUtils.class);

  /**
   * @param ins
   */
  public static void closeInputStream(InputStream ins) {
    if (ins != null) {
      try {
        ins.close();
      } catch (IOException e) {
        logger.info("Close InputStream failed.", e);
      }
    }
  }
  

  /**
   * 
   * @param os
   */
  public static void closeOutputStream(OutputStream os) {
    if (os != null) {
      try {
        os.close();
      } catch (IOException e) {
        logger.info("Close OutputStream failed.", e);
      }
    }
  }
  

  /**
   * @param reader
   */
  public static void closeReader(Reader reader) {
    if (reader != null) {
      try {
        reader.close();
      } catch (IOException e) {
        logger.info("Close Reader failed.", e);
      }
    }
  }
  

  /**
   * 
   * @param writer
   */
  public static void closeWriter(Writer writer) {
    if (writer != null) {
      try {
        writer.close();
      } catch (IOException e) {
        logger.info("Close Writer failed.", e);
      }
    }
  }


  /**
   * 
   * @param ins
   * @return
   * @throws IOException
   */
  public static String[] readLines(InputStream ins) throws IOException {
    InputStreamReader insReader = new InputStreamReader(ins);
    BufferedReader reader = new BufferedReader(insReader);

    List<String> lineList = new ArrayList<>();
    String line;
    try {
      while ((line = reader.readLine()) != null) {
        lineList.add(line);
      }
    } finally {
      closeReader(reader);
      closeReader(insReader);
    }

    return lineList.toArray(new String[0]);
  }
  

  /**
   * 
   * @param ins
   * @return
   * @throws IOException
   */
  public static String readString(InputStream ins) throws IOException {
    return IOUtils.toString(ins, "UTF-8");
  }
  

  /**
   * 
   * @param filePath
   * @return
   * @throws IOException
   */
  public static String readString(String filePath) throws IOException {
    InputStream ins = null;
    try {
      ins = Files.newInputStream(Paths.get(filePath));
      return readString(ins);
    } finally {
      closeInputStream(ins);
    }
  }

  
  /**
   * 
   * @param ins
   * @param path
   * @param fileName
   * @return
   * @throws IOException
   */
  public static String saveFile(InputStream ins, String path, String fileName) throws IOException {
    File tmpPath = new File(path);
    if (!tmpPath.exists()) {
      tmpPath.mkdirs();
    }

    File file = new File(path + File.separator + fileName);
    OutputStream os = null;
    try {
      int read = 0;
      byte[] bytes = new byte[1024];
      os = new FileOutputStream(file, false);
      while ((read = ins.read(bytes)) != -1) {
        os.write(bytes, 0, read);
      }
      os.flush();
      return file.getAbsolutePath();
    } finally {
      closeOutputStream(os);
    }
  }
  

  /**
   * 
   * @param path
   * @param fileName
   * @param content
   * @throws IOException
   */
  public static void writetoAbsoluteFile(String path, String fileName, String content)
      throws IOException {
    writetoAbsoluteFile(path, fileName, content, FileCommonConstants.DEFAULT_CHARSET_NAME);
  }
  

  /**
   * 
   * @param path
   * @param fileName
   * @param content
   * @param charsetName
   * @throws IOException
   */
  public static void writetoAbsoluteFile(String path, String fileName, String content,
      String charsetName) throws IOException {
    write(path, fileName, content, charsetName);
  }
  

  /**
   * 
   * @param fileName
   * @param s
   * @throws IOException
   */
  public static void write(String fileName, String s) throws IOException {
    write(".", fileName, s, FileCommonConstants.DEFAULT_CHARSET_NAME);

  }
  

  /**
   * 
   * @param path
   * @param fileName
   * @param s
   * @param charsetName
   * @throws IOException
   */
  public static void write(String path, String fileName, String s, String charsetName)
      throws IOException {
    File tmpPath = new File(path);
    if (!tmpPath.exists()) {
      tmpPath.mkdirs();
    }

    String absolutePath = path + File.separator + fileName;
    FileOutputStream out = null;
    try {
      out = new FileOutputStream(absolutePath);
      out.write(s.getBytes(charsetName));
      out.close();
    } finally {
      closeOutputStream(out);
    }
  }
  

  /**
   * 
   * @param fileName
   * @param s
   * @param charsetName
   * @throws IOException
   */
  public static void write(String fileName, String s, String charsetName) throws IOException {
    write(".", fileName, s, charsetName);
  }

  
  /**
   * 
   * @param fileName
   * @param ss
   * @throws IOException
   */
  public static void write(String fileName, String[] ss) throws IOException {
    write(fileName, ss, FileCommonConstants.DEFAULT_CHARSET_NAME);
  }
  

  /**
   * 
   * @param fileName
   * @param ss
   * @param charsetName
   * @throws IOException
   */
  public static void write(String fileName, String[] ss, String charsetName) throws IOException {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < ss.length; i++) {
      sb.append(ss[i]).append(System.lineSeparator());
    }

    write(fileName, sb.toString(), charsetName);
  }

}
