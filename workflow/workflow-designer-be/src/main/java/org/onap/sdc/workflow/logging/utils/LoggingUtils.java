package org.onap.sdc.workflow.logging.utils;

import org.openecomp.sdc.logging.api.AuditData;
import org.openecomp.sdc.logging.api.ContextData;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.openecomp.sdc.logging.api.LoggingContext;
import org.openecomp.sdc.logging.api.StatusCode;
import org.openecomp.sdc.logging.servlet.HttpHeader;
import org.springframework.stereotype.Component;
import  org.openecomp.sdc.logging.api.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.UUID;

import static org.openecomp.sdc.logging.LoggingConstants.DEFAULT_PARTNER_NAME_HEADER;
import static org.openecomp.sdc.logging.LoggingConstants.DEFAULT_REQUEST_ID_HEADER;
import static org.openecomp.sdc.logging.api.StatusCode.COMPLETE;
import static org.openecomp.sdc.logging.api.StatusCode.ERROR;

@Component
public class LoggingUtils {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    public static final String START_TIME_KEY = "audit.start.time";
    private HttpHeader requestIdHeader = new HttpHeader(DEFAULT_REQUEST_ID_HEADER);
    private HttpHeader partnerNameHeader = new HttpHeader(DEFAULT_PARTNER_NAME_HEADER);

    public void logResponse(HttpServletRequest request, HttpServletResponse response) {
        writeAudit(request, response);
    }

    private StatusCode getStatusCode(HttpServletResponse response) {
        return isSuccess(response.getStatus()) ? COMPLETE : ERROR;
    }

    private String getReasonPhrase(int code) {
        return Status.getReason(code);
    }

    private long getStartTime(HttpServletRequest request) {
        return Long.class.cast(request.getAttribute(START_TIME_KEY));
    }
    public void logRequest(HttpServletRequest request) {
        LoggingContext.clear();
        ContextData.ContextDataBuilder contextData = ContextData.builder();
        contextData.serviceName(createServiceName(request));

        String partnerName = partnerNameHeader.getAny(request::getHeader);
        if (partnerName != null) {
            contextData.partnerName(partnerName);
        }

        String requestId = requestIdHeader.getAny(request::getHeader);
        contextData.requestId(requestId == null ? UUID.randomUUID().toString() : requestId);

        LoggingContext.put(contextData.build());
    }

    private String createServiceName(HttpServletRequest request) {
        return request.getMethod() + " " + request.getServletPath();
    }

    private void writeAudit(HttpServletRequest request,
                            HttpServletResponse response) {

        if (!logger.isAuditEnabled()) {
            return;
        }

        long start = getStartTime(request);
        long end = System.currentTimeMillis();

        int responseCode = response.getStatus();
        StatusCode statusCode = getStatusCode(response);
        AuditData auditData = AuditData.builder()
                .startTime(start)
                .endTime(end)
                .statusCode(statusCode)
                .responseCode(Integer.toString(responseCode))
                .responseDescription(getReasonPhrase(responseCode))
                .clientIpAddress(request.getRemoteAddr()).build();
        logger.audit(auditData);
    }

    private boolean isSuccess(int responseCode) {
        return responseCode > 199 && responseCode < 400;
    }
}
