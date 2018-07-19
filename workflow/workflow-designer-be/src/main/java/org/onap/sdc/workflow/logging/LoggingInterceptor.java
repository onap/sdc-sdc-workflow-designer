package org.onap.sdc.workflow.logging;

import org.onap.sdc.workflow.logging.utils.LoggingUtils;
import org.openecomp.sdc.logging.api.LoggingContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class LoggingInterceptor extends HandlerInterceptorAdapter {

    @Autowired
    LoggingUtils loggingUtils;

    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                @Nullable Exception ex) throws Exception {
        if (!(response instanceof ContentCachingResponseWrapper)) {
            response = new ContentCachingResponseWrapper(response);
        }
        try {
            loggingUtils.logResponse(request, response);
        } finally {
            LoggingContext.clear();
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object object) throws Exception {
        request.setAttribute(LoggingUtils.START_TIME_KEY, System.currentTimeMillis());
        loggingUtils.logRequest(request);
        return true;
    }

}
