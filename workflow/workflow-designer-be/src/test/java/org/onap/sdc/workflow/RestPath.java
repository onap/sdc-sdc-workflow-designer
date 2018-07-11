package org.onap.sdc.workflow;

public class RestPath {
    private static final String WORKFLOWS_URL = "/workflows";
    private static final String WORKFLOW_URL_FORMATTER = WORKFLOWS_URL + "/%s";
    private static final String VERSIONS_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions";
    private static final String VERSION_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions/%s";

    public static String getWorkflowsPath(){
        return WORKFLOWS_URL;
    }

    public static String getWorkflowPath(String workflowId){
        return String.format(WORKFLOW_URL_FORMATTER, workflowId);
    }

    public static String getWorkflowVersions(String workflowId){
        return String.format(VERSIONS_URL_FORMATTER, workflowId);
    }

    public static String getWorkflowVersion(String workflowId, String versionId){
        return String.format(VERSION_URL_FORMATTER, workflowId, versionId);
    }
}
