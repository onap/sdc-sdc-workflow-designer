package org.onap.sdc.workflowdesigner.config;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Config {
	private static Logger log = LoggerFactory.getLogger(Config.class);
	private static String configFilePath = "bpmn.config.properties";
	public static String HANDLER_ClASS = "handlerClass";
	public static String TEMPLATE_PATH = "templatePath";
	
	public static Properties PROPERTIES = load();
	
	public static Properties load() {
		Properties properties = new Properties();
		InputStream in = null;
		try {
			in = Config.class.getClassLoader().getResourceAsStream(configFilePath);
			properties.load(in);
		} catch (FileNotFoundException e) {
			log.error(configFilePath, e);
		} catch (IOException e) {
			log.error(configFilePath, e);
		} catch (Exception e) {
			log.error(configFilePath, e);
		} finally {
			if(in != null) {
				try {
					in.close();
				} catch (IOException e) {
					log.error(configFilePath, e);
				}
			}
		}
		
		return properties;
	}
}
