/*
 * Copyright © 2018 European Support Limited
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

package org.onap.sdc.workflow.api.swagger;

import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;

import com.fasterxml.classmate.TypeResolver;
import java.util.Optional;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import springfox.documentation.service.ResolvedMethodParameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.ParameterBuilderPlugin;
import springfox.documentation.spi.service.contexts.ParameterContext;
import springfox.documentation.swagger.common.SwaggerPluginSupport;

/**
 * This component is neccesary because swagger cannot find a custom annotations in API.
 * This is needed to find specifically the {@link UserId} annotation
 */
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
