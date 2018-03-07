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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * common utility class.
 * 
 */
public class FileCommonUtils {
  private static final Logger logger = LoggerFactory.getLogger(FileCommonUtils.class);

  private static final int KILO_BYTE = 1024; // 1K
  private static final int MEGA_BYTE = 1024 * 1024; // 1M
  private static final int GIGA_BYTE = 1024 * 1024 * 1024; // 1G

  private static final int TRY_COUNT = 3;

  /**
   * 
   * @param srcAbsolutePath
   * @param destAbsolutePath
   */
  public static void rename(String srcAbsolutePath, String destAbsolutePath) {
    File dest = new File(destAbsolutePath);
    new File(srcAbsolutePath).renameTo(dest);
  }

  /**
   * 
   * @param filePath
   * @return
   */
  public static String getFileName(String filePath) {
    return new File(filePath).getName();
  }

  /**
   * 
   * @param filePath
   * @return
   */
  public static String getFilePath(String filePath) {
    return new File(filePath).getParent();
  }

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
   * @param sourecePath
   * @param targetPath
   * @throws IOException
   */
  public static void copy(Path sourecePath, Path targetPath) throws IOException {
    if (!sourecePath.toFile().exists()) {
      return;
    }

    if (Files.isDirectory(sourecePath)) {
      List<Path> paths = list(sourecePath);
      for (Path path : paths) {
        copy(path, targetPath.resolve(path.getFileName()));
      }

      return;
    }

    if (!targetPath.getParent().toFile().exists()) {
      targetPath.getParent().toFile().mkdirs();
    }
    Files.copy(sourecePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
  }

  /**
   * create folder.
   * 
   * @param path folder path to create
   * @return boolean
   */
  public static boolean createDirectory(String path) {
    File folder = new File(path);
    int tryCount = 0;
    while (tryCount < FileCommonUtils.TRY_COUNT) {
      tryCount++;
      if (!folder.exists() && !folder.mkdirs()) {
        continue;
      } else {
        return true;
      }
    }

    return folder.exists();
  }

  /**
   * delete the file and file directory.
   * 
   * @param file file
   * @return boolean
   */
  public static void delete(File file) {
    logger.info("delete file = {}", file);

    if (file.isDirectory()) {
      String[] children = file.list();
      if (children != null) {
        for (int i = 0; i < children.length; i++) {
          delete(new File(file, children[i]));
        }
      }
    }

    deleteFile(file);
  }

  /**
   * 
   * @param file
   */
  public static void deleteFile(File file) {
    logger.info("deleteFile file = {}", file);

    try {
      FileUtils.forceDelete(file);
    } catch (IOException e) {
      logger.warn("deleteFile error. {}", file, e);
    }
  }

  public static String formatFileSize(double fileLength, int fileUnit) {
    DecimalFormat format = new DecimalFormat("#0.00");
    return format.format(fileLength / fileUnit) + "M";
  }

  /**
   * get file size.
   * 
   * @param file file which to get the size
   * @param fileUnit file unit
   * @return String file size
   */
  public static String getFileSize(File file, int fileUnit) {
    String fileSize = "";
    DecimalFormat format = new DecimalFormat("#0.00");
    if (file.exists()) {
      fileSize = format.format((double) file.length() / fileUnit) + "M";
    }
    return fileSize;
  }

  /**
   * get file size by content.
   * 
   * @param contentRange content range
   * @return String
   */
  public static String getFileSizeByContent(String contentRange) {
    String size =
        contentRange.substring(contentRange.indexOf("/") + 1, contentRange.length()).trim();
    return formatFileSize(Double.parseDouble(size), MEGA_BYTE);
  }

  /**
   * get the size format according file size.
   * 
   * @param fileSize file size
   * @return size format
   */
  public static String getFormatFileSize(long fileSize) {
    if (fileSize >= GIGA_BYTE) {
      return String.format("%.1f GB", (float) fileSize / (long) GIGA_BYTE);
    } else if (fileSize >= MEGA_BYTE) {
      float fi = (float) fileSize / (long) MEGA_BYTE;
      return String.format(fi > 100 ? "%.0f MB" : "%.1f MB", fi);
    } else if (fileSize >= KILO_BYTE) {
      float fi = (float) fileSize / (long) KILO_BYTE;
      return String.format(fi > 100 ? "%.0f KB" : "%.1f KB", fi);
    } else {
      return String.format("%d B", fileSize);
    }
  }

  public static long getFileSize(String path) {
    return getFileSize(new File(path));
  }

  /**
   * 
   * @param file
   * @return
   */
  public static long getFileSize(final File file) {
    if (file.isFile()) {
      return file.length();
    }

    final File[] children = file.listFiles();
    long total = 0;
    if (children != null) {
      for (final File child : children) {
        total += getFileSize(child);
      }
    }

    return total;
  }

  /**
   * 
   * @param path
   * @return
   * @throws IOException
   */
  public static List<Path> list(Path path) throws IOException {
    if (!path.toFile().isDirectory()) {
      return new ArrayList<>();
    }

    List<Path> list = new ArrayList<>();
    DirectoryStream<Path> ds = null;
    try {
      ds = Files.newDirectoryStream(path);
      for (Path p : ds) {
        list.add(p);
      }
    } finally {
      if (ds != null) {
        ds.close();
      }
    }

    return list;
  }

  /**
   * @param path
   * @return
   * @throws IOException
   */
  public static List<String> listFileName(Path path) throws IOException {
    List<String> list = new ArrayList<>();
    DirectoryStream<Path> ds = null;
    try {
      ds = Files.newDirectoryStream(path);
      for (Path p : ds) {
        list.add(p.getFileName().toString());
      }
    } finally {
      if (ds != null) {
        ds.close();
      }
    }

    return list;
  }

  /**
   * 
   * @param srcPath
   * @param destPath
   * @throws IOException
   */
  public static void moveDirectory(String srcPath, String destPath) throws IOException {
    File destDirectory = new File(destPath);
    File srcDirectory = new File(srcPath);
    FileUtils.deleteDirectory(destDirectory);
    FileUtils.copyDirectory(srcDirectory, destDirectory);
    FileUtils.deleteDirectory(srcDirectory);
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

    write(sb.toString(), fileName, charsetName);
  }

  /**
   * 
   * @param rootPath
   * @param more
   * @return
   */
  public static String buildAbsolutePath(String rootPath, String... more) {
    Path absolutePath = Paths.get(rootPath, more);
    return absolutePath.toFile().getAbsolutePath();
  }

}
