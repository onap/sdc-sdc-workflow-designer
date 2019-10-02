/*
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow;

import static org.onap.sdc.workflow.api.RestParams.LIMIT;
import static org.onap.sdc.workflow.api.RestParams.OFFSET;
import static org.onap.sdc.workflow.api.RestParams.SORT;

public class RestPath {

    private RestPath() {
        //Hiding implicit constructor
    }

    private static final String WORKFLOWS_URL = "/wf/workflows";
    private static final String WORKFLOW_URL_FORMATTER = WORKFLOWS_URL + "/%s";
    private static final String ARCHIVE_URL_FORMATTER = WORKFLOWS_URL + "/%s/archiving";
    private static final String VERSIONS_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions";
    private static final String VERSION_URL_FORMATTER = WORKFLOWS_URL + "/%s/versions/%s";
    private static final String SORT_QUERY_STRING_FORMATTER = SORT + "=%s";
    private static final String LIMIT_QUERY_STRING_FORMATTER = LIMIT + "=%s";
    private static final String OFFSET_QUERY_STRING_FORMATTER = OFFSET + "=%s";
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_ALL =
            WORKFLOWS_URL + "?" + SORT_QUERY_STRING_FORMATTER+ "&" +  LIMIT_QUERY_STRING_FORMATTER + "&" +
                    OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_LIMIT =
            WORKFLOWS_URL + "?" + OFFSET_QUERY_STRING_FORMATTER;
    private static final String WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_OFFSET =
            WORKFLOWS_URL + "?" + LIMIT_QUERY_STRING_FORMATTER;

    public static String getWorkflowsPathAllQueryParams(String sort, String limit, String offset) {
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_ALL, sort, limit, offset);
    }

    public static String getWorkflowsPathNoSortAndLimit(String offset) {
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_LIMIT, offset);
    }

    public static String getWorkflowsPathNoSortAndOffset(String limit) {
        return String.format(WORKFLOW_URL_FORMATTER_QUERY_PARAMS_NO_SORT_AND_OFFSET, limit);
    }

    public static String getWorkflowsPath() {
        return WORKFLOWS_URL;
    }

    public static String getWorkflowPath(String workflowId) {
        return String.format(WORKFLOW_URL_FORMATTER, workflowId);
    }

    public static String getArchiveWorkflowPath(String workflowId) {
        return String.format(ARCHIVE_URL_FORMATTER, workflowId);
    }

    public static String getWorkflowVersions(String workflowId) {
        return String.format(VERSIONS_URL_FORMATTER, workflowId);
    }

    public static String getWorkflowVersion(String workflowId, String versionId) {
        return String.format(VERSION_URL_FORMATTER, workflowId, versionId);
    }
}
