package org.onap.sdc.workflow;

import static org.onap.sdc.workflow.api.RestConstants.SIZE_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.PAGE_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.SORT_PARAM;

public class RestPath {

    private RestPath() {
        //Hiding implicit constructor
    }

    private static final String WORKFLOWS_URL = "/workflows";
    public static final String WORKFLOWS_WITH_VERSION_STATE_FILTER_URL = WORKFLOWS_URL + "?versionState=%s";
    private static final String WORKFLOW_URL_FORMATTER = WORKFLOWS_URL + "/%s";
    private static final String VERSIONS_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions";
    private static final String VERSION_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions/%s";
    private static final String SORT_QUERY_STRING_FORMATTER = SORT_PARAM + "=%s";
    private static final String SIZE_QUERY_STRING_FORMATTER = SIZE_PARAM + "=%s";
    private static final String OFFSET_QUERY_STRING_FORMATTER = PAGE_PARAM + "=%s";
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_ALL =
            WORKFLOWS_URL + "?" + SORT_QUERY_STRING_FORMATTER+ "&" +  SIZE_QUERY_STRING_FORMATTER + "&" +
                    OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT =
            WORKFLOWS_URL + "?" + SIZE_QUERY_STRING_FORMATTER + "&" + OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_SIZE =
            WORKFLOWS_URL + "?" + OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_OFFSET =
            WORKFLOWS_URL + "?" + SIZE_QUERY_STRING_FORMATTER;

    public static String getWorkflowsPathAllQueryParams(String sort, String size, String offset){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_ALL, sort, size, offset);
    }

    public static String getWorkflowsPathNoSort(String size, String offset){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT, size, offset);
    }

    public static String getWorkflowsPathNoSortAndSize(String offset){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_SIZE, offset);
    }

    public static String getWorkflowsPathNoSortAndOffset(String size){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_OFFSET, size);
    }

    public static String getWorkflowsPath() {
        return WORKFLOWS_URL;
    }

    public static String getWorkflowsWithVersionStateFilterPath(String versionState) {
        return String.format(WORKFLOWS_WITH_VERSION_STATE_FILTER_URL, versionState);
    }

    public static String getWorkflowPath(String workflowId) {
        return String.format(WORKFLOW_URL_FORMATTER, workflowId);
    }

    public static String getWorkflowVersions(String workflowId) {
        return String.format(VERSIONS_URL_FORMATTER, workflowId);
    }

    public static String getWorkflowVersion(String workflowId, String versionId) {
        return String.format(VERSION_URL_FORMATTER, workflowId, versionId);
    }
}
