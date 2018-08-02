package org.onap.sdc.workflow;

import static org.onap.sdc.workflow.api.RestParams.LIMIT;
import static org.onap.sdc.workflow.api.RestParams.OFFSET;
import static org.onap.sdc.workflow.api.RestParams.SORT;

public class RestPath {

    private RestPath() {
        //Hiding implicit constructor
    }

    private static final String WORKFLOWS_URL = "/workflows";
    public static final String WORKFLOWS_WITH_VERSION_STATE_FILTER_URL = WORKFLOWS_URL + "?versionState=%s";
    private static final String WORKFLOW_URL_FORMATTER = WORKFLOWS_URL + "/%s";
    private static final String VERSIONS_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions";
    private static final String VERSION_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions/%s";
    private static final String SORT_QUERY_STRING_FORMATTER = SORT + "=%s";
    private static final String LIMIT_QUERY_STRING_FORMATTER = LIMIT + "=%s";
    private static final String OFFSET_QUERY_STRING_FORMATTER = OFFSET + "=%s";
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_ALL =
            WORKFLOWS_URL + "?" + SORT_QUERY_STRING_FORMATTER+ "&" +  LIMIT_QUERY_STRING_FORMATTER + "&" +
                    OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT =
            WORKFLOWS_URL + "?" + LIMIT_QUERY_STRING_FORMATTER + "&" + OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_LIMIT =
            WORKFLOWS_URL + "?" + OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_OFFSET =
            WORKFLOWS_URL + "?" + LIMIT_QUERY_STRING_FORMATTER;

    public static String getWorkflowsPathAllQueryParams(String sort, String limit, String offset){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_ALL, sort, limit, offset);
    }

    public static String getWorkflowsPathNoSort(String limit, String offset){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT, limit, offset);
    }

    public static String getWorkflowsPathNoSortAndLimit(String offset){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_LIMIT, offset);
    }

    public static String getWorkflowsPathNoSortAndOffset(String limit){
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_OFFSET, limit);
    }

    public static String getWorkflowsPath() {
        return WORKFLOWS_URL;
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
