package org.onap.sdc.workflow.api.swagger;

import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;

import com.fasterxml.classmate.TypeResolver;
import com.google.common.base.Optional;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import springfox.documentation.service.ResolvedMethodParameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.ParameterBuilderPlugin;
import springfox.documentation.spi.service.contexts.ParameterContext;
import springfox.documentation.swagger.common.SwaggerPluginSupport;

@Component
@Order(SwaggerPluginSupport.SWAGGER_PLUGIN_ORDER + 1000)
public class UserIdReader implements ParameterBuilderPlugin {

    private static final String HEADER = "header";
    private final TypeResolver resolver;

    public UserIdReader(TypeResolver resolver) {
        this.resolver = resolver;
    }

    @Override
    public void apply(ParameterContext parameterContext) {
        ResolvedMethodParameter methodParameter = parameterContext.resolvedMethodParameter();
        Optional<UserId> requestParam = methodParameter.findAnnotation(UserId.class);
        if (requestParam.isPresent()) {
            parameterContext.parameterBuilder().parameterType(HEADER).name(USER_ID_HEADER)
                            .type(resolver.resolve(String.class));
        }
    }

    @Override
    public boolean supports(DocumentationType documentationType) {
        return true;
    }
}
