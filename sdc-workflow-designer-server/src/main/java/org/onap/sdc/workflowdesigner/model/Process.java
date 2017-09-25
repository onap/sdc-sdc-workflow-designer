package org.onap.sdc.workflowdesigner.model;

import java.util.ArrayList;
import java.util.List;

public class Process {
	private String id;
	private boolean isExecutable;
	private List<Element> elementList = new ArrayList<Element>();
	private List<SequenceFlow> sequenceFlowList = new ArrayList<SequenceFlow>();
	private List<DataObject> dataObjectList = new ArrayList<DataObject>();
	
	public Process(String id) {
		this.id = id;
	}
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public boolean isExecutable() {
		return isExecutable;
	}
	public void setExecutable(boolean isExecutable) {
		this.isExecutable = isExecutable;
	}
	public List<Element> getElementList() {
		return elementList;
	}
	public void setElementList(List<Element> elementList) {
		this.elementList = elementList;
	}
	public List<SequenceFlow> getSequenceFlowList() {
		return sequenceFlowList;
	}
	public void setSequenceFlowList(List<SequenceFlow> sequenceFlowList) {
		this.sequenceFlowList = sequenceFlowList;
	}

	public List<DataObject> getDataObjectList() {
		return dataObjectList;
	}

	public void setDataObjectList(List<DataObject> dataObjectList) {
		this.dataObjectList = dataObjectList;
	}

}
