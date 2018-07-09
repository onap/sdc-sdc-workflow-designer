package org.onap.sdc.workflow.api;

public class RestConstants {

    private RestConstants() {
    }

    public static final String USER_ID_HEADER_PARAM = "USER_ID";
    public static final String LIMIT_PARAM = "limit";
    public static final String OFFSET_PARAM = "offset";
    public static final String SORT_PARAM = "sort";
    public static final String SORT_ORDER_PARAM = "sort";
    public static final String SORT_FIELD_NAME = "name";
    public static final String SORT_ORDER_ASC = "asc";
    public static final String SORT_ORDER_DESC = "desc";
    public static final String SORT_VALUE_SEPARATOR = ":";
    public static final int LIMIT_MIN = 0;
    public static final int LIMIT_DEFAULT = 35;
    public static final int OFFSET_MIN = 0;
}
